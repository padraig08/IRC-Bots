var botConfig = require('./botConfig.json'),
botData = require('./botData.json');

var countdown = botData.countdown,
	Tweet = botData.Tweet,
	qdb = botData.qdb,
	translate = botData.translate,
	urls = botData.urls,
	dmx = botData.dmx,
	gouf = botData.gouf,
	ugh = botData.ugh,
	randomMsg = botData.randomMsg,
	av = botData.av,
	rhymePos = botData.rhymePos;

// Get the lib
var irc = require('tennu'),
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
util = require('util'),
rhyme = require('rhyme-plus'),
Dictionary = require('mw-dictionary'),
moby = require('moby');


var Tw = new twitter({
    consumer_key: botConfig.twConfig.consumer_key,
    consumer_secret: botConfig.twConfig.consumer_secret,
    access_token: botConfig.twConfig.access_token,
    access_token_secret: botConfig.twConfig.access_token_secret
});

var dict = new Dictionary({
		key: botConfig.defConfig.defKey
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

function userTweet(command){

var AllTweets = [];
var currentTweets = [];

	Tw.get('statuses/user_timeline', {screen_name: 'fanfiction_txt', count:'200', exclude_replies:'true', include_rts:'false'}, function(err, data, response){
			var randTweet = getRandomInt(0,data.length-1);
			var arrTweet = data[randTweet].text.replace( /\n/g, "`" ).split( "`" );
			console.log(arrTweet);
			bot.say(command.channel, "Fanfiction_txt: " +arrTweet);
		});

}

function searchDaTweet (searchString, command) {
	console.log(searchString);
	if (_.isEmpty(searchString)){
		bot.say(command.channel, "No text provided. Come on man, you're better than this.");

	}else if(_.contains(searchString,"|")){

		var searchArray = searchString.split("|");
		geo.geocode(searchArray[1], function(err, data){
			if(data.status == 'OK'){
				Tw.get('search/tweets', {q: searchString, count:'100', geocode: data.results[0].geometry.location.lat+','+data.results[0].geometry.location.lng+',10mi'}, 
				function(err, data, response){
					if(data.statuses.length > 0){
					var randTweet = getRandomInt(0,data.statuses.length-1);
					var arrTweet = data.statuses[randTweet].text.replace( /\n/g, "`" ).split( "`" );
					console.log(arrTweet);
					bot.say(command.channel, "Tweet from "+ data.statuses[randTweet].user.screen_name+" : "+ arrTweet +" (http://twitter.com/"+data.statuses[randTweet].user.screen_name+"/status/"+data.statuses[randTweet].id_str+")");
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
			var randTweet = getRandomInt(0,data.statuses.length-1);
			var arrTweet = data.statuses[randTweet].text.replace( /\n/g, "`" ).split( "`" );
			console.log(arrTweet);
			bot.say(command.channel, "Tweet from "+ data.statuses[randTweet].user.screen_name+" : "+arrTweet+" (http://twitter.com/"+data.statuses[randTweet].user.screen_name+"/status/"+data.statuses[randTweet].id_str+")");
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
				//console.log(dataUrl);
				
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
    bot.say(command.channel, HBOMBstr.replace("<time>",timeTilHBOMB));
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
    userTweet(command);
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
	rhyme(function (r) {
		var rhymes = r.rhyme(command.args.join(""));
		var randRhyme = getRandomInt(0,rhymes.length-1);
		var randRhymePos = getRandomInt(0, rhymePos.items.length-1);
		var chosenRhyme = rhymePos.items[randRhymePos];
		var replaceRhyme =  chosenRhyme.replace(/rhymed/gi, rhymes[randRhyme]).replace(/word/gi,command.args.join("").toUpperCase());
		if(rhymes[randRhyme] == undefined){
			bot.say(command.channel, "Choose a better word, I got no rhymes for you.");
		}else{
			bot.say(command.channel, replaceRhyme);
		}
	});
});

bot.on('!define', function (command){
	var defineWord = command.args.join(" ");
	dict.define(defineWord, function(error, result){
	if (error == null) {
		for(var i=0; i<result.length; i++){
			bot.say(command.channel, i+'. '+result[i].partOfSpeech+ " : "+result[i].definition);
		}
	}
	else if (error === "suggestions"){
		bot.say(command.channel, ' not found in dictionary. Possible suggestions:');
		for (var i=0; i<result.length; i++){
			bot.say(command.channel, result[i]);
		}
	}
	else console.log(error);
	});
});

bot.on('!syn', function (command){
	var inward = command.args.join("");
	var synonyms = moby.search(inward);
	console.log(synonyms);
	print(command.args);
});