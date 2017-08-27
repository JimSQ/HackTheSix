# HackTheSix Project, Personal Financial Assistant, Investormate

A chat based financial assistant built with a NodeJS, Pug, and Stylus based frontend, and API.AI and the AlphaAdvantage API for the natural language parsing and financial data provision.

## Setup

1. (sudo) npm install
1. npm install -g pug-cli
1. npm install -g stylus

## Building

```bash
npm run build-js
```

Builds and processes the files from /src and moves them to /dist.

## Deploying and Watching

To start up lite-server, run

```bash
npm run dev
```

or if its the first time, run

```bash
npm run dev-setup
```

To watch the Pug and Stylus files, run

```bash
npm run watch
```

to watch them concurrently with Concurrently :)