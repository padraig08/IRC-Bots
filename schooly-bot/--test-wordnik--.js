//test wordnik

var request = require('request');
var _= require('lodash-node');
var async = require('async');
var wordUrl = 'http://api.wordnik.com:80/v4/word.json/<word>/';
var exampleUrl = 'examples?includeDuplicates=false&useCanonical=false&skip=0&limit=100';
var searchUrl = 'http://api.wordnik.com:80/v4/words.json/search/<search>*?caseSensitive=false&minCorpusCount=5&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=1&maxLength=-1&skip=0&limit=10000';
var acroFirstUrl = '&includePartOfSpeech=adjective';
var acroLastUrl = '&includePartOfSpeech=noun';
var acroAnyUrl = '&includePartOfSpeech=noun,verb,adverb,adjective';
var thesaurUrl = 'relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=1000';
var defineUrl = 'definitions?limit=100&includeRelated=true&useCanonical=true&includeTags=false';
var rhymeUrl = 'relatedWords?useCanonical=false&relationshipTypes=rhyme&limitPerRelationshipType=100';
var pronUrl = 'pronunciations?useCanonical=false&limit=50';
var audioUrl = 'audio?useCanonical=false&limit=50';
var apiUrl = '&api_key=<api>';
var api = 'd2995fee04930f335d81803552c000b9aab0e63a3813e0326';
var word = 'bbbb';

//var specMatch = new RegExp(/[$-/:-?{-~!"^_`\[\]]/);
//var numMatch = new RegExp(/[\d]/);

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}

function loopSyn(c, n, callback){
	var urlThesaurBuild = wordUrl+thesaurUrl+apiUrl;
	urlThesaurBuild = urlThesaurBuild.replace(/<word>/gi, c).replace(/<api>/gi, api);
	request(urlThesaurBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			synObj[n] = c;
			//synArray.push(c);
			callback();
			
		}else{
			var synData = JSON.parse(body);
			var randSyn = getRandomInt(0, synData[0].words.length-1);	
			synObj[n] = synData[0].words[randSyn];
			//synArray.push(synData[0].words[0]);
			//acArray.push(acData.searchResults[0].word);
			callback();
		}

	});
}

function syncSyn(commandargs){
	synObj = {};
	requests = 0;

	async.each(commandargs, function(n, callback) {
	requests++;
	//console.log(command.args);

		if (specMatch.test(commandargs) || numMatch.test(commandargs)){
			console.log('got it');
		loopSyn('fuck', requests,callback);
		}else{
		loopSyn(n, requests,callback);
		}
	}, function(err) {
		var synString = _.map(synObj, function(num) { return num; }).join(" ");
		//bot.say(command.channel, synString.toUpperCase());
		console.log(synString);
		//bot.say(command.channel, synArray.join(" "));
	});
}


	var commandargs = ['poob?','doop4']; 
	syncSyn(commandargs);
	