var scraper = require('./scraper');

var links = [
'news.ycombinator.com'
];

scraper.scrapeList(links, {hammerIt: true, timeout: 400}, function(err, $, link){

	if(err) {
		console.log(err.message);
		return;
	}

	console.log($('title').text() + ' via ' + link);
});