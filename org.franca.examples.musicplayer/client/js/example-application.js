/*******************************************************************************
* Copyright (c) 2017 itemis AG (http://www.itemis.de).
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*******************************************************************************/

// switch page programmatically: $.mobile.changePage("#pNav")

function initApp() {
	showEqualizer(null);
	showCover(null);

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
		var text = "No title found!";
		if (trackInfo.interpret!=null && trackInfo.title!=null)
			text = trackInfo.interpret + ': ' + trackInfo.title;
		document.getElementById('current-title').innerHTML = text;
		showCover(trackInfo.coverURL);
		showEqualizer(null);
	};

	// play/pause buttons
	$("#mPlay").click(function() { proxy.play(); });
	proxy.replyPlay = function(cid) {
		showEqualizer("playing.gif");
	};

	$("#mPause").click(function() { proxy.pause(); });
	proxy.replyPause = function(cid) {
		showEqualizer("paused.png");
	};

	$(document).on( "pageinit", "#pHome", function() {
		$("#mFind").click(function() {
			proxy.findTrackByTitle(document.getElementById("title").value);
		});

		// register callbacks for findTrackByTitle replies
		proxy.replyFindTrackByTitle = function(cid) {
			console.log("replyFindTrackByTitle #" + cid);
		};
		proxy.errorFindTrackByTitle = function(cid, error) {
			console.log("errorFindTrackByTitle #" + cid + " error=" + error);
		};

	});
}


function showEqualizer(img) {
	if (img==null) {
		document.getElementById('equalizer').style.visibility = "hidden";
	} else {
		document.getElementById('equalizer').src = "img/" + img;
		document.getElementById('equalizer').style.visibility = "visible";
	}
}

function showCover(url) {
	if (url==null) {
		document.getElementById('cover').style.visibility = "hidden";
	} else {
		document.getElementById('cover').src = url;
		document.getElementById('cover').style.visibility = "visible";
	}
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
