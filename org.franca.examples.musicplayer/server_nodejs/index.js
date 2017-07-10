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

stub.findTrackByTitle = function(title, reply, error) {
	console.log('Searching for title ' + title + '...');

	if (title == '') {
		signalError(error, "EMPTY_INPUT");
		return;
	}

	spotifyApi.searchTracks(title)
		.then(function(data) {
			// print some information about the results
			var nFound = data.body.tracks.total;
			if (nFound>0) {
				console.log('SpotifyAPI provided ' + nFound + ' results!');

				// Go through the first page of results
				var firstPage = data.body.tracks.items;
				var mostPopular = firstPage[0];
				//console.log("FOUND: " + JSON.stringify(mostPopular));
				var info = {
					title: mostPopular.name,
					interpret: mostPopular.artists[0].name,
					coverURL: mostPopular.album.images[0].url
				};
				//console.log("found track info: " + JSON.stringify(info));
				stub.setCurrentTrack(info);

				reply("done");
			} else {
				console.log('No track found at all.');
				signalError(error, "NOT_FOUND");
			}
		}, function(err) {
			console.log('Error in SpotifyAPI: ', err.message);
			signalError(error, "NOT_FOUND");
		});
}

stub.play = function(reply) {
	reply();
}

stub.pause = function(reply) {
	reply();
}

function signalError(errorHandler, error) {
	console.log('Error: ', error);
	errorHandler(error);

	var info = { title: null, interpret: null };
	stub.setCurrentTrack(info);
}


