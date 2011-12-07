#!/usr/bin/env node
var request = require('request'),
    fs = require('fs'),
    argv = require('optimist').argv;

// Get the query
if (!argv._[0]) {
    console.log("No argument given");
    return;
}

var tweets = [],
    API_ENDPOINT = "http://search.twitter.com/search.json",
    query = argv._[0];

function makeUrl(data) {
    console.log(data.next_page);
    if (data && data.next_page) {
        return API_ENDPOINT + data.next_page;
    } else {
        return API_ENDPOINT + '?q=' + encodeURIComponent(query) + '&rpp=100';
    }
}

function doRequest(data) {
    data = data || false;

    var url = makeUrl(data);

    console.log("Getting ", url);

    request(url, function(error, response, body) {
        var json = JSON.parse(body);
        if (json.results) {
            console.log('adding results to tweets');
            tweets = tweets.concat(json.results);
        }

        // Save
        fs.writeFile('tweets.json', JSON.stringify(tweets), function(err) {
            if (err) {
                console.log("Write error!", err);
            } else {
                console.log("Written tweets.json");
            }

            if (json.next_page) {
                console.log("Next page, continue with page", json.page);
                doRequest(json);
            } else {
                console.log("No more requests?", json);
            }
        })
    });
}

function init() {
    console.log("Okay, saving tweets with query " + query + " to tweets.json");
    doRequest();
}

init();