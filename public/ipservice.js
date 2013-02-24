(function(undefined) {
	"use strict";

	if (window.ipService) {
		warn('Overwriting existing ipService variable');
	}

	var classPrefix = 'ipService';

	// counts the number of callbacks initiated, used for generating unique callback names
	var cbCount = 0;
	// used to store user callbacks so they are accessable from global
	var callbacks = {
		'default': function(ip){ log(ip); }
	};

	/*
		Generator used to return a function to call the users callback and delete the
		callback off of the temporary storage object
	*/
	function CB(callback,cbName) {
		if (!callback) { callback = callbacks['default']; } //set the default if none passed
		return function(ip) {
			callback(ip);
			delete callbacks[cbName];
			clearTag(cbName);
		};
	}

	function clearTag(cbName) {
		var el = document.getElementsByClassName(classPrefix+cbName)[0];
		el.parentNode.removeChild(el);
	}

	/*
		Public
		@requires function callback - to be called with the ip address of the client
	*/
	function get(callback) {
		cbCount++;
		var uniqueCBName = 'cb'+cbCount;

		callbacks[uniqueCBName] = new CB(callback,uniqueCBName);
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.className = classPrefix+uniqueCBName;
		script.src = 'http://www.jsipservice.com/REST?callback=ipService.callbacks.'+uniqueCBName;
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	window.ipService = {
		get: get,
		callbacks: callbacks
	};

	function warn(txt) {
		if (console && console.warn) {
			console.warn(txt);
		}
	}
	function log(txt) {
		if (console && console.log) {
			console.log(txt);
		}
	}
}());