var botConfig = require('./botConfig.json'),
botData = require('./botData.json'),
regex = require('./regex.js');

var countdown = botData.countdown,
	Tweet = botData.Tweet,
	qdb = botData.qdb,
	translate = botData.translate,
	urls = botData.urls,
	dmx = botData.dmx,
	gouf = botData.gouf,
	ugh = botData.ugh,
	hyokin = botData.hyokin,
	randomMsg = botData.randomMsg,
	av = botData.av,
	rhymePos = botData.rhymePos,
	word = botData.word;

// Get the lib
var irc = require('tennu'),
bonksync = require('async'),
network = require('./netConfig.json'),
request = require('request'),
_ = require('lodash-node'),
MsTranslator = require('mstranslator'),
latin = require('./node_modules/latinise/latinise'),
romaji = require("hepburn"),
hbombcount = require("countdown"),
twitter = require('twit'),
geo = require ('geocoder'),
c = require('irc-colors'),
util = require('util');

//var specMatch = new RegExp(/[$-/:-?{-~!"^_`\[\]]/);
//var numMatch = new RegExp(/[\d]/);

var letterPattern = new RegExp('[a-zA-Z]');
var requests = 0;
var acObj = {};
var synArray = [];

var Tw = new twitter({
    consumer_key: botConfig.twConfig.consumer_key,
    consumer_secret: botConfig.twConfig.consumer_secret,
    access_token: botConfig.twConfig.access_token,
    access_token_secret: botConfig.twConfig.access_token_secret
});

var transClient = new MsTranslator({
      client_id: botConfig.transConfig.client_id
      , client_secret: botConfig.transConfig.client_secret
    });

var clonkometer = 0;
var offQuestion = false;
var nameList = [];
var stripOP = '^[@&#+$~%!*?](.*)$';

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}

function checkOP(name){
	
	var opPattern = new RegExp(stripOP);
	if (opPattern.test(name)){
		name = name.slice(1);
	}
	var newName = { 'name': name };
	nameList.push(newName);
}

function quothTheHyo(command){
		var hyoString = command.args.join(" ");
        var hyoChosenFact = hyokin.items[getRandomInt(0,hyokin.items.length-1)];
        var person = hyoString;
 
        if (_.isEmpty(hyoString)){
                person = 'Hyokin';
        }

        if (hyoChosenFact.indexOf("<h4time>") > -1){
        	hyoChosenFact = hyoChosenFact.replace(/<h4time>/gi, hbombcount(null ,new Date(2012, 10, 6)).toString());
        }
 
        //ideally the "%hyo" keyword should be defined elsewhere and referenced via variable here
        bot.say(command.channel, '>' + hyoChosenFact.replace(/Hyokin/gi, person));
}

function detectThatShit(string, to, command){

	if(string.charAt(string.length - 1) == "~"){
	string = romaji.toHiragana(string);
	params = { text: string };
}else{
	params = { text: string	};
}
	
	transClient.initialize_token(function(keys){
		transClient.detect(params, function(err, data){
			if (_.isEmpty(to)){
				translateThatShit(string, "en", data, command);
			}else{
				translateThatShit(string, to, data, command);
			}
		});
	});

}

function translateThatShit(string, to, from, command){
	params = { 
      text: string
      , from: from
      , to: to
    };
	
	transClient.initialize_token(function(keys){
			transClient.translate(params, function(err, data) {
				if(data.indexOf("ArgumentOutOfRangeException:") == -1){
					if(to == "ja"){
						data = romaji.fromKana(data);
						console.log(data, to, from);
						bot.say(command.channel,"Translation: "+data.latinise());
					}else{
						console.log(data, to, from);
						bot.say(command.channel,"Translation: "+data.latinise());
					}
				}else{
        			
        			bot.say(command.channel,"ERROR: Please use a supported language code.");
        		}
    		});
	});
}

function engrishThatShit(string, to, command){
params1 = { 
      text: string
      , from: 'en'
      , to: to
    };

transClient.initialize_token(function(keys){
			transClient.translate(params1, function(err, data) {
			var engrish1 = data;
			params2 = { text: engrish1, from: to, to: 'en'};
			transClient.translate(params2, function(err, data) {
				bot.say(command.channel,"Engrish: "+data.latinise());
			});
		});
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
			var randAcro = getRandomInt(0, acData.searchResults.length-1);	
			acObj[n] = acData.searchResults[randAcro].word;	
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
			var randSyn = getRandomInt(0, synData[0].words.length-1);	
			synObj[n] = synData[0].words[randSyn];
			//synArray.push(synData[0].words[0]);
			//acArray.push(acData.searchResults[0].word);
			callback();
		}

	});
}

function syncAcro(command, acLetter){
	acObj = {};
	requests = 0;

	bonksync.each(acLetter, function(n, callback) {
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

	bonksync.each(command.args, function(n, callback) {
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

function timeToBonk(command)
{
	var from = command.nickname;
	var target = command.args.join(" ");
	var calc = getRandomInt(0,100);
	var result = getRandomInt(0,randomMsg.result.length -1);
	var attacker = getRandomInt(0,randomMsg.attacker.length -1);
	var calcMsg = calc.toString() + "% of ";
	var resultMsg = randomMsg.result[result];
	var attackerMsg = randomMsg.attacker[attacker];

	
	clonk = c.brown("Battlebonk results: " + calcMsg + target+"'s clonkers " + resultMsg + " by " + from+"'s " + attackerMsg);
	bot.say(command.channel, clonk);
	var recalcColor = Math.round((calc * (randomMsg.colors.length - 1)) /100);
	var recalcAssess = Math.round((calc *(randomMsg.assess.length - 1)) /100);
	//var assessColor = "c."+randomMsg.colors[recalcColor];
	var assessment = randomMsg.assess[recalcAssess];
	console.log(assessment);
	
	bot.say(command.channel, "Battlebonk Status: " + c.red(assessment));

}

function userTweet(command, userString){

if (_.isEmpty(userString)){
		bot.say(command.channel, "No user provided. Come on man, you're better than this.");

	}else{
	var userArray = userString.split("|");
	Tw.get('statuses/user_timeline', {screen_name: userArray[0], count:'200', exclude_replies:'true', include_rts:'false'}, function(err, data, response){
			if (err === null){
				if(_.contains(userString,"|")){
					switch (userArray[1]) {
    					case 'name':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Name: "data[0].user.name);
        				break;
    					case 'description':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Bio: "data[0].user.description);
        				break;
        				case 'location':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Location: "data[0].user.location);
        				break;
    					case 'count':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Tweet Count: "data[0].user.status_count);
        				break;
    					default:
        				console.log('You gotta give me something to look up, brah.');
					}}else{
						var randTweet = getRandomInt(0,data.length-1);
						var arrTweet = data[randTweet].text.replace( /\n/g, "`" ).split( "`" );
						console.log(arrTweet);
						//bot.say(command.channel,  data[randTweet].user.screen_name +": " +arrTweet);
			}}else{
				console.log("ERROR: try again, you fucked this up somehow.");
			}
		});
}

}

function searchDaTweet (searchString, command) {
	if (_.isEmpty(searchString)){
		bot.say(command.channel, "No text provided. Come on man, you're better than this.");

	}else if(_.contains(searchString,"|")){

		var searchArray = searchString.split("|");
		geo.geocode(searchArray[1], function(err, data){
			if(data.status == 'OK'){
				Tw.get('search/tweets', {q: searchString, count:'100', geocode: data.results[0].geometry.location.lat+','+data.results[0].geometry.location.lng+',10mi'}, 
				function(err, data, response){
					if (err === null){
						if(data.statuses.length > 0){
						var randTweet = getRandomInt(0,data.statuses.length-1);
						var arrTweet = data.statuses[randTweet].text.replace( /\n/g, "`" ).split( "`" );
						console.log(arrTweet);
						bot.say(command.channel, "Tweet from "+ data.statuses[randTweet].user.screen_name+" : "+ arrTweet +" (http://twitter.com/"+data.statuses[randTweet].user.screen_name+"/status/"+data.statuses[randTweet].id_str+")");
					}else{
						bot.say(command.channel, "ERROR: you fucked this up duder.");
						console.log(err);		
					}
				}else{
					bot.say(command.channel, "No tweets found, that's pretty shitty.");

				}

				});
			}else{
			bot.say(command.channel, "Location not found, or like an error happened. I don't know, man.");

		}

});
	}else{

	Tw.get('search/tweets', {q: searchString, count:'100'}, function(err, data, response){
		if(data.statuses.length > 0){
			if (err === null){
				var randTweet = getRandomInt(0,data.statuses.length-1);
				var arrTweet = data.statuses[randTweet].text.replace( /\n/g, "`" ).split( "`" );
				console.log(arrTweet);
				bot.say(command.channel, "Tweet from "+ data.statuses[randTweet].user.screen_name+" : "+arrTweet+" (http://twitter.com/"+data.statuses[randTweet].user.screen_name+"/status/"+data.statuses[randTweet].id_str+")");
			}else{
				bot.say(command.channel, "ERROR: you fucked this up duder.");
				console.log(err);		
			}
		}else{
				bot.say(command.channel, "No tweets found, that's pretty shitty.");

		}
	});
	}
}

function randImg(kind, where){
		var subreddit = getRandomInt(0, kind.length-1);
		var urlBuild = urls.reddit + kind[subreddit] +'/random/.json';
		subSelect(urlBuild, where);
}

function randoSub(sub, where){
	//console.log("sub is:"+" | "+sub+" | ", sub.length);
	var urlBuild = '';
	if (_.isEmpty(sub)){
		var urlRand = urls.reddit + 'random/';
		request(urlRand, function (error, response, body){
			urlBuild = response.request.uri.href + "random/.json";
			//console.log(urlBuild);
			subSelect(urlBuild, where);
		});

	} else {

		urlBuild = urls.reddit + sub + '/random/.json';
		subSelect(urlBuild, where);
		
	}

}

function subSelect(urlBuild, where){

	request(urlBuild, function (error, response, body) {
		var invalidSub = response.request.uri.search;
			if (!error && response.statusCode == 200 && invalidSub === null) {
				var redditData = JSON.parse(body);
				var dataUrl = redditData[0].data.children[0].data;
				//econsole.log(dataUrl);
				
				if (dataUrl.over_18 === true){
					bot.say(where,'Warning: The following is NSFW/NSFL');
				}
				bot.say(where, dataUrl.title +" from r/"+ dataUrl.subreddit +" --- "+ dataUrl.url);
				
			} else if (invalidSub !== null){
					bot.say(where,'The listed subreddit is not usable, please try another one.');
			}
		}
	);
}

var print = console.log.bind(console);

var Logger = function () {
    return {
        debug: print,
        info: print,
        note: print,
        notice: print,
        warning: print,
        crit: print,
        alert: print,
        emerg: print
    }
};

var bot = irc.Client(network, {Logger: Logger});
bot.connect();

	var kind= '';



bot.on("join", function(message){
	if(message.nickname == "Bonk-Bot"){
		bot.say(message.channel,"BonkBot Online.... use #howtobonk for instructions and running modules");
		
	}else{
		checkOP(message.nickname);
	}
});

bot.on("quit",function(message){
	//console.log(util.inspect(message));
	var removeName = _.where(nameList, {'name': message.nickname});
	nameList = _.without(nameList, removeName[0]);
});


bot.on("names",function(message){
	console.log(util.inspect(message));
	for (var key in message.names) {
		checkOP(key);
	}
});

bot.on("nick",function(message){
	console.log(util.inspect(message));
	var removeName = _.where(nameList, {'name': message.old});
	nameList = _.without(nameList, removeName[0]);
	checkOP(message.new);
	
});


//Commands//

bot.on('!dmx', function(command) {
	var dmxChosenPhrase = getRandomInt(0,dmx.phrases.length-1);
	bot.say(command.channel, dmx.phrases[dmxChosenPhrase]);
});

bot.on('!gouf', function (command){
	var goufChosenVid = getRandomInt(0,gouf.items.length-1);
	bot.say(command.channel, gouf.items[goufChosenVid]);
});
bot.on('!hbomb',function (command){
    var timeTilHBOMB = hbombcount(null ,new Date(2015, 0, 16)).toString();
    var randTimer = getRandomInt(0,countdown.items.length-1);
    var HBOMBstr = countdown.items[randTimer];
    bot.say(command.channel, "This is a memorial, that "+timeTilHBOMB+" ago, we won HBOMB.");
    bot.say(command.channel, "Pics: http://imgur.com/a/qvitD , http://imgur.com/a/SjnrQ , http://imgur.com/a/infFt , http://imgur.com/a/0p5VM");
    bot.say(command.channel, "Speech: http://tinyurl.com/qywork4");

});
bot.on('!ugh', function (command){
    var ughRand = getRandomInt(0,ugh.items.length-1);
    bot.say(command.channel, ugh.items[ughRand]);
});
bot.on('!qdb', function (command){
    var randQDB = getRandomInt(1,642);
    bot.say(command.channel, "http://qdb.zero9f9.com/quote.php?id="+randQDB );
});

bot.on('!battlebonk', function (command) {
	
	timeToBonk(command);
	
});

bot.on('!hyokin', function (command) {
    quothTheHyo(command);
});

bot.on('!img', function (command) {
    kind = urls.subs.img;
    randImg(kind, command.channel);
});

bot.on('!gif', function (command){
    kind = urls.subs.gif;
    randImg(kind, command.channel);
});

bot.on('!rando', function (command){
    randoSub(command.args[0], command.channel);
});

bot.on('!translate', function (command) {
    var res = command.args.join(" ").split("/");
    if(_.isEmpty(res[1])){
        detectThatShit(res[0], null ,command);
    }else{
        detectThatShit(res[0],res[1], command);
    }
});

bot.on('!engrish', function (command){
    var res = command.args.join(" ").split("/");
    if(_.isEmpty(res[1])){
        var result = getRandomInt(0,translate.engrish.length -1);
        var resultMsg = translate.engrish[result];
        engrishThatShit(res[0], resultMsg, command);
    }else{
        engrishThatShit(res[0],res[1], command);
    }
});

bot.on('!twit', function (command) {
    searchDaTweet(command.args.join(" "), command);
});

bot.on('!fanfic', function (command){
    userTweet(command, 'Fanfiction_txt');
});        

bot.on('!tweet', function (command){
    searchDaTweet(command.args.join(" "), command);
});

bot.on('error', function (message){
	console.log(message);
});

bot.on('!av', function (command){
	var randHBO = getRandomInt(1,1201210);
	var randAV = getRandomInt(0, av.items.length-1);
	bot.say(command.channel,"http://carnage.bungie.org/haloforum/halo.forum.pl?read="+randHBO);
	bot.say(command.channel, av.items[randAV]);
});

bot.on('!rhyme', function (command){
		var rhymeWord = command.args.join("");
		var urlRhymeBuild = word.wordUrl+word.rhymeUrl+word.apiUrl;
		var urlRhymeBuild = urlRhymeBuild.replace(/<word>/gi, rhymeWord).replace(/<api>/gi, word.api);

	request(urlRhymeBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word, I got no rhymes for you.');
		}else{
			var rhymeData = JSON.parse(body);
			var randRhyme = getRandomInt(0,rhymeData[0].words.length-1);
			var randRhymePos = getRandomInt(0, rhymePos.items.length-1);
			var chosenRhyme = rhymePos.items[randRhymePos];
			var replaceRhyme =  chosenRhyme.replace(/rhymed/gi, rhymeData[0].words[randRhyme]).toUpperCase().replace(/word/gi,command.args.join("").toUpperCase());
			bot.say(command.channel, replaceRhyme);
		}
	});	
});

bot.on('!define', function (command){
	var defineWord = command.args.join("");
	var urlDefineBuild = word.wordUrl+word.defineUrl+word.apiUrl;
	var urlDefineBuild = urlDefineBuild.replace(/<word>/gi, defineWord).replace(/<api>/gi, word.api);

	request(urlDefineBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word, I got no definitions for you.');
		}else{
			var defineData = JSON.parse(body);
			var randDefine = getRandomInt(0, defineData.length-1);
			bot.say(command.channel, defineData[randDefine].word+" ["+defineData[randDefine].partOfSpeech+"] : "+defineData[randDefine].text);
		}
	});	
});

bot.on('!example', function (command){
var exampleWord = command.args.join("");
var urlExampleBuild = word.wordUrl+word.exampleUrl+word.apiUrl;
var urlExampleBuild = urlExampleBuild.replace(/<word>/gi, exampleWord).replace(/<api>/gi, word.api);
request(urlExampleBuild, function (error, response, body) {
	if (error || response.statusCode !== 200 || body.length <= 2){
		bot.say(command.channel,'Try another word. I got no examples for you, jack.');
	}else{
		var exampleData = JSON.parse(body);
		var randExample = getRandomInt(0, exampleData.examples.length-1);
		bot.say(command.channel, exampleData.examples[randExample].text+ " -"+exampleData.examples[randExample].year+", "+exampleData.examples[randExample].title);
	}
});
	
});


bot.on('!hbombforecast', function (command){
	var urlForecast ="https://api.forecast.io/forecast/a0826bcd5ec330beb7cc075b10f2e9c7/48.890123,-121.945702,2015-01-17T12:00:00";
	request(urlForecast, function (error,response, body){
		if (error || response.statusCode !== 200 || body.length <= 2){
			console.log('Error, bro :'+ error);
		}else{
			var forecastData = JSON.parse(body);
			var forecastHBOMB = forecastData.hourly.data[11];
			var date = new Date(forecastHBOMB.time*1000);
			var time = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear();
			bot.say(command.channel,"HBOMB Forecast: "+forecastHBOMB.summary+" - "+forecastHBOMB.temperature+" - Humidity : "+forecastHBOMB.humidity*100+"% - Precipitation : "+forecastHBOMB.precipType+" | "+time);
		}
	});
});


/*
bot.on('!acro', function (command){
	var acroWord = command.args.join("");
	var acLetter = acroWord.split("");
	syncAcro(command, acLetter);
});


bot.on('!syn', function (command){
	syncSyn(command);
});
*/

bot.on('!speak', function (command){
	var audioWord = command.args.join("");
	var urlAudioBuild = word.wordUrl+word.audioUrl+word.apiUrl;
	var urlAudioBuild = urlAudioBuild.replace(/<word>/gi, audioWord).replace(/<api>/gi, word.api);
	request(urlAudioBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word. I got nothing to say to you, fucko.');
		}else{
			var audioData = JSON.parse(body);
			var randAudio = getRandomInt(0, audioData.length-1);
			bot.say(command.channel, audioData[randAudio].fileUrl);
		}
	});
});

bot.on('!pron', function (command){
	var pronWord = command.args.join("");
	var urlPronBuild = word.wordUrl+word.pronUrl+word.apiUrl;
	var urlPronBuild = urlPronBuild.replace(/<word>/gi, pronWord).replace(/<api>/gi, word.api);
	request(urlPronBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word. I got no pronunciations for you, guy.');
		}else{
			var pronData = JSON.parse(body);
			var randPron = getRandomInt(0, pronData.length-1);
			bot.say(command.channel, pronData[randPron].raw);
		}
	});
});

bot.on('!pax',function (command){
    var timeTilPAX = hbombcount(null ,new Date(2015, 7, 28)).toString();
    bot.say(command.channel, "Tentatively, in "+timeTilPAX+", we will PAX.");
});

bot.on('!dorj',function (command){
    bot.say(command.channel, "YA TA! http://i.imgur.com/z3E28VS.jpg");
});

bot.on('!anime',function (command){
    bot.say(command.channel, "http://www.watchcartoononline.com/outlaw-star-episode-2-english-dubbed");
});

bot.on('!tweep', function (command){
    userTweet(command, command.args.join(""));
});        
