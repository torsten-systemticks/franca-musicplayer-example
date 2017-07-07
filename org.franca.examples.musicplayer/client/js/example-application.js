/*******************************************************************************
* Copyright (c) 2017 itemis AG (http://www.itemis.de).
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*******************************************************************************/

// switch page programmatically: $.mobile.changePage("#pNav")

function initApp() {
	// initialize proxy for Musicplayer interface
	var proxy = new MusicplayerProxy();
	proxy.connect('ws://localhost:8181');

	proxy.onError = function() {
		console.log('The connection reported an error!');
		document.getElementById('current-title').innerHTML = 'ERROR: No connection to server, please try to refresh page.';
	}
	
	proxy.onOpened = function() {
		console.log('The connection has been opened!');
		proxy.subscribeCurrentTrackChanged();
	}
	
	proxy.onClosed = function(event) {
		console.log('The connection has been closed (code ' + event.code + ')!');
	}

	// register callback for SimpleUI.onChangedClock() updates
	proxy.onChangedCurrentTrack = function(trackInfo) {
		console.log("trackInfo: " + JSON.stringify(trackInfo));
		for(var k in trackInfo) {
			console.log("  X: " + k);

		}
		document.getElementById('current-title').innerHTML = trackInfo.interpret + ': ' + trackInfo.title;
	};

	// register callback for SimpleUI.playingTitle() broadcast
	proxy.signalPlayingTitle = function(title) {
		document.getElementById('current-title').innerHTML = title;
	};

	// register callback for SimpleUI.updateVelocity() broadcast
	proxy.signalUpdateVelocity = function(velocity) {
		tacho.set(velocity);
	};
	
	// connect UI buttons with playMusic() calls
	$("#mPlay").click(function() { proxy.play(); });
	$("#mPause").click(function() { proxy.pause(); });

	$(document).on( "pageinit", "#pHome", function() {
		$("#mFind").click(function() {
			proxy.findTrackByTitle(document.getElementById("title").value);
		});

		// register callback for SimpleUI.startNavigation() replies
		proxy.replyStartNavigation = function(cid, routeLength) {
			$('#navresult').text("Distance to destination: " + routeLength + " km");
		};

	});
}


function initFixedHeaders() {
	jQuery.fn.headerOnAllPages = function() {
		var theHeader = $('#constantheader-wrapper').html();
			var allPages = $('div[pagetype="standard"]');

		for (var i = 1; i < allPages.length; i++) {
			allPages[i].innerHTML = theHeader + allPages[i].innerHTML;
		}
	};

	$(function() {
		$().headerOnAllPages();
		$( "[data-role='navbar']" ).navbar();
		$( "[data-role='header'], [data-role='footer']" ).toolbar();
	});


}
