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
	hyokin = botData.hyokin,
	randomMsg = botData.randomMsg;

var config = {
	channels: botConfig.botSettings.channels,
	server: botConfig.botSettings.server,
	botName: botConfig.botSettings.botName
};

// Get the lib
var irc = require("irc"),
request = require('request'),
_ = require('lodash-node'),
MsTranslator = require('mstranslator'),
latin = require('./node_modules/latinise/latinise'),
romaji = require("hepburn"),
hbombcount = require("countdown"),
twitter = require('twit'),
geo = require ('geocoder'),
util = require('util');


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

function quothTheHyo(sub, from){
        var hyoChosenFact = hyokin.items[getRandomInt(0,hyokin.items.length-1)];
        var person = sub;
 
        if (_.isEmpty(sub)){
                person = 'Hyokin';
        }
 
        //ideally the "%hyo" keyword should be defined elsewhere and referenced via variable here
        bot.say(config.channels[0], '>' + hyoChosenFact.replace(/Hyokin/gi, person));
}

function detectThatShit(string, to){

	if(string.charAt(string.length - 1) == "~"){
	string = romaji.toHiragana(string);
	params = { text: string };
}else{
	params = { text: string	};
}
	
	transClient.initialize_token(function(keys){
		transClient.detect(params, function(err, data){
			if (_.isEmpty(to)){
				translateThatShit(string, "en", data);
			}else{
				translateThatShit(string, to, data);
			}
		});
	});

}

function translateThatShit(string, to, from){
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
						bot.say(config.channels[0],"Translation: "+data.latinise());
					}else{
						console.log(data, to, from);
						bot.say(config.channels[0],"Translation: "+data.latinise());
					}
				}else{
        			
        			bot.say(config.channels[0],"ERROR: Please use a supported language code.");
        		}
    		});
	});
}

function engrishThatShit(string, to){
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
				bot.say(config.channels[0],"Engrish: "+data.latinise());
			});
		});
	});


			

}

function timeToBonk(from, target)
{
	var calc = getRandomInt(0,100);
	var result = getRandomInt(0,randomMsg.result.length -1);
	var attacker = getRandomInt(0,randomMsg.attacker.length -1);
	var calcMsg = calc.toString() + "% of ";
	var resultMsg = randomMsg.result[result];
	var attackerMsg = randomMsg.attacker[attacker];
	
	clonk = irc.colors.wrap("orange", "Battlebonk results: " + calcMsg + target+"'s clonkers " + resultMsg + " by " + from+"'s " + attackerMsg);
	bot.say(config.channels[0], clonk);
	var recalcColor = Math.round((calc * (randomMsg.colors.length - 1)) /100);
	var recalcAssess = Math.round((calc *(randomMsg.assess.length - 1)) /100);
	assessment = irc.colors.wrap(randomMsg.colors[recalcColor],randomMsg.assess[recalcAssess]);
	bot.say(config.channels[0], "Battlebonk Status: " + assessment);

}

function userTweet(text){

var AllTweets = [];
var currentTweets = [];

	Tw.get('statuses/user_timeline', {screen_name: 'fanfiction_txt', count:'200', exclude_replies:'true', include_rts:'false'}, function(err, data, response){
			var randTweet = getRandomInt(0,data.length-1);
			bot.say(config.channels[0], "Fanfiction_txt: " +data[randTweet].text);
		});

}

function searchDaTweet (searchString) {

	if (_.isEmpty(searchString)){
		bot.say(config.channels[0], "No text provided. Come on man, you're better than this.");

	}else if(_.contains(searchString,"|")){

		var searchArray = searchString.split("|");
		geo.geocode(searchArray[1], function(err, data){
			if(data.status == 'OK'){
				Tw.get('search/tweets', {q: searchString, count:'100', geocode: data.results[0].geometry.location.lat+','+data.results[0].geometry.location.lng+',10mi'}, 
				function(err, data, response){
					if(data.statuses.length > 0){
					var randTweet = getRandomInt(0,data.statuses.length-1);
			bot.say(config.channels[0], "Tweet from "+ data.statuses[randTweet].user.screen_name+" : "+data.statuses[randTweet].text +" (http://twitter.com/"+data.statuses[randTweet].user.screen_name+"/status/"+data.statuses[randTweet].id_str+")");
				}else{
					bot.say(config.channels[0], "No tweets found, that's pretty shitty.");

				}

				});
			}else{
			bot.say(config.channels[0], "Location not found, or like an error happened. I don't know, man.");

		}

});
	}else{

	Tw.get('search/tweets', {q: searchString, count:'100'}, function(err, data, response){
		if(data.statuses.length > 0){
			var randTweet = getRandomInt(0,data.statuses.length-1);
			bot.say(config.channels[0], "Tweet from "+ data.statuses[randTweet].user.screen_name+" : "+data.statuses[randTweet].text +" (http://twitter.com/"+data.statuses[randTweet].user.screen_name+"/status/"+data.statuses[randTweet].id_str+")");
			}else{
					bot.say(config.channels[0], "No tweets found, that's pretty shitty.");

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


var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

var commands = {
		img: '^#'+urls.commands[0]+'(.*)$',
		gif: '^#'+urls.commands[1]+'(.*)$',
		howtoimg:	'^#'+urls.commands[2]+'(.*)$',
		clonk:		'^#'+urls.commands[3]+'(.*)$',
		battlebonk: '^#'+randomMsg.commands[0]+'(.*)$',
		howtobonk:	'^#'+randomMsg.commands[1]+'(.*)$',
		rando: '^#'+urls.commands[4]+'(.*)$',
		dmx: '^#'+dmx.commands+'(.*)$',
		gouf: '^#'+gouf.commands+'(.*)$',
		hyo: '^#'+hyokin.commands+'(.*)$',
		trans: '^#'+translate.commands[0]+'(.*)$',
		howtrans: '^#'+translate.commands[1]+'(.*)$',
		engrish: '^#'+translate.commands[2]+'(.*)$',
		hbomb: '^#'+countdown.commands+'(.*)$',
		ugh: '^#'+ugh.commands+'(.*)$',
		fanfic:'^#'+Tweet.commands[1]+'(.*)$',
		twit: '^#'+Tweet.commands[0]+'(.*)$',
		tweet: '^#'+Tweet.commands[2]+'(.*)$',
		qdb: '^#'+qdb.commands+'(.*)$'


	};
	var imgPattern = new RegExp(commands.img);
	var gifPattern = new RegExp(commands.gif);
	var howPattern = new RegExp(commands.howtoimg);
	var clonkPattern = new RegExp(commands.clonk);
	var bonkPattern = new RegExp(commands.battlebonk);
	var howbonkPattern = new RegExp(commands.howtobonk);
	var howtransPattern = new RegExp(commands.howtrans);
	var randoPattern = new RegExp(commands.rando);
	var dmxPattern = new RegExp(commands.dmx);
	var goufPattern = new RegExp(commands.gouf);
	var hyoPattern = new RegExp(commands.hyo);
	var transPattern = new RegExp(commands.trans);
	var engrishPattern = new RegExp(commands.engrish);
	var hbombPattern = new RegExp(commands.hbomb);
	var ughPattern = new RegExp(commands.ugh);
	var fanficPattern = new RegExp(commands.fanfic);
	var twitPattern = new RegExp(commands.twit);
	var tweetPattern = new RegExp(commands.tweet);
	var qdbPattern = new RegExp(commands.qdb);
	var kind= '';

bot.addListener("join", function(channel, who, message){
	if(who == "BonkBot"){
		bot.say(config.channels[0],"BonkBot Online.... use #howtobonk for instructions and running modules");
		
	}else{
		checkOP(who);
	}
});

bot.addListener("quit",function(name, reason, channels, message){
	var removeName = _.where(nameList, {'name': name});
	nameList = _.without(nameList, removeName[0]);
});


bot.addListener("names",function(channel, names){
	for (var key in names) {
		checkOP(key);
	}
});

bot.addListener("nick",function(oldnick, newnick, channel, message){
	//console.log(oldnick, newnick);
	var removeName = _.where(nameList, {'name': oldnick});
	nameList = _.without(nameList, removeName[0]);
	checkOP(newnick);
	
});


bot.addListener("message"+config.channels[0], function(from, text, message) {

	//Only needs to be matched if the command means to capture text
	var bonkMatch = text.match(bonkPattern);
	var randoMatch = text.match(randoPattern);
	var hyoMatch = text.match(hyoPattern);
	var transMatch = text.match(transPattern);
	var engrishMatch = text.match(engrishPattern);
	var twitMatch = text.match(twitPattern);
	var tweetMatch = text.match(tweetPattern);


	if(howPattern.test(text) | howbonkPattern.test(text)){
		bot.say(config.channels[0],"Sending list of commands your way, " + from);
		bot.say(from, "--Battlebonk--");
		bot.say(from, "To initiate battlebonk use command: #battlebonk <target>");
		bot.say(from, "Make sure <target> is someone currently in the chat. Otherwise you could bonk yourself");
		bot.say(from, "--ImageRoulette--");
		bot.say(from, "To get a random image or gif use: #img or #gif");
		bot.say(from, "Note: Gifs may still come up in image randomizer.");
		bot.say(from, "To get a random post from any subreddit, use #rando <target>");
		bot.say(from, "If no target is specified, a random subreddit will be selected for you.");
		bot.say(from, "Warning: Not all random posts will be images or gifs and the sfw value depends on the subreddit.");
		bot.say(from, "--DMX--");
		bot.say(from, "use #dmx to deploy a DMX signature bark and video");
		bot.say(from, "--Gouf--");
		bot.say(from, "use #gouf to deploy a ;_;7 for all the goufs lost over the years");
		bot.say(from, "--Hyokin--");
		bot.say(from, "use #hyokin to get some much needed Hyokin facts");
		bot.say(from, "leave it blank for hyokin classic, or add a <target> to make a new fact. Custom made.");
		bot.say(from, "--Translate--");
		bot.say(from, "use #translate to translate text to English or other languages");
		bot.say(from, "leave it blank for translation to English, or add /<language code> to translate in that language. For a list of language codes, use #howtotranslate");
		bot.say(from, "NOTE: if you want to translate Romaji Japanese, end the string with ~");
		bot.say(from, "use #engrish to translate text to a designated language or random language then back to english. See what gets lost in translation!");
		bot.say(from, "--Twit--");
		bot.say(from, "use #twit <string> to search for a random tweet with that string. Add |<location> for location based searches.");
		bot.say(from, "use #fanfic to pull a random fanfiction_txt post from the past 200.");


		
	}

	if(howtransPattern.test(text)){
		bot.say(from,"Use #translate <text>/<language code> to translate.");
		bot.say(from,"---Full List of Language Codes---");
		bot.say(from,"ar: Arabic"+" | "+"bg: Bulgarian"+" | "+"ca: Catalan"+" | "+"zh-CHS: Chinese"+" | "+"cs: Czech"+" | "+"da: Danish"+" | "+"nl: Dutch"+" | "+"en: English"+" | "+"et: Estonian"+" | "+"fi: Finnish"+" | "+"fr: French"+" | "+"de: German"+" | "+"el: Greek"+" | "+"ht: Haitian Creole"+" | "+"he: Hebrew"+" | "+"hi: Hindi"+" | "+"mww: Hmong Daw"+" | "+"hu: Hungarian"+" | "+"id: Indonesian"+" | "+"it: Italian");
		bot.say(from,"ja: Japanese"+" | "+"tlh: Klingon"+" | "+"ko: Korean"+" | "+"lv: Latvian"+" | "+"lt: Lithuanian"+" | "+"ms: Malay"+" | "+"mt: Maltese"+" | "+"no: Norwegian"+" | "+"fa: Persian"+" | "+"pl: Polish"+" | "+"pt: Portuguese"+" | "+"ro: Romanian"+" | "+"ru: Russian"+" | "+"sk: Slovak"+" | "+"sl: Slovenian"+" | "+"es: Spanish"+" | "+"sv: Swedish"+" | "+"th: Thai"+" | "+"tr: Turkish"+" | "+"uk: Ukrainian"+" | "+"ur: Urdu"+" | "+"vi: Vietnamese"+" | "+"cy: Welsh");

	}

	if (bonkPattern.test(text)){

		var givenName = bonkMatch[1].trim();
		var selectedName = _.some(nameList, {'name': givenName});
		
		//console.log('========================================');
		//console.log('givenName: ', givenName);
		//console.log('nameList: ', nameList);
		//console.log('Selected Name: ', selectedName);

		if (selectedName){
			timeToBonk(from, givenName);	
		}else {
			if (clonkometer === 0){
				clonkometer++;
				bot.say(config.channels[0], "Please enter the name of someone in the chat. You're dangerously close to bonking yourself, " + from);
			} else if (clonkometer === 1){
				clonkometer++;
				bot.say(config.channels[0], "Next person to fuck this up, you're gonna get bonked.");
			} else if (clonkometer > 1){
				timeToBonk(from, from);
			}
		}
	}
	
	if (imgPattern.test(text) ){
		kind = urls.subs.img;
		randImg(kind, config.channels[0]);
	}

	if(gifPattern.test(text)){
		kind = urls.subs.gif;
		randImg(kind, config.channels[0]);
	}
		
	if(clonkPattern.test(text)){
		if(from == "Paddy" || from == "Paddyfly_in_the_Sky"){
			offQuestion = true;
			bot.say(from, "What's my real name?");
		}else{
			bot.say(from, "You're not Paddy, fuck off.");
		}
	}

	if(randoPattern.test(text)){
		randoSub(randoMatch[1].trim(), config.channels[0]);
	}

	if(dmxPattern.test(text)){
		var dmxChosenPhrase = getRandomInt(0,dmx.phrases.length-1);
		bot.say(config.channels[0], dmx.phrases[dmxChosenPhrase]);
	}

	if(goufPattern.test(text)){
		var goufChosenVid = getRandomInt(0,gouf.items.length-1);
		bot.say(config.channels[0], gouf.items[goufChosenVid]);
	}

	if(hyoPattern.test(text)){

		quothTheHyo(hyoMatch[1].trim(), from);
		
	}

	if(transPattern.test(text)){
		var res = transMatch[1].trim().split("/");
		//console.log(res);
		if(_.isEmpty(res[1])){
			detectThatShit(res[0]);
		}else{
			detectThatShit(res[0],res[1]);
		}
	}

	if(engrishPattern.test(text)){
		var res = engrishMatch[1].trim().split("/");
		if(_.isEmpty(res[1])){
			var result = getRandomInt(0,translate.language.length -1);
			var resultMsg = translate.language[result];
			engrishThatShit(res[0], resultMsg);
		}else{
			engrishThatShit(res[0],res[1]);
		}
	}

	if(hbombPattern.test(text)){
		var timeTilHBOMB = hbombcount(null ,new Date(2015, 0, 16)).toString();
		var randTimer = getRandomInt(0,countdown.items.length-1);
		var HBOMBstr = countdown.items[randTimer];
		bot.say(config.channels[0], HBOMBstr.replace("<time>",timeTilHBOMB));
	}

	if(ughPattern.test(text)){
		var ughRand = getRandomInt(0,ugh.items.length-1);
		bot.say(config.channels[0], ugh.items[ughRand]);
	}

	if(fanficPattern.test(text)){
		userTweet(text);		
	}

	if(twitPattern.test(text)){
		searchDaTweet(twitMatch[1].trim());
	}

	if(tweetPattern.test(text)){
		searchDaTweet(tweetMatch[1].trim());
	}

	if(qdbPattern.test(text)){
		var randQDB = getRandomInt(1,642);
		bot.say(config.channels[0], "http://qdb.zero9f9.com/quote.php?id="+randQDB );
	}

});
bot.addListener("pm", function(from, text, message) {

	//Only needs to be matched if the command means to capture text
	var randoMatch = text.match(randoPattern);

	if(offQuestion == true && text == "Bonkulous"){
		bot.say(config.channels[0], "BonkBot offline...");
		bot.disconnect("SeeYouNextTimeSpaceCowboy");
	}else if (offQuestion == true){
		bot.say(from, "You're gonna have to try hard than that");
	}

	if (imgPattern.test(text) ){
		kind = urls.subs.img;
		randImg(kind, from);
	}

	if(gifPattern.test(text)){
		kind = urls.subs.gif;
		randImg(kind, from);
	}

	if(randoPattern.test(text)){
		randoSub(randoMatch[1].trim(), from);
	}

});