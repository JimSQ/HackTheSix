var accessToken = "f5c36cec32f64f61a0fdf426d25fce51",
    investApiKey = "YTG3TTH2PRUNCIVQ",
    baseUrl = "https://api.api.ai/v1/",
    $speechInput,
    $recBtn,
    recognition,

    messageRecording = "Recording...",
    messageCouldntHear = "I couldn't hear you, could you say that again?",
    messageInternalError = "Oh no, there has been an internal server error",
    messageSorry = "I'm sorry, I don't have the answer to that yet.";

$(document).ready(function() {
    $speechInput = $("#speech");
    $recBtn = $("#rec");
    $speechInput.keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            send();
        }
    });
    $recBtn.on("click", function(event) {
        switchRecognition();
    });
    $(".debug__btn").on("click", function() {
        $(this).next().toggleClass("is-active");
        return false;
    });
});

function startRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = function(event) {
        respond(messageRecording);
        updateRec();
    };
    recognition.onresult = function(event) {
        recognition.onend = null;
        var text = "";
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
        }
        setInput(text);
        stopRecognition();
    };
    recognition.onend = function() {
        respond(messageCouldntHear);
        stopRecognition();
    };
    recognition.lang = "en-US";
    recognition.start();
}

function stopRecognition() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    updateRec();
}

function switchRecognition() {
    if (recognition) {
        stopRecognition();
    } else {
        startRecognition();
    }
}

function setInput(text) {
    $speechInput.val(text);
    send();
}

function updateRec() {
    $recBtn.text(recognition ? "Stop" : "Speak");
}

function send() {
    var text = $speechInput.val();
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
            respond(messageInternalError);
        }
    });
}

function prepareResponse(val) {
    var debugJSON = JSON.stringify(val, undefined, 2);
    callAPI(val);
    //- respond(spokenResponse);
    debugRespond(debugJSON);
}

function callAPI(val) {
    if (val.result.parameters.symbol == "") {
        respond("", "Bad Values...");
        return;
    }
    var params = val.result.parameters.params;
    var arr = params.split(',');
    var urlExt = "";
    for (var i = 0; i < arr.length; i++) {
        urlExt += "&" + arr[i] + "=" + val.result.parameters[arr[i]];
    }
    urlExt = urlExt.substring(1);
    console.log(urlExt);
    var location = val.result.parameters.location;
    var URL = "https://www.alphavantage.co/query?" + urlExt + "&apikey=" + investApiKey
    var apiData;
    $.get(URL, function(data, status) {
        arr = location.split(',');
        for (var i = 0; i < arr.length; i++) {
            console.log(JSON.stringify(data));
            if (arr[i][0] == '#') {
                if (val.result.parameters[arr[i].substring(1)] != null) {
                    console.log(":*)" + data[val.result.parameters[arr[i].substring(1)]]);
                    if (data[val.result.parameters[arr[i].substring(1)]] == undefined) {
                        console.log("undefined :)");
                        data = data[Object.keys(data)[0]];
                    } else {
                        data = data[val.result.parameters[arr[i].substring(1)]];
                    }
                } else {
                    //Is null, go first
                    console.log("kl");
                    data = data[Object.keys(data)[0]];
                }
            } else {
                console.log(arr[i]);
                if (data[arr[i]] == undefined) {
                    data = data[Object.keys(data)[0]];
                } else {
                    data = data[arr[i]];
                }
            }
        }
        apiData = JSON.stringify(data, undefined, 2);
        //- alert("URL:" + URL + " Data: " + apiData + "\nStatus: " + status);
        respond(apiData, val.result.speech);
    });
}

function parseParams(val) {

}

function debugRespond(val) {
    $("#response").text(val);
}

function respond(val, template) {
    if (val == "") {
        val = messageSorry;
    }
    if (val !== messageRecording) {
        var msg = new SpeechSynthesisUtterance();
        msg.voiceURI = "native";
        msg.text = val;
        msg.lang = "en-US";
        window.speechSynthesis.speak(msg);
    }
    $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(template.replace("$output", val.replace('"', "$").replace('"', ".")));
}