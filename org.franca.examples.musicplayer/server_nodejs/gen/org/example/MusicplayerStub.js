'use strict';
var log4js = require('log4js');
log4js.configure('log4js-conf.json');
var logger = log4js.getLogger('MusicplayerStub');

function MusicplayerStub(port) {
	this.wsio = require('websocket.io');
	this.socket = this.wsio.listen(port);
	this.server = new (require('../../../base/iowamp/server'))();
	this.currentTrack = null;
}

// export the "constructor" function to provide a class-like interface
module.exports = MusicplayerStub;

MusicplayerStub.prototype.getClients = function() {
	return Objects.keys(this.server.clients);
};

MusicplayerStub.prototype.setCurrentTrack = function(newValue) {
	logger.info(JSON.stringify({type: "attribute", name:'currentTrack', params:newValue}));
	this.currentTrack = newValue;
	this.server.emit('publishAll', "signal:currentTrack", newValue);
};

MusicplayerStub.prototype.init = function() {
	var _this = this;
	
	_this.socket.on('connection', function(client) {
		_this.server.onConnection(client);
		if (typeof(_this.onClientConnected) === "function") {
			_this.onClientConnected(client.id);
		}
		
		client.on('close', function() {
			if (typeof(_this.onClientDisconnected) === "function") {
				_this.onClientDisconnected(client.id);
			}
		});
	});
	
	_this.server.on('publishAll', function(topicURI, event) {
		_this.server.publishAll(topicURI, event);
	});
	
	_this.server.on('publishExcludeSingle', function(client, topicURI, event) {
		_this.server.publishExcludeSingle(client, topicURI, event);
	});
	
	_this.server.on('publishEligibleList', function(topicURI, event, eligible) {
		_this.server.publishEligibleList(topicURI, event, eligible);
	});
	
	// RPC stub for the getter of attribute currentTrack
	_this.server.rpc('get', function() {
		this.register('currentTrack', function(client, cb) {
			cb(null, _this.currentTrack);
		});
	});
	
	// RPC stub for method findTrackByTitle
	_this.server.rpc('invoke', function() {
		this.register('findTrackByTitle', function(client, cb, args) {
			logger.info(JSON.stringify({type: "request", name:'findTrackByTitle', params:args}));						
			if (typeof(_this.findTrackByTitleSync) === "function") {
				var result = _this.findTrackByTitleSync(args["title"]);
				logger.info('request: findTrackByTitle');
				// TODO: How to handle error responses in the synchronous case?
				cb(null, JSON.stringify(result));
				logger.info(JSON.stringify({type: "response", name:'findTrackByTitle', params:result}));						
			} else if (typeof(_this.findTrackByTitle) === "function") {
				_this.findTrackByTitle(args["title"],
					function(result) {
						cb(null, JSON.stringify(result));
						logger.info(JSON.stringify({type: "response", name:'findTrackByTitle', params:result}));						
					},
					function(error) {
						cb(error, null);
						logger.error(JSON.stringify({type: "error", name:'findTrackByTitle', params:error}));						
					}
				);
			}
		});
	});
	// RPC stub for method play
	_this.server.rpc('invoke', function() {
		this.register('play', function(client, cb, args) {
			logger.info(JSON.stringify({type: "request", name:'play', params:args}));						
			if (typeof(_this.playSync) === "function") {
				var result = _this.playSync();
				logger.info('request: play');
				// TODO: How to handle error responses in the synchronous case?
				cb(null, JSON.stringify(result));
				logger.info(JSON.stringify({type: "response", name:'play', params:result}));						
			} else if (typeof(_this.play) === "function") {
				_this.play(
					function(result) {
						cb(null, JSON.stringify(result));
						logger.info(JSON.stringify({type: "response", name:'play', params:result}));						
					}
				);
			}
		});
	});
	// RPC stub for method pause
	_this.server.rpc('invoke', function() {
		this.register('pause', function(client, cb, args) {
			logger.info(JSON.stringify({type: "request", name:'pause', params:args}));						
			if (typeof(_this.pauseSync) === "function") {
				var result = _this.pauseSync();
				logger.info('request: pause');
				// TODO: How to handle error responses in the synchronous case?
				cb(null, JSON.stringify(result));
				logger.info(JSON.stringify({type: "response", name:'pause', params:result}));						
			} else if (typeof(_this.pause) === "function") {
				_this.pause(
					function(result) {
						cb(null, JSON.stringify(result));
						logger.info(JSON.stringify({type: "response", name:'pause', params:result}));						
					}
				);
			}
		});
	});
};


