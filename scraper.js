/**
 * Adds extend functionality to the objects prototype, for easier further development
 */
Object.prototype.extend || Object.defineProperty(
 	Object.prototype, 
 	'extend', 
 	{

 		value: function(o, /*OPTIONAL*/ ext) {

 			var l = arguments.length;

 			for(var i=1; i<l; i++) {
 				for(var p in arguments[i]) {
 					o[p] = arguments[i][p];
 				}
 			}

 			return o;
 		},
 		enumerable: false
 	}
);

exports.scraper = {
 	scrapeList: ScrapeList
};

/**
 * [ScrapeList description]
 * @param {Array} urls    URLs to be crawled
 * @param {Object} options Additional options
 */
var ScrapeList = function(urls, callback, /*optional*/ options) {

 	var defaults = {
 		paralel: 10,
 		timeout: 100,
 		header: {}
 	};

 	var options = Object.extend(defaults, options);

 	var served = 0;
 	var url_cnt = urls.length

 	var callStack = [];

 	//First batch of urls gets pushed to the callstack which eventually will be used
 	for(var i = 0; i < options.paralel && i < url_cnt; i++) {
 		
 		callStack.push(urls.pop());
 	}

 	/**
 	 * Performs web page scraping
 	 * 
 	 * Creates JSDOM object with the and calls callback which will work with the 
 	 * scraped data
 	 * @param  {string} link
 	 * @return {void}
 	 */
 	var scrape = function(link) {

 		callback(link);

 		if(urls.length == 0) {
 			return;
 		}

 		//Adds new linkt to the list which will be scraped
 		callStack.push(urls.pop())
 	}

 	/**
 	 * Background process which monitors link stack and performs
 	 * scraping process invoction
 	 * 
 	 * @return {void}
 	 */
	var timeoutedCall = function() {

		if(callStack.length == 0) {
 			return;
 		}

 		if(callStack.length == 0 && urls.length !== 0) {
 			setTimeout(function(timeoutedCall, options.timeout));
 		}
 		var url = callStack.pop();	

 		setTimeout(function(){scrape(url), timeoutedCall()}, options.timeout);
 	}

 	timeoutedCall();
}

var scrape = new ScrapeList([1,2,3,4,5,6,7,8,9,10, 11, 12, 13, 14, 15], function(i){console.log(i)});