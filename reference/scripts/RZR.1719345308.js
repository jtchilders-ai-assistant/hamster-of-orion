// Version 1.11
// RZR Traffic Segmenter with Improved Async Queue Handling
var rzr = window.rzr || {}; // Use existing rzr object if it exists
rzr.startTime = performance.now();
rzr.baseTime = performance.getEntriesByType("navigation")[0].responseStart;

rzr = Object.assign({
	version: '1.11',
	segmentCount: 60, // Default segment count set to 60
	segmentTime: 0.25, // Days
	segment: null,
	override: false,
	debug: false, // Debug mode state
	ready: false, // Indicates if init has run
	queue: window.rzr.queue || [], // Ensure the existing queue is used if already defined

	// Initialize RZR, ensuring it runs only once
	init: function() {
		if (this.ready) {
			this.log("RZR has already been initialized.");
			return;
		}

		// Determine debug mode based on URL parameter or cookie
		var debugParam = this.getUrlVars()["rzr_debug"];
		if (debugParam === "on") {
			this.debug = true;
			this.setCookie("rzr_debug", "on", 1);
			this.log("Debug mode activated via URL parameter.");
		} else if (debugParam === "off") {
			this.debug = false;
			this.eraseCookie("rzr_debug");
			this.log("Debug mode deactivated via URL parameter.");
		} else {
			this.debug = (this.getCookie("rzr_debug") === "on");
			this.log("Debug mode set from cookie: " + this.debug);
		}

		// Set or retrieve the segment
		this.determineSegment();

		this.ready = true;
		this.processQueue();
		this.log("RZR initialized with segment: " + this.segment + " RZR execution time: ");
		this.log(performance.now() - this.startTime + " ms");
	},
	determineSegment : function() {
		var testParam = this.getUrlVars()["rzr_test"];
		var setParam = this.getUrlVars()["rzr_set"];
		var cookieSegment = parseInt(this.getCookie("rzr_seg"), 10);

		if (testParam) {
			// Test parameter is present, use it to override the segment
			this.segment = parseInt(testParam, 10);
			this.override = true;
			this.log("Segment override from URL parameter: " + this.segment);
		} else if (setParam) {
			// Set parameter is present, use it and update the cookie
			this.segment = parseInt(setParam, 10);
			this.override = true;
			this.setCookie("rzr_seg", this.segment, this.segmentTime);
			this.log("Segment set and cookie created from URL parameter: " + this.segment);
		} else if (!isNaN(cookieSegment)) {
			// Valid segment exists in the cookie, use it
			this.segment = cookieSegment;
			this.log("Segment retrieved from cookie: " + this.segment);
		} else {
			// No valid segment from parameters or cookie, generate a random segment
			this.segment = Math.floor(Math.random() * this.segmentCount);
			this.setCookie("rzr_seg", this.segment, this.segmentTime);
			this.log("Segment set randomly: " + this.segment);
		}
	},


	// Process commands in the queue
	processQueue: function() {
		while (this.queue.length > 0) {
			var command = this.queue.shift();
			if (typeof command === 'function') {
				command();
			}
		}
		this.log("All queued commands have been processed.");
	},

	// Base64 encoding and decoding for cookie values
	encode: function(value) {
		return btoa(encodeURIComponent(value));
	},

	decode: function(value) {
		try {
			return decodeURIComponent(atob(value));
		} catch (e) {
			this.log("Failed to decode value: " + value);
			return null; // Returns null if decoding fails
		}
	},

	// Get URL parameters
	getUrlVars: function() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
			vars[key] = value;
		});
		return vars;
	},

	// Cookie control methods
	setCookie: function(name, value, days) {
		var encodedValue = this.encode(value.toString());
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + encodedValue + expires + "; path=/";
	},

	getCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return this.decode(c.substring(nameEQ.length, c.length));
		}
		return null;
	},

	eraseCookie: function(name) {
		document.cookie = name + '=; Max-Age=-99999999;';
	},

	// Conditional logging based on debug state
	log: function(message) {
		if (this.debug) {
			var now = performance.now();
			var elapsed = now - this.baseTime; // Calculate elapsed time since navigation start
			console.log(elapsed + " ms: RZR Log - " + message);
		}
	}
}, rzr);

// Initialization call to setup RZR
rzr.init();