var request = require('request'),
_ = require('lodash-node'),
cheerio = require('cheerio');


var mainUrl = "http://carnage.bungie.org/haloforum/halo.forum.pl";
request(mainUrl, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
		}else{
			var $ = cheerio.load(body);
			var hboTop = $('div#ind_msglist a').attr('name').replace( /^\D+/g, '');
			var hboBase = 0;
			switch ('') {
    						case 'newest':
    							hboBase = Math.round(hboTop * 0.90);
        						hboCheck(hboTop, hboBase);
        					break;
    						case 'old':
    							hboBase = Math.round(hboTop * 0.50);
    							hboTop = Math.round(hboTop * 0.89);
        						hboCheck(hboTop, hboBase);
        					break;
        					case 'OLD':
        						hboBase = Math.round(hboTop * 0.11);
    							hboTop = Math.round(hboTop * 0.49);
        						hboCheck(hboTop, hboBase);
        					break;
    						case 'O L D':
    							hboTop = Math.round(hboTop * 0.10);
        						hboCheck(hboTop, hboBase);
        					break;
    						default:
        						hboCheck(hboTop, hboBase);
        					}
        				}
        			});

function hboCheck (hboTop, hboBase) {

var randHBO = getRandomInt(hboBase,hboTop);
//randHBO = 12153;
var hboRandUrl = "http://google.com="+randHBO;	
request(hboRandUrl, function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
			hboCheck(hboTop, hboBase);
		}else{
			var $ = cheerio.load(body);
			var hboInvalid = $('big big strong').text();
		 	if(hboInvalid == "No Message!"){
		 		console.log('bunk, re-routing')
		 		hboCheck(hboTop, hboBase);
		 	}else{
		 		var hboTitle = $('div.msg_headln').text();
		 		var hboTitleAlt = $('td.subjectcell b').text();
		 		var hboPoster = $('span.msg_poster').text();
		 		var hboPosterAlt = $('td.postercell').first().text().replace("Posted By:","").replace(/<(.*?)>/g,"").trim();
		 		console.log(hboTitle+ hboTitleAlt+ " ("+hboPoster+hboPosterAlt+") "+ hboRandUrl);
		 	}
		 
		}
});
}

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}