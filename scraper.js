/**
 * Adds extend functionality to the objects prototype, for easier further development
 * 
 * This merge all enumerable properties of all the object into one object
 */
Object.prototype.extend || Object.defineProperty(
 	Object.prototype, 
 	'extend', 
 	{

 		value: function(o, /*OPTIONAL*/ ext) {

 			var l = arguments.length;

 			for(var i=1; i<l; i++) {
 				if(!arguments[i]) {
 					continue;
 				}
 				for(var p in arguments[i]) {
 					o[p] = arguments[i][p];
 				}
 			}
 			return o;
 		},
 		enumerable: false
 	}
);

/**
 * Scrapes list of urls in paralel
 * 
 * @param {Array} urls List with URLs to be scraped
 * @param {Object} options Additional options(optional)
 * @param {function} callback Callback which will be executed on each and every response
 */
var scrapeList = function(urls, b, c) {

 	var defaults = {
 		hammerIt: false, //whether initial calls will be called at the start without waiting
 		paralel: 10, //how many 
 		timeout: 100, //timeout before next request
 		header: {
 			'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
 		},
 		jQueryUrl: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js',
 		additionalScripts: []
 	};

 	//Magic to swap parameters around, enables options to be passed before callback, but also let them be left out
 	if(typeof b == 'function') {
 		callback = b;
 		options = {};
 	}
 	else {
 		callback = c;
 		options = b;
 	}

 	var options = Object.extend(defaults, options);

 	var request = require('request');
 	var jsdom = require('jsdom');

 	/**
 	 * Performs web page scraping
 	 * 
 	 * Creates JSDOM object with the and calls callback which will work with the 
 	 * scraped data
 	 * 
 	 * @param  {string} link
 	 * @return {void}
 	 */
 	var scrape = function(link) {

 		//Attaches missing http start of the link, otherwise request module will complain
 		if(link.substr(0, 4) !==  'http') {
 			link = 'http://'+link;
 		}

 		var requestParameters = Object.extend(options.header, {uri: link});

 		request(requestParameters, function(err, response, body) {

	 		if(urls.length !== 0) {
	 			urlStack.push(urls.pop())
	 		}

 			if(err || response.statusCode != 200) {
 				err = err || {name: 'Invalid response', message: 'Server responded with '+response.statusCode+' status code while scraping '+link};
 				callback(err, undefined, link);
 				return;
 			}
 			else {
 				//Builds DOM object and executes callback
 				jsdom.env({
 					html: body,
 					scripts: Array.prototype.concat([options.jQueryUrl], options.additionalScripts),
 					done: function(err, window){
	 					if(err) {
	 						callback(err, undefined, link);
	 					}
	 					else {
	 						callback(err, window.jQuery, link);
	 					}
	 					//Window must be closed otherwise jsom leaks quite baddly
	 					if(window) {
	 						//Hack, otherwise exception is thrown, looks like in background jsdom is still performing some actions
		 					process.nextTick(function() {
							    window.close();
							});	
	 					}
 					}
 				});
 			}
 		});
 	}

 	/**
 	 * Background process which monitors link stack and performs
 	 * scraping process invoction
 	 * 
 	 * @return {void}
 	 */
	var timeoutedCall = function() {

		//Monitors state of url stack, scraping can happen only if there are urls to be scraped
		if(urlStack.length === 0) {
			if(urls.length !== 0) {
				process.nextTick(timeoutedCall);
			}
			return;
		}

		var url = urlStack.pop();

 		setTimeout(function(){
 			scrape(url), 
 			timeoutedCall();
 		}, options.timeout);
 	}

 	var url_cnt = urls.length
 	var urlStack = [];

 	//First batch of urls gets pushed to the callstack which eventually will be used
 	for(var i = 0; i < options.paralel && i < url_cnt; i++) {

 		(function() {
	 		var url = urls.pop();

			if(options.hammerIt) {
				process.nextTick(function(){
					scrape(url);
				});
			}
			else {
				urlStack.push(url);	
			}
		})();
 	}

 	timeoutedCall();
}

//List with methods available in this module, just for convience
var availableMethods = {
	scrapeList: scrapeList
};

//Adds scrapper methods to the modules official method list
Object.extend(exports, availableMethods);