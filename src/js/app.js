var accessToken = "f5c36cec32f64f61a0fdf426d25fce51",
    investApiKey = "YTG3TTH2PRUNCIVQ",
    baseUrl = "https://api.api.ai/v1/",
    $input,
    histPosition = 0;

//For previous command tracking
var hist;

$(document).ready(function() {
    $input = $("#input");
    $goBtn = $("#go");
    hist = [];
    $input.keydown(function(event) {
        if (event.which == 13) {
            //Enter key
            event.preventDefault();
            send();
        } else if (event.which == 38) {
            //Up key for recalling previous commands
            histPosition += histPosition < hist.length ? 1 : 0;
            $('#input').val(hist[hist.length - histPosition]);
        } else if (event.which == 40) {
            //Down key for retrieving newer commands
            histPosition -= histPosition > 0 ? 1 : 0;
            $('#input').val(hist[hist.length - histPosition]);
        }
    });
    $goBtn.on("click", function(event) {
        send();
    });
    $(".debug__btn").on("click", function() {
        //Debugging button
        $(this).next().toggleClass("is-active");
        return false;
    });
});

function send() {
    var text = $input.val();
    //Changing UI elements
    $("#response").addClass("is-active").find(".response__text").append("[User]: " + text + "\n");
    $("#logo").css("opacity", "20%").css("font-size", "3.5rem");
    $('.response__text').scrollTop($('.response__text')[0].scrollHeight);
    $('#input').attr("placeholder", "Feed me");
    hist.push(text);
    histPosition = 0;
    $('#input').val('');
    if (text == "") {
        //Error checking
        respond("", "Please type something...");
        return;
    }
    //Sending the request to API.AI
    $.ajax({
        type: "POST",
        url: baseUrl + "query",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        data: JSON.stringify({ query: text, lang: "en", sessionId: "yaydevdiner" }),
        success: function(data) {
            prepareResponse(data);
        },
        error: function() {
            respond("", "An Error has Occurred.");
        }
    });
}

function prepareResponse(val) {
    //Gets JSON for debugging
    var debugJSON = JSON.stringify(val, undefined, 2);
    debugRespond(debugJSON);
    //Calls the financial data api
    callAPI(val);
}

function isEmpty(object) { for (var i in object) { return true; } return false; }

function callAPI(val) {
    //Error checking
    if (Object.getOwnPropertyNames(val).length == 0) {
        respond("", "Please Type Something...");
        return;
    }
    if (Object.getOwnPropertyNames(val.result.parameters).length == 0) {
        respond("", val.result.speech);
        return;
    }
    if (val.result.parameters.symbol == "") {
        respond("", val.result.speech);
        return;
    }
    //Retrieves data from API.AI and sends them to the alphaavantage API dynamically
    var params = val.result.parameters.params;
    var arr = params.split(',');
    var urlExt = "";
    for (var i = 0; i < arr.length; i++) {
        //Generates GET parameters from API.AI
        urlExt += "&" + arr[i] + "=" + val.result.parameters[arr[i]];
    }
    urlExt = urlExt.substring(1);
    var location = val.result.parameters.location;
    var URL = "https://www.alphavantage.co/query?" + urlExt + "&apikey=" + investApiKey
    var apiData;
    $.get(URL, function(data, status) {
        arr = location.split(',');
        //Searches in the returned object for the requested value
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0] == '#') {
                if (val.result.parameters[arr[i].substring(1)] != null) {
                    if (data[val.result.parameters[arr[i].substring(1)]] == undefined) {
                        data = data[Object.keys(data)[0]];
                    } else {
                        data = data[val.result.parameters[arr[i].substring(1)]];
                    }
                } else {
                    //Is null, go first
                    data = data[Object.keys(data)[0]];
                }
            } else {
                if (data[arr[i]] == undefined) {
                    data = data[Object.keys(data)[0]];
                } else {
                    data = data[arr[i]];
                }
            }
        }
        apiData = JSON.stringify(data, undefined, 2);
        respond(apiData, val.result.speech);
    });
}

function debugRespond(val) {
    $("#debug_response").text(val);
}

function respond(response, template) {
    //Print response
    if (response == "") {
        response = "Please type something...";
    }
    $("#response").addClass("is-active").find(".response__text").append("[Investormate]: " + template.replace("$output", response.replace('"', "").replace('"', ".")) + "\n");
}