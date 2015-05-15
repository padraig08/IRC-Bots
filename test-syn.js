var winston = require('winston'),
async = require('async'),
request = require('request'),
_ = require('lodash-node');

var botData = require('./botData.json');

var urls = botData.urls,
	word = botData.word;


function getRandomInt(min,max){
    if((typeof min === "number") && Math.floor(min) === min && (typeof max === "number") && Math.floor(max) === max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }else{
        //logger.error('min or max number is not a valid number');
        throw 'min or max number is not a valid number';
    }
}


/*
function quothTheHyo(command){
        try {
            var hyoRandomInt = getRandomInt(0,hyokin.items.length-1);
        } catch (err) {
            logger.error(err);
            return;
        }
        var hyoChosenFact = hyokin.items[hyoRandomInt];
        var person = command.args.join(" ");
 
        if (_.isEmpty(person)) {
            person = 'Hyokin';
        }
        bot.say(command.channel, '>' + hyoChosenFact.replace(/Hyokin/gi, person));
}
*/
var acroLetterArray = ["H","B","O","M","B"];
var acroResultArray = [];

async.eachSeries(acroLetterArray, acroRequestWord, function(err){
	if(_.isEmpty(err)){
		console.log(acroResultArray);
	}else{
		console.log(err);
	}

});


function acroRequestWord(currentLetter, callback){
	var url = word.searchUrl+word.acroAnyUrl+word.apiUrl;
	url = url.replace(/<search>/gi, currentLetter).replace(/<api>/gi, word.api);
	console.log(url);
	request(url, function (error, response, body) {
		if (error || response.statusCode !== 200){

			console.log(error);
			callback("error on wordRequest");	
		}else{	
			var wordRequestData = JSON.parse(body);
            try {
                var acroRandomInt = getRandomInt(0,wordRequestData.searchResults.length-1);
            } catch (err) {
                logger.error(err);
                callback('error on randomInt');
            }
			acroResultArray.push(wordRequestData.searchResults[acroRandomInt].word);
			callback();	
		}
	});


}


function syncAcro(command, acLetter){
	acObj = {};
	requests = 0;

	async.each(acLetter, function(n, callback) {
		requests++;
		  if (requests == 1){
		   urlAcroBuild = word.searchUrl+word.acroFirstUrl+word.apiUrl;
		   loopAcro(n,requests, urlAcroBuild, callback);
		  }else if (requests == 2 || requests == acLetter.length-1){
		   urlAcroBuild = word.searchUrl+word.acroLastUrl+word.apiUrl;
		   loopAcro(n,requests, urlAcroBuild, callback);
		  }else {
		   urlAcroBuild = word.searchUrl+word.acroAnyUrl+word.apiUrl;
		   loopAcro(n,requests, urlAcroBuild, callback);
		  }
	}, function(err) {
		var acString = _.map(acObj, function(num) { return num; }).join(" ");
		bot.say(command.channel, acString.toUpperCase());
	});
}

function syncSyn(command){
	synObj = {};
	requests = 0;

	async.each(command.args, function(n, callback) {
	requests++;
	//console.log(command.args);
		if (specMatch.test(n) || numMatch.test(n)){
			console.log('got it');
		loopSyn('fuck', requests,callback);
		}else{
		loopSyn(n, requests,callback);
		}
		//loopSyn(n, requests,callback);
	}, function(err) {
		var synString = _.map(synObj, function(num) { return num; }).join(" ");
		bot.say(command.channel, synString.toUpperCase());
		//bot.say(command.channel, synArray.join(" "));
	});
}



function loopAcro(c, n, url, callback) {
	url = url.replace(/<search>/gi, c).replace(/<api>/gi, word.api);
	if(letterPattern.test(c)){
	request(url, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			acObj[n] = c;
		}else{	
			var acData = JSON.parse(body);
            try {
                var acroRandomInt = getRandomInt(0,acData.searchResults.length-1);
            } catch (err) {
                logger.error(err);
                callback('err',null)
            }
			acObj[n] = acData.searchResults[acroRandomInt].word;
			callback();	
		}
	});
	}else{
		acObj[n] = c;
		callback();
	}
}

function loopSyn(c, n, callback){
	var urlThesaurBuild = word.wordUrl+word.thesaurUrl+word.apiUrl;
	urlThesaurBuild = urlThesaurBuild.replace(/<word>/gi, c).replace(/<api>/gi, word.api);
	request(urlThesaurBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			synObj[n] = c;
			//synArray.push(c);
			callback();
			
		}else{
			var synData = JSON.parse(body);
            try {
                var synRandomInt = getRandomInt(0,synData[0].words.length-1);
            } catch (err) {
                logger.error(err);
                callback('err',null)
            }
			synObj[n] = synData[0].words[synRandomInt];

			//synArray.push(synData[0].words[0]);
			//acArray.push(acData.searchResults[0].word);
			callback();
		}

	});
}

