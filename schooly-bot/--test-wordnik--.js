//test wordnik

var request = require('request');
var _= require('lodash-node');
var wordUrl = 'http://api.wordnik.com:80/v4/word.json/<word>/';
var searchUrl = 'http://api.wordnik.com:80/v4/words.json/search/<search>*?caseSensitive=false&minCorpusCount=5&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=1&maxLength=-1&skip=0&limit=1000';
var defineUrl = 'definitions?limit=100&includeRelated=true&useCanonical=false&includeTags=false';
var rhymeUrl = 'relatedWords?useCanonical=false&relationshipTypes=rhyme&limitPerRelationshipType=100';
var apiUrl = '&api_key=<api>';
var api = 'd2995fee04930f335d81803552c000b9aab0e63a3813e0326';
var word = 'nart';




var urlRhymeBuild = wordUrl+rhymeUrl+apiUrl;
var urlRhymeBuild = urlRhymeBuild.replace(/<word>/gi, word).replace(/<api>/gi, api);

request(urlRhymeBuild, function (error, response, body) {
	if (error || response.statusCode !== 200 || body.length <= 2){
		//console.log('Try another word, I got no rhymes for you.');
	}else{
		var rhymeData = JSON.parse(body);
		var rhymeCount = rhymeData[0].words.length-1;
		//console.log(rhymeCount);
	}
});

var urlDefineBuild = wordUrl+defineUrl+apiUrl;
var urlDefineBuild = urlDefineBuild.replace(/<word>/gi, word).replace(/<api>/gi, api);

request(urlDefineBuild, function (error, response, body) {
	if (error || response.statusCode !== 200 || body.length <= 2){
		//console.log('Try another word, I got no definitions for you.');
	}else{
		var defineData = JSON.parse(body);
		//console.log(defineData[0].word+" ["+defineData[0].partOfSpeech+"] : "+defineData[0].text);
	}
});



var urlInitBuild = searchUrl+apiUrl;
var acArray = [];
var acLetter = word.split("");

var acResult = _.map(acLetter, function(currLetter) {
	urlAcBuild = urlInitBuild.replace(/<search>/gi, currLetter).replace(/<api>/gi, api);
	console.log(currLetter);
	//acronymTime(urlAcBuild);
	request(urlAcBuild, function (error, response, body) {
		//if (error || response.statusCode !== 200 || body.length <= 2){
		//	console.log('Try again, I got nothing for you.');
		//}else{
			
			var acData = JSON.parse(body);
			acArray.push(acData.searchResults[0].word);
			//console.log(acArray);
		//}
	});
});

console.log(acResult);


function acronymTime(url){
	request(url, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			console.log('Try again, I got nothing for you.');
		}else{
			var acData = JSON.parse(body);

			//acArray.push(
			return acData.searchResults[0].word;
			console.log(acArray);
		}
	});

}

