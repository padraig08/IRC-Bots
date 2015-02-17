var request = require('request'),
_ = require('lodash-node'),
cheerio = require('cheerio');


var mainUrl = "http://qdb.zero9f9.com/";
request(mainUrl, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
		}else{

			var $ = cheerio.load(body);
			var match = $('.quoteIDBox a').attr('href');
			var newMatch = match.replace( /^\D+/g, ''); 
			qdbCheck(newMatch);
		}
});

function qdbCheck (qdbTop) {


var randQDB = getRandomInt(0,qdbTop);
var qdbRandUrl = "http://qdb.zero9f9.com/quote.php?id="+randQDB;	
request(qdbRandUrl, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
			qdbCheck(qdbTop);
		}else{
		 
		 console.log(qdbRandUrl);
		}
});
}

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}