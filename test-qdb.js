var request = require('request'),
_ = require('lodash-node'),
cheerio = require('cheerio');


var mainUrl = "http://qdb.zero9f9.com/";
request(mainUrl, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
		}else{

			var $ = cheerio.load(body);
			var match = $('div.quoteIDBox a').map(function(i, el){ return $(this).attr('href') }).get();
			var randQDB = getRandomInt(0, match.length-1);
			var newMatch = "http://qdb.zero9f9.com/quote.php?id=" + match[randQDB].replace( /^\D+/g, '');  
			console.log(newMatch);
		}
});

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}