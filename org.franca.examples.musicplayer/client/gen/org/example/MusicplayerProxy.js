function MusicplayerProxy() {
	this.socket = null;
	this.callID = 0;
}

MusicplayerProxy.prototype.getNextCallID = function() {
	this.callID = this.callID + 1;
	return this.callID;
};

// call to get the value of currentTrack asynchronously
MusicplayerProxy.prototype.getCurrentTrack = function() {
	var cid = this.getNextCallID();
	this.socket.send('[2, "get:currentTrack:' + cid + '", "get:currentTrack"]');
	return cid;
};

// call this method to subscribe for the changes of the attribute currentTrack
MusicplayerProxy.prototype.subscribeCurrentTrackChanged = function() {
	this.socket.send('[5, "signal:currentTrack"]');
};

// call this method to unsubscribe from the changes of the attribute currentTrack
MusicplayerProxy.prototype.unsubscribeCurrentTrackChanged = function() {
	this.socket.send('[6, "signal:currentTrack"]');
};

// call this method to invoke findTrackByTitle on the server side
MusicplayerProxy.prototype.findTrackByTitle = function(title) {
	var cid = this.getNextCallID();
	this.socket.send('[2, "invoke:findTrackByTitle:' + cid + '", "invoke:findTrackByTitle", ' + JSON.stringify({"title" : title}) + ']');
	return cid;
};
// call this method to invoke play on the server side
MusicplayerProxy.prototype.play = function() {
	var cid = this.getNextCallID();
	this.socket.send('[2, "invoke:play:' + cid + '", "invoke:play"' + ']');
	return cid;
};
// call this method to invoke pause on the server side
MusicplayerProxy.prototype.pause = function() {
	var cid = this.getNextCallID();
	this.socket.send('[2, "invoke:pause:' + cid + '", "invoke:pause"' + ']');
	return cid;
};

MusicplayerProxy.prototype.connect = function(address) {
	var _this = this;
	
	// create WebSocket for this proxy	
	_this.socket = new WebSocket(address);

	_this.socket.onopen = function () {
		// subscribing for all broadcasts
		if (typeof(_this.onOpened) === "function") {
			_this.onOpened();
		}
	};

	_this.socket.onerror = function () {
		if (typeof(_this.onError) === "function") {
			_this.onError();
		}
	};

	// store reference for this proxy in the WebSocket object
	_this.socket.proxy = _this;
	
	_this.socket.onclose = function(event) {
		if (typeof(_this.onClosed) === "function") {
			_this.onClosed(event);
		}
	};
	
	_this.socket.onmessage = function(data) {
		var message = JSON.parse(data.data);
		if (Array.isArray(message)) {
			var messageType = message.shift();
			
			// handling of CALLRESULT messages
			if (messageType === 3 || messageType === 4) {
				var tokens = message.shift().split(":");
				var mode = tokens[0];
				var name = tokens[1];
				var cid = tokens[2];
				
				if (mode === "get") {
					if (name === "currentTrack" && typeof(_this.onGetCurrentTrack) === "function") {
						_this.onGetCurrentTrack(cid, message);
					}
				}
				else if (mode === "set") {
					if (name === "currentTrack" && typeof(_this.onSetCurrentTrack) === "function") {
						// no message is passed
						_this.onSetCurrentTrack(cid);
					}
				}
				else if (mode === "invoke") {
					if (name === "findTrackByTitle") {
						if (messageType === 3 && typeof(_this.replyFindTrackByTitle) === "function") {
							_this.replyFindTrackByTitle(cid);
						} else if (messageType === 4 && typeof(_this.errorFindTrackByTitle) === "function") {
							var error = message[1];
							_this.errorFindTrackByTitle(cid, error);
						}
					}
					if (name === "play") {
						if (messageType === 3 && typeof(_this.replyPlay) === "function") {
							_this.replyPlay(cid);
						}
					}
					if (name === "pause") {
						if (messageType === 3 && typeof(_this.replyPause) === "function") {
							_this.replyPause(cid);
						}
					}
				}
			}
			// handling of EVENT messages
			else if (messageType === 8) {
				var topicURI = message.shift();
				var data = message.shift();
				if (topicURI === "signal:currentTrack" && typeof(_this.onChangedCurrentTrack) === "function") {
					_this.onChangedCurrentTrack(data);
				}
			}
		}
	};	
};

