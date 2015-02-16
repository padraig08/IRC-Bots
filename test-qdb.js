var request = require('request'),
_ = require('lodash-node'),
cheerio = require('cheerio');
var number = '620';


var Finalurl = "http://qdb.zero9f9.com/quote.php?id="+number;
var mainUrl = "http://qdb.zero9f9.com/";

request(mainUrl, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
		}else{

			var $ = cheerio.load(body);
			var match = $('.quoteIDBox a').attr('href');
			var newMatch = match.replace( /^\D+/g, ''); 

			console.log(newMatch);
		}
});








/*request(url, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
		}else{

			console.log(body);
		}
});*/