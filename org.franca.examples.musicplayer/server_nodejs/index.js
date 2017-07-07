/*******************************************************************************
* Copyright (c) 2017 itemis AG (http://www.itemis.de).
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*******************************************************************************/

var withSpotify = false;

// create http server and listen to port 8180
// we need this to serve index.html and other files to the client
var HttpServer = require('./base/util/HttpServer');
var http = new HttpServer();
http.init(8180, '../client');

// init Spotify API
var SpotifyWebApi = require('spotify-web-api-node');
var SpotifyApiCredentials = require('./credentials/SpotifyApiCredentials');
var spotifyApi = new SpotifyWebApi(SpotifyApiCredentials);

// Retrieve an access token.
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);

    /*
	console.log("Getting artists albums...")
	spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
	  .then(function(data) {
	    console.log('Artist albums', data.body);
	  }, function(err) {
	    console.error(err);
	  });
	console.log("done.");
	*/

  }, function(err) {
        console.log('Something went wrong when retrieving an access token', err);
  });


// create websocket stub for Musicplayer interface and listen to websocket port.
var MusicplayerStub = require('./gen/org/example/MusicplayerStub');
var stub = new MusicplayerStub(8181);

// set initial values for attributes
stub.currentTrack = null;

stub.init();

stub.onClientConnected = function(clientID) {
	console.log('The ID of the newly connected client is ' + clientID);
};

stub.onClientDisconnected = function(clientID) {
	console.log('The client with ID ' + clientID + ' has disconnected');
}

stub.findTrackByTitle = function(title) {
	console.log('Searching for title ' + title + '...');

	spotifyApi.searchTracks(title)
		.then(function(data) {
			// print some information about the results
			var nFound = data.body.tracks.total;
			if (nFound>0) {
				console.log('SpotifyAPI provided ' + nFound + ' results!');

				// Go through the first page of results
				var firstPage = data.body.tracks.items;
				var mostPopular = firstPage[0];
				var info = { title: mostPopular.name, interpret: mostPopular.artists[0].name };
				//console.log("found track info: " + JSON.stringify(info));
				stub.setCurrentTrack(info);
			} else {
				//stub.
			}
		}, function(err) {
			console.log('Error in SpotifyAPI: ', err.message);
		});
}


/*
var driveTimerID = setInterval(function() {
	stub.setClock(getTime());
}, 1000);

function getTime() {
	var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec
}
*/


