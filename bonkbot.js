var argConfig = "./" + process.argv[2] + "NetConfig.json";
var botConfig = require("./botConfig.json"),
	botData = require("./botData.json");

var countdown = botData.countdown,
	translate = botData.translate,
	urls = botData.urls,
	dmx = botData.dmx,
	ugh = botData.ugh,
	randomMsg = botData.randomMsg,
	rhymePos = botData.rhymePos,
	word = botData.word,
	tricked = botData.tricked,
	mad = botData.mad,
	stream = botData.stream,
	old = botData.old;

var irc = require("tennu"),
	winston = require("winston"),
	async = require("async"),
	network = require(argConfig),
	request = require("request"),
	_ = require("lodash-node"),
	MsTranslator = require("mstranslator"),
	latinize = require("latinize"),
	romaji = require("hepburn"),
	hbombcount = require("countdown"),
	twitter = require("twit"),
	geo = require ("geocoder"),
	c = require("irc-colors"),
	cheerio = require("cheerio"),
	util = require("util");

//var specMatch = new RegExp(/[$-/:-?{-~!"^_`\[\]]/);
//var numMatch = new RegExp(/[\d]/);

var letterPattern = new RegExp("[a-zA-Z]");
var requests = 0;

var Tw = new twitter({
	consumer_key: botConfig.twConfig.consumer_key,
	consumer_secret: botConfig.twConfig.consumer_secret,
	access_token: botConfig.twConfig.access_token,
	access_token_secret: botConfig.twConfig.access_token_secret
});

var transClient = new MsTranslator({
	client_id: botConfig.transConfig.client_id,
	client_secret: botConfig.transConfig.client_secret
});

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ level: "debug"}, {level: "error"}, {level: "notice"}, {level: "warn"}, {level: "info"}, {level: "crit"}, {level: "alert"}, {level: "emerg"}),
		new (winston.transports.File)({level: "debug", filename: "./irc-debug.log"}, {level: "irc", filename: "./irc-log.log"})
	]
});

var print = console.log.bind(console);

var ircLogger = function () {
	return {
		debug: print,
		info: print,
		notice: print,
		warning: print,
		error: print,
		crit: print,
		alert: print,
		emerg: print
	}
};

function getRandomInt(min, max) {
	if ((typeof min === "number") && Math.floor(min) === min && (typeof max === "number") && Math.floor(max) === max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	else {
		//logger.error("min or max number is not a valid number");
		throw "min or max number is not a valid number";
	}
}

function detectThatShit(string, to, command) {
	if (string.charAt(string.length - 1) == "~") {
		string = romaji.toHiragana(string);
		var params = { text: string };
	}
	else {
		params = { text: string	};
	}
	
	transClient.initialize_token(function (keys) {
		transClient.detect(params, function (err, data) {
			if (_.isEmpty(to)) {
				translateThatShit(string, "en", data, command);
			}
			else {
				translateThatShit(string, to, data, command);
			}
		});
	});
}

function translateThatShit(string, to, from, command) {
	var params = {
		text: string,
		from: from,
		to: to
	};
	
	transClient.initialize_token(function(keys) {
		transClient.translate(params, function(err, data) {
			if (!err || data !== null) {
				if (to == "ja") {
					data = romaji.fromKana(data);
					console.log(data, to, from);
					bot.say(command.channel, "Translation: " + latinize(data));
				}
				else {
					console.log(data, to, from);
					bot.say(command.channel, "Translation: " + latinize(data));
				}
			}
			else {
				logger.error(err);
				bot.say(command.channel, "ERROR: Please use a supported language code.");
			}
		});
	});
}

function engrishThatShit(string, to, command) {
	params1 = {
		text: string,
		from: "en",
		to: to
	};

	transClient.initialize_token(function(keys) {
		transClient.translate(params1, function(err, data) {
			params2 = {
				text: data,
				from: to,
				to: "en"
			};
			transClient.translate(params2, function(err, data) {
				bot.say(command.channel, "Engrish: " + latinize(data));
			});
		});
	});
}

function wordToAcro(command) {
	var acroLetterArray = command.args.join("").split("");
	var acroResultArray = [];

	_.remove(acroLetterArray, function(n) {
  		return n == "";
	});

	if (_.isEmpty(acroLetterArray)) {
		bot.say(command.channel,"ERROR: You need to enter in some text to acro, bud.");
	}
	else if (acroLetterArray.length - 1 > 20) {
		bot.say(command.channel,"ERROR: Woah buddy, that girth's a bit too much. Scale that shit back.");
	}
	else {
		console.log("good to go");
	
	async.eachSeries(acroLetterArray, acroRequestWord, function(err) {
		if (_.isEmpty(err)) {
			var acroPrintString = acroLetterArray.join(".").toUpperCase()+".: "+acroResultArray.join(" ").toUpperCase();
			bot.say(command.channel, acroPrintString);
		}
		else {
			console.log(err);
			bot.say(command.channel, "ERROR: Something ain't quite right");
		}
	});
	
	}

	function acroRequestWord(currentLetter, callback) {
		var letterPattern = new RegExp('[a-zA-Z]');
		if (letterPattern.test(currentLetter)) {
			var url = word.searchUrl + word.acroAnyUrl + word.apiUrl;
			url = url.replace(/<search>/gi, currentLetter).replace(/<api>/gi, word.api);
			request(url, function (error, response, body) {
				if (error || response.statusCode !== 200) {
					console.log(error);
					callback("error on wordRequest");
				}
				else {
					var wordRequestData = JSON.parse(body);
					try {
						var acroRandomInt = getRandomInt(0, wordRequestData.searchResults.length - 1);
					}
					catch (err) {
						logger.error(err);
						callback('error on randomInt');
					}
					acroResultArray.push(wordRequestData.searchResults[acroRandomInt].word);
					callback();
				}
			});
		}
		else {
			acroResultArray.push(currentLetter);
			callback();
		}
	}
}

function wordToSyn(command) {
	var synWordArray = command.args;
	var synResultArray = [];

	if (_.isEmpty(synWordArray)) {
		bot.say(command.channel,"ERROR: You need to enter in some text to syn, brudda.");
	}
	else {
		async.eachSeries(synWordArray, synRequestWord, function(err) {
			if (_.isEmpty(err)) {
				var synPrintString = ">" + synResultArray.join(" ");
				bot.say(command.channel, synPrintString);
			}
			else {
				console.log(err);
				bot.say(command.channel, "ERROR: Something ain't quite right");
			}
		});
	}
	
	function synRequestWord(currentWord, callback) {
		var url = word.wordUrl + word.thesaurUrl + word.apiUrl;
		url = url.replace(/<word>/gi, currentWord).replace(/<api>/gi, word.api);
		request(url, function (error, response, body) {
			if (error || response.statusCode !== 200) {
				console.log(error);
				synResultArray.push(currentWord);
				callback();	
			}
			else {
				var wordRequestData = JSON.parse(body);
				if (_.isEmpty(wordRequestData[0])) {
					synResultArray.push(currentWord);
   	 	            callback();
   	 	        }
				else {
	   	 	        try {
	    	            var synRandomInt = getRandomInt(0, wordRequestData[0].words.length - 1);
	    	        }
					catch (err) {
	    	            console.log(err);
	    	            synResultArray.push(currentWord);
	   	 	            callback();
	    	        }
	    	        synResultArray.push(wordRequestData[0].words[synRandomInt]);
					callback();
				}
			}
		});
	}
}

function timeToBonk(command)
{
	var from = command.nickname;
	var target = command.args.join(" ");
    try {
        var calcRandomInt = getRandomInt(0, 100);
    } catch (err) {
        logger.error(err);
        callback("err", null)
    }
    try {
        var resultRandomInt = getRandomInt(0, randomMsg.result.length - 1);
    } catch (err) {
        logger.error(err);
        callback("err", null)
    }
    try {
        var attackRandomInt = getRandomInt(0, randomMsg.attacker.length - 1);
    } catch (err) {
        logger.error(err);
        callback("err", null)
    }
	var calcMsg = calcRandomInt.toString() + "% of ";
	var resultMsg = randomMsg.result[resultRandomInt];
	var attackerMsg = randomMsg.attacker[attackRandomInt];

	
	var clonk = c.brown("Battlebonk results: " + calcMsg + target+"'s clonkers " + resultMsg + " by " + from+"'s " + attackerMsg);
	bot.say(command.channel, clonk);
	//var recalcColor = Math.round((calc * (randomMsg.colors.length - 1)) /100);
	var recalcAssess = Math.round((calcRandomInt *(randomMsg.assess.length - 1)) /100);
	//var assessColor = "c."+randomMsg.colors[recalcColor];
	var assessment = randomMsg.assess[recalcAssess];
	console.log(assessment);
	
	bot.say(command.channel, "Battlebonk Status: " + c.red(assessment));

}

function userTweet(command, userString, authText) {
	if (_.isEmpty(userString)) {
		bot.say(command.channel, "No user provided. Come on man, you're better than this.");
	}
	else {
		var userArray = userString.split("|");
		Tw.get("statuses/user_timeline", {screen_name: userArray[0], count: "200", exclude_replies: "true", include_rts: "false"}, function(err, data, response) {
			if (err === null) {
				if (!_.isEmpty(data[0])) {
					if (_.contains(userString, "|")) {
						switch (userArray[1]) {
    						case "name":
        						bot.say(command.channel,  data[0].user.screen_name +"'s Name: "+data[0].user.name);
        					break;
    						case "description":
        						bot.say(command.channel,  data[0].user.screen_name +"'s Bio: "+data[0].user.description);
        					break;
        					case "location":
        						bot.say(command.channel,  data[0].user.screen_name +"'s Location: "+data[0].user.location);
        					break;
    						case "count":
        						bot.say(command.channel,  data[0].user.screen_name +"'s Tweet Count: "+data[0].user.statuses_count);
        					break;
    						default:
        						bot.say(command.channel, "You gotta give me something to look up, brah.");
						}
					}
					else {
						try {
							var tweetRandomInt = getRandomInt(0, data.length - 1);
							}
						catch (err) {
							logger.error(err);
							return;
						}
						var arrTweet = data[tweetRandomInt].text.replace( /\n/g, "`" ).split( "`" );
						//console.log(arrTweet);
						console.log(authText);
						if (authText == true) {
							bot.say(command.channel, data[tweetRandomInt].user.screen_name + ": " + arrTweet);
						}
						else if (authText == false) {
							bot.say(command.channel, arrTweet);
						}
					}
				}
				else {
					bot.say(command.channel, "ERROR: you chose an account with no tweets. Try again, doucher.");
				}
			}
			else {
				bot.say(command.channel, "ERROR: try again, you fucked this up somehow.");
				console.log(err);
			}
		});
	}
}

function searchDaTweet (searchString, command) {
	if (_.isEmpty(searchString)) {
		bot.say(command.channel, "No text provided. Come on man, you're better than this.");
	}
	else {
		Tw.get("search/tweets", {q: searchString, count: "100"}, function(err, data, response) {
			if (err === null) {
				if (data.statuses.length > 0) {
					try {
						var tweetRandomInt = getRandomInt(0, data.statuses.length - 1);
					}
					catch (err) {
						logger.error(err);
						return;
					}
					var arrTweet = data.statuses[tweetRandomInt].text.replace( /\n/g, "`" ).split( "`" );
					console.log(arrTweet);
					bot.say(command.channel, "Tweet from " + data.statuses[tweetRandomInt].user.screen_name + " : " + arrTweet + " ( http://twitter.com/" + data.statuses[tweetRandomInt].user.screen_name + "/status/" + data.statuses[tweetRandomInt].id_str + " )");
				}
				else {
					bot.say(command.channel, "No tweets found, that's pretty shitty.");
				}
			}
			else {
				bot.say(command.channel, "ERROR: you fucked this up duder.");
				console.log(err);
			}
		});
	}
}

function timeToBonk(command) {
	var from = command.nickname;
	var target = command.args.join(" ");

	try {
		var calcRandomInt = getRandomInt(0, 100);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}
	
	if (_.isEmpty(target)) {
		// no nick was given
		var noName = true;
		var bonkingSelf = false;
		bot.say(command.channel, "What, no name?");
		// determine whether to bonk the command issuer
		var selfBonkFate = getRandomInt(1, 4);
		if (selfBonkFate == 4) {
			// prepare to bonk the command issuer
			target = from;
			from = "this bot's own personal ";
			var bonkingSelf = true;						
		}
	}
	else {
		from = from + "'s ";
	}
	
	if (noName && !(bonkingSelf)) {
		// forgive the command issuer for omitting a nick
		bot.say(command.channel, "You're lucky I don't bonk you!");
		return;
	}
	
	try {
		var resultRandomInt = getRandomInt(0, randomMsg.result.length - 1);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}

	try {
		var attackRandomInt = getRandomInt(0, randomMsg.attacker.length - 1);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}

	// build the bonk message
	var calcMsg = calcRandomInt.toString() + "% of ";
	var resultMsg = randomMsg.result[resultRandomInt];
	var attackerMsg = randomMsg.attacker[attackRandomInt];
	
	// deliver the bonk
	var clonk = c.brown("Battlebonk results: " + calcMsg + target + "'s clonkers " + resultMsg + " because of " + from + attackerMsg);
	bot.say(command.channel, clonk);
	
	// assess the damage
	var recalcAssess = Math.round((calcRandomInt * (randomMsg.assess.length - 1)) / 100);
	var assessment = randomMsg.assess[recalcAssess];
	
	bot.say(command.channel, "Battlebonk Status: " + c.red(assessment));
}

function randImg(kind, where) {
	try {
		var redditRandomInt = getRandomInt(0, kind.length - 1);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	
	var urlBuild = urls.reddit + kind[redditRandomInt] + "/random/.json";
	subSelect(urlBuild, where);
}

function randoSub(sub, where) {
	//console.log("sub is:"+" | "+sub+" | ", sub.length);
	var urlBuild = "";
	if (_.isEmpty(sub)) {
		var urlRand = urls.reddit + "random/";
		request(urlRand, function (error, response, body) {
			urlBuild = response.request.uri.href + "random/.json";
			//console.log(urlBuild);
			subSelect(urlBuild, where);
		});
	}
	else {
		urlBuild = urls.reddit + sub + "/random/.json";
		subSelect(urlBuild, where);	
	}
}

function subSelect(urlBuild, where) {
	request(urlBuild, function (error, response, body) {
		var invalidSub = response.request.uri.search;
			if (!error && response.statusCode == 200 && invalidSub === null) {
				var redditData = JSON.parse(body);
				var dataUrl = redditData[0].data.children[0].data;
				//console.log(dataUrl);
				if (dataUrl.over_18 === true) {
					bot.say(where, "Warning: The following is NSFW/NSFL");
				}
				bot.say(where, dataUrl.title + " from r/" + dataUrl.subreddit + " --- " + dataUrl.url);
				
			}
			else if (invalidSub !== null) {
					bot.say(where, "The listed subreddit is not usable, please try another one.");
			}
		}
	);
}

function hboRando(command, avStatus) {
	if (typeof avStatus !== "boolean") {
		logger.error("avStatus is not a valid boolean");
		console.log("avStatus not valid");
	}
	else {
		console.log("Making initial HBO request");
		request({
			url: "http://carnage.bungie.org/haloforum/halo.forum.pl",
			maxRedirects: 2,
			headers: {"User-Agent": "request"}
			},
			function (error, response, body) {
				if (error || response.statusCode !== 200) {
					logger.error(error, response.statusCode);
					console.log("hboRando Request Error");
				}
				else {
					console.log("Here we go");
					var $ = cheerio.load(body);
					var hboTop = $("div#ind_msglist a").attr("name").replace( /^\D+/g, "");
					hboTop = parseInt(hboTop, 10);
					var hboBase = 0;
					switch (command.args.join(" ")) {
						case "new":
							hboBase = Math.round(hboTop * 0.90);
							hboForumScrape(command, avStatus, hboBase, hboTop);
							break;
						case "old":
							hboBase = Math.round(hboTop * 0.50);
							hboTop = Math.round(hboTop * 0.89);
							hboForumScrape(command, avStatus, hboBase, hboTop);
							break;
						case "OLD":
							hboBase = Math.round(hboTop * 0.11);
							hboTop = Math.round(hboTop * 0.49);
							hboForumScrape(command, avStatus, hboBase, hboTop);
							break;
						case "O L D":
							hboTop = Math.round(hboTop * 0.10);
							hboForumScrape(command, avStatus, hboBase, hboTop);
							break;
						default:
							hboForumScrape(command, avStatus, hboBase, hboTop);
					}
				}
			}
		);
	}
}

function hboForumScrape(command, avStatus, hboBase, hboTop) {
	console.log("hboForumScrape is happening");
	if ((typeof hboBase === "number") && Math.floor(hboBase) === hboBase && (typeof hboTop === "number") && Math.floor(hboTop) === hboTop) {

		async.retry(5, hboCheck, hboFormatPost);

		function hboCheck(callback) {
			try {
				var hboRandomPostNumber = getRandomInt(hboBase, hboTop);
			}
			catch (err) {
				logger.error(err);
				console.log("error in random number");
				callback(err, null);
			}

			//var randHBO = getRandomInt(hboBase, hboTop);
			var hboTestUrl = "http://carnage.bungie.org/haloforum/halo.forum.pl?read=" + hboRandomPostNumber;
			request({
				url: hboTestUrl,
				maxRedirects: 2,
				headers: {"User-Agent": "request"}
			},
			function (error, response, body) {
				console.log("Request, hboCheck");
				if (error || response.statusCode !== 200) {
					console.log(error);
					callback("Status Code or Error on Request", null);
					//console.log( "ERROR: HBO is not responding. Claude must be clonking me.");
				}
				else {
					var $ = cheerio.load(body);
					var hboInvalid = $("big big strong").text();
					if (hboInvalid == "No Message!") {
						console.log("bunk, re-routing");
						callback("Invalid Post ID", null);
					}
					else {
						callback(null, {html: $, url: hboTestUrl});
					}
				}
			});
		}

		function hboFormatPost(err, results) {
			if (err) {
				logger.error(err);
				console.log(err);
			}
			else {
				var hboTitle = results.html("div.msg_headln").text();
				var hboTitleAlt = results.html("td.subjectcell b").text();
				var hboPoster = results.html("span.msg_poster").text();
				var hboPosterAlt = results.html("td.postercell").first().text().replace("Posted By:", "").replace(/<(.*?)>/g, "").trim();

				if (avStatus == true) {
					try {
						var randAV = getRandomInt(0, av.items.length - 1);
					}
					catch (err) {
						logger.error(err);
						return;
					}
					bot.say(command.channel, results.url);
					bot.say(command.channel, av.items[randAV].replace(/<user>/gi, hboPoster + hboPosterAlt));
				}
				else {
					bot.say(command.channel, hboTitle + hboTitleAlt + " (" + hboPoster + hboPosterAlt + ") " + results.url);
				}
			}
		}
	}
	else {
		logger.error("hboBase or hboTop is not a valid number");
		console.log("hboBase or hboTop is not a valid number");
	}
}

function calculate (rt, current, lastOp) {
	// does the actual calculating when a user issues a calculation command
	
	switch (lastOp) {
		case "":
		case "(":
			rt = current;
			break;
		case "+":
			rt = rt + current;
			break;
		case "-":
			rt = rt - current;
			break;
		case "*":
		case ")":
			rt = rt * current;
			break;
		case "/":
			rt = rt / current;
			break;
		case "^":
			rt = Math.pow(rt, current);
			break;
	}
	
	return rt;
}

// Start bot //

var bot = irc.Client(network, {Logger: ircLogger});

bot.connect();

var kind = "";

bot.on("join", function(message) {
	if (message.nickname == "StronkBot") {
		//bot.say(message.channel, "StronkBot status: ON. Use !howtobonk for instructions on interacting with StronkBot.");
	}
	else {
		//checkOP(message.nickname);
	}
});

var tsdtvCheck = (function () {
	//  periodically checks for updates in the page the TSDTV stream pulls from and displays them
	
	var timer;
	var series = "";
	var seriesPrev = "";
	var episode = "";
	var episodePrev = "";
	
	// use a closure to preserve information between calls without making global variables
	return {
		count: function () {
			request({
				url: stream.url,
				maxRedirects: 1,
				headers: {"User-Agent": "request"}
				},
				function (error, response, body) {
					if (error || response.statusCode !== 200) {
						console.log(error);
						bot.say(stream.talkChannel, "Error checking TSDTV source page, stopping checking");
						tsdtvCheck.stop();
					}
					else {
						var $ = cheerio.load(body);
						series = $("h4.media-heading").text();
						if (series == "") {
							seriesPrev = "";
							episodePrev = "";
						}
						else {
							// cheerio doesn't make it easy to get anything not directly surrounded by tags
							// get whole contents of the div as a string
							episode = String($("div.media-body").contents());
							// get the third line
							episode = episode.split("\n")[2];
							// remove the extension-- the last . and everything after it
							// would use: episode = episode.replace(/\..$/, ""); but node doesn't run it right
							episode = episode.split(".").slice(0, -1).join(".");
							// get rid of any leading spaces
							episode = episode.replace(/^\s\s*/, "");
							// fix HTML-encoded apostrophes
							// there's no evident easy way to handle all entities,
							// and apostrophe is the only one that seems to show up
							episode = episode.replace("&apos;", "'");
							// output the final string-- if the series or episode is different from the last check
							if (episode !== episodePrev || series !== seriesPrev) {
								bot.say(stream.talkChannel, "Now playing: " + series + " - " + episode);
								if (series !== seriesPrev) {
									seriesPrev = series;
								}
								if (episode !== episodePrev) {
									episodePrev = episode;
								}
							}
						}
					}
				}
			);
			// call me back
			timer = setTimeout(tsdtvCheck.count, stream.timer);
		},
		stop: function () {
			// clear the timeout for running tsdtvCheck.count again
			clearTimeout(timer);
		}
	};
} )();

/*bot.on("quit", function(message) {
	//console.log(util.inspect(message));
	var removeName = _.where(nameList, {"name": message.nickname});
	nameList = _.without(nameList, removeName[0]);
});
*/

/*bot.on("names", function(message) {
	console.log(util.inspect(message));
	for (var key in message.names) {
		checkOP(key);
	}
});

bot.on("nick", function (message) {
	console.log(util.inspect(message));
	var removeName = _.where(nameList, {"name": message.old});
	nameList = _.without(nameList, removeName[0]);
	checkOP(message.new);
});
*/

// Commands //

bot.on("!old", function (command) {
	var target = command.args.join(" ");
	var oldness = getRandomInt(0, old.status.length - 1);
	if (_.isEmpty(target)) {
		bot.say(command.channel, "Old status: [X] " + old.status[oldness]);
	}
	else {
		bot.say(command.channel, "Old status for " + target + ": [X] " + old.status[oldness]);
	}
});

bot.on("!tsdtv", function (command) {
	var cmd = command.args.join("");
	
	if (cmd == "start") {
		tsdtvCheck.count();
	}
	else if (cmd == "stop") {
		tsdtvCheck.stop();
	}
});

bot.on("!big", function (command) {
	var bigger = command.args.join(" ");
	if (bigger.length < 3) {
		bot.say(command.channel, "Get outta here with that weak shit.");
	}
	else {
		bigger = bigger.split("").join(" ").toUpperCase();
		bot.say(command.channel, bigger);
	}
});

bot.on("!calc", function (command) {
	var toCalc = command.args.join("");
	var calcErr = "";
	
	if (toCalc == "" || toCalc == " ") {
		calcErr = "I can't calculate what isn't there";
	}
	else if (toCalc.charAt(0) !== "0" && toCalc.charAt(0) !== "1" && toCalc.charAt(0) !== "2" && toCalc.charAt(0) !== "3" && toCalc.charAt(0) !== "4" && toCalc.charAt(0) !== "5" && toCalc.charAt(0) !== "6" && toCalc.charAt(0) !== "7" && toCalc.charAt(0) !== "8" && toCalc.charAt(0) !== "9") {
		calcErr = "Calculation must start with a number";
	}
	
	// running total
	var rt = 0;
	// current number, used between operations
	var current = 0;
	// last operator detected, used in each calculation
	var lastOp = "";
	// was there just an operator? used to detect incalculable sequences and make parentheses work right
	var recentOp = false;
	// distance past the decimal point, used in building numbers like 1.23
	var pastDecimal = 0;
	// array used as a stack to hold partial results when parentheses are encountered
	var subResult = [];
	// array used as a stack to hold the operation before a left parenthesis
	var oldOps = [];
	// used to keep track of how many parentheses there are
	var parenthCount = {left: 0, right: 0};
	
	// loop through the characters entered after the command and respond to each one
	for (var ind = 0; ind < toCalc.length; ind++) {
		// check if there's been an error, and stop processing the string if there has
		if (!(calcErr === "")) break;
		
		var curChar = toCalc.charAt(ind);
		
		switch (curChar) {
			case "0":
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				recentOp = false;
				if (pastDecimal === 0) {
					// adjust the current number for the newest digit
					current = (current * 10) + parseInt(curChar, 10);
				}
				else {
					// adjust the current number for the newest digit after the decimal point
					// use the current position past the decimal point to scale the adjustment
					current = current + ((Math.pow((0.1), pastDecimal) * parseInt(curChar, 10)));
					pastDecimal++;
				}
				break;
			case "+":
			case "-":
			case "*":
			case "/":
			case "^":
				if (recentOp && lastOp == "(") {
					calcErr = "Operator error in parentheses";
				}
				else if (recentOp && lastOp !== ")") {
					calcErr = "Consecutive operators";
				}
				else if (recentOp && lastOp == ")") {
					// replace ")" operator with the new one and don't calculate
					// stuff inside and before the parentheses was already calculated
					lastOp = curChar;
				}
				else {
					rt = calculate(rt, current, lastOp);
					// reset things
					current = 0;
					pastDecimal = 0;
					// set up the next operation
					recentOp = true;
					lastOp = curChar;
				}
				break;
			case ".":
				if (pastDecimal === 0) {
					pastDecimal = 1;
				}
				else {
					calcErr = "Attempted use of multiple decimal points in one number";
				}
				break;
			case "(":
				parenthCount.left++;
				if (lastOp == ")") {
					// move data over to make (x)(y) work right
					current = rt;
				}
				if (!recentOp) {
					// calculate current running total and store it before setting the pending operation,
					// so the behavior for x(y) is appropriate
					rt = calculate(rt, current, lastOp);
					lastOp = ")";
				}
				// push over rt and lastOp for later use
				oldOps.push(lastOp);
				subResult.push(rt);
				// reset things for use in sub-expression
				rt = 0;
				current = 0;
				pastDecimal = 0;
				recentOp = true;
				lastOp = curChar;
				break;
			case ")":
				parenthCount.right++;
				if (parenthCount.right > parenthCount.left) {
					calcErr = "Mismatched parentheses";
				}
				else if (recentOp && lastOp !== ")") {
					calcErr = "Operator error in parentheses";
				}
				else {
					if (!recentOp) {
						rt = calculate(rt, current, lastOp);						
					}
					// move rt and pop last subtotal and pending operation
					current = rt;
					rt = subResult.pop();
					if (rt === undefined) {
						// catch unlikely (hopefully impossible?) error when there's nothing to pop
						calcErr = "Sub-expression error (stack error with rt, possible mismatched parentheses)";
					}
					lastOp = oldOps.pop();
					if (lastOp === undefined) {
						// catch unlikely (hopefully impossible?) error when there's nothing to pop
						calcErr = "Sub-expression error (stack error with lastOp, possible mismatched parentheses)";
					}
					// calculate a new running total taking into account the subtotal
					// from before the parentheses and the subtotal from within the parentheses
					rt = calculate(rt, current, lastOp);
					// reset everything
					current = 0;
					pastDecimal = 0;
					recentOp = true;
					lastOp = curChar;
				}
				break;
			default:
				// anything that's not a digit, a decimal point, an operator, or parentheses
				calcErr = "Disallowed character(s)";
				break;
		}
		
		// check for various shenanigans in the result
		if (isFinite(rt) === false || isNaN(rt) === true) {
			calcErr = "Result out of range, undefined, or indeterminate";
		}
		
		// check at the beginning and end of the loop to catch early and late calculation issues
		// and prevent any from slipping through
		if (!(calcErr === "")) break;
	}
	
	// check one last time for balanced parentheses,
	// but don't let premature stoppage of calculation give the wrong error
	if (parenthCount.left !== parenthCount.right && calcErr === "") {
		calcErr = "Mismatched parentheses"
	}
	
	// factor in the last number and operator if the expression ended with a number
	if (!recentOp) {
		rt = calculate(rt, current, lastOp);
	}
	
	// check for validity again to prevent issues caused by short inputs from slipping through
	if (isFinite(rt) === false || isNaN(rt) === true) {
		calcErr = "Result out of range, undefined, or indeterminate";
	}
	
	if (calcErr === "") {
		// display the final result
		bot.say(command.channel, rt);
	}
	else {
		// there was an error somewhere, tell the user what happened
		bot.say(command.channel, "Could not calculate: " + calcErr);
	}
});

bot.on("!care", function (command) {
	// this function is a mix of arbitrary numbers, personal preference, and presentation
	
	try {
		var careAmount = getRandomInt(0, 101);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	
	var careMsg = "Care-o-meter: ";
	
	// use an if block because JS only supports ranges in switch case under certain circumstances
	if (careAmount >= 0 && careAmount <= 9) {
		careMsg = careMsg + "(' ' ') not even registering";
	}
	else if (careAmount >= 10 && careAmount <= 21) {
		careMsg = careMsg + "(\\ ' ')";
	}
	else if (careAmount >= 22 && careAmount <= 33) {
		careMsg = careMsg + "('\\' ')";
	}
	else if (careAmount >= 34 && careAmount <= 45) {
		careMsg = careMsg + "(' \\ ')";
	}
	else if (careAmount >= 46 && careAmount <= 54) {
		careMsg = careMsg + "(' | ') meh";
	}
	else if (careAmount >= 55 && careAmount <= 72) {
		careMsg = careMsg + "(' / ')";
	}
	else if (careAmount >= 73 && careAmount <= 88) {
		careMsg = careMsg + "(' '/')";
	}
	else if (careAmount >= 89 && careAmount <= 98) {
		careMsg = careMsg + "(' ' /)";
	}
	else if (careAmount >= 99) {
		careMsg = careMsg + "(' ' ')/ so much care it broke the meter";
	}
	
	bot.say(command.channel, careMsg);
});

bot.on("!mad", function (command) {
	var target = command.args.join(" ");
	
	try {
		var madChosenStatus = getRandomInt(0, mad.status.length - 1);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	
	if (_.isEmpty(target)) {
		bot.say(command.channel, "Mad status: [X] " + mad.status[madChosenStatus]);
	}
	else {
		bot.say(command.channel, "Mad status for " + target + ": [X] " + mad.status[madChosenStatus]);
	}
});

bot.on("!dmx", function(command) {
	try {
		var dmxRandomInt = getRandomInt(0, dmx.phrases.length - 1);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	bot.say(command.channel, dmx.phrases[dmxRandomInt]);
});

bot.on("!ugh", function (command) {
	try {
		var ughRandomInt = getRandomInt(0, ugh.items.length - 1);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	bot.say(command.channel, ugh.items[ughRandomInt]);
});

bot.on("!qdb", function (command) {
	request("http://qdb.zero9f9.com/", function (error, response, body) {
		if (error || response.statusCode !== 200) {
			console.log(error, response.statusCode);
			bot.say(command.channel, "ERROR: Something's not right with QDB. Maybe it's down.")
		}
		else {
			var $ = cheerio.load(body);
			var match = $("div.quoteIDBox a").map(function(i, el) { return $(this).attr("href") }).get();
			try {
				var qdbRandomInt = getRandomInt(0, match.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			var newMatch = "http://qdb.zero9f9.com/quote.php?id=" + match[qdbRandomInt].replace( /^\D+/g, "");
			bot.say(command.channel, newMatch);
		}
	});
});

bot.on("!battlebonk", function (command) {
	timeToBonk(command);
});

bot.on("!img", function (command) {
	randImg(urls.subs.img, command.channel);
});

bot.on("!gif", function (command) {
	randImg(urls.subs.gif, command.channel);
});

bot.on("!rando", function (command) {
	randoSub(command.args.join(""), command.channel);
});

bot.on("!translate", function (command) {
	var res = command.args.join(" ").split("/");
	var setLanguage = res[1];
	var translationString = res[0];
	if (_.isEmpty(setLanguage)) {
		detectThatShit(translationString, null, command);
	}
	else {
		detectThatShit(translationString, setLanguage, command);
	}
});

bot.on("!engrish", function (command) {
	var res = command.args.join(" ").split("/");
	if (_.isEmpty(res[1])) {
		try {
			var engrishRandomInt = getRandomInt(0, translate.engrish.length - 1);
		}
		catch (err) {
			logger.error(err);
			return;
		}
		var resultMsg = translate.engrish[engrishRandomInt];
		engrishThatShit(res[0], resultMsg, command);
	}
	else {
		engrishThatShit(res[0], res[1], command);
	}
});

bot.on("!gif", function (command) {
	kind = urls.subs.gif;
	randImg(kind, command.channel);
});

bot.on("!tweet", function (command) {
    searchDaTweet(command.args.join(" "), command);
});

bot.on("!fanfic", function (command) {
    userTweet(command, "Fanfiction_txt", true);
});

bot.on("!bazoop", function (command) {
    userTweet(command, "bazooper", false);
});

bot.on("!translate", function (command) {
	var res = command.args.join(" ").split("/");
	if (_.isEmpty(res[1])) {
		detectThatShit(res[0], null, command);
	}
	else {
		detectThatShit(res[0], res[1], command);
	}
});

bot.on("!hbo", function (command) {
	hboRando(command, false);
});

bot.on("!rhyme", function (command) {
	var rhymeWord = command.args.join("");
	var urlRhymeBuild = word.wordUrl+word.rhymeUrl+word.apiUrl;
	urlRhymeBuild = urlRhymeBuild.replace(/<word>/gi, rhymeWord).replace(/<api>/gi, word.api);
	
	request(urlRhymeBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2) {
			bot.say(command.channel, "Try another word, I've got no rhymes for you, ya heard?");
		}
		else {
			var rhymeData = JSON.parse(body);
			try {
				var rhymeRandomInt = getRandomInt(0, rhymeData[0].words.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			try {
				var phraseRandomInt = getRandomInt(0, rhymePos.items.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			var chosenRhyme = rhymePos.items[phraseRandomInt];
			var replaceRhyme =  chosenRhyme.replace(/rhymed/gi, rhymeData[0].words[rhymeRandomInt]).toUpperCase().replace(/word/gi, command.args.join("").toUpperCase());
			bot.say(command.channel, replaceRhyme);
		}
	});
});

bot.on("!define", function (command) {
	var defineWord = command.args.join("");
	var urlDefineBuild = word.wordUrl+word.defineUrl+word.apiUrl;
	urlDefineBuild = urlDefineBuild.replace(/<word>/gi, defineWord).replace(/<api>/gi, word.api);

	request(urlDefineBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2) {
			bot.say(command.channel, "Try another word, I've got no definitions for you.");
		}
		else {
			var defineData = JSON.parse(body);
			try {
				var defineRandomInt = getRandomInt(0, defineData.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			bot.say(command.channel, defineData[defineRandomInt].word+" ["+defineData[defineRandomInt].partOfSpeech+"] : "+defineData[defineRandomInt].text);
		}
	});	
});

bot.on("!example", function (command) {
	var exampleWord = command.args.join("");
	var urlExampleBuild = word.wordUrl + word.exampleUrl + word.apiUrl;
	urlExampleBuild = urlExampleBuild.replace(/<word>/gi, exampleWord).replace(/<api>/gi, word.api);
	request(urlExampleBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2) {
			bot.say(command.channel, "Try another word. I got no examples for you, jack.");
		}
		else {
			var exampleData = JSON.parse(body);
			try {
				var exampleRandomInt = getRandomInt(0, exampleData.examples.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			bot.say(command.channel, exampleData.examples[exampleRandomInt].text + " -" + exampleData.examples[exampleRandomInt].year + ", " + exampleData.examples[exampleRandomInt].title);
		}
	});
});

bot.on("!acro", function (command) {
	wordToAcro(command);
});


bot.on("!syn", function (command) {
	wordToSyn(command);
});


bot.on("!speak", function (command) {
	var audioWord = command.args.join("");
	var urlAudioBuild = word.wordUrl + word.audioUrl + word.apiUrl;
	urlAudioBuild = urlAudioBuild.replace(/<word>/gi, audioWord).replace(/<api>/gi, word.api);
	request(urlAudioBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2) {
			bot.say(command.channel, "Try another word. I have nothing to say to you.");
		}
		else {
			var audioData = JSON.parse(body);
			try {
				var audioRandomInt = getRandomInt(0, audioData.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			bot.say(command.channel, audioData[audioRandomInt].fileUrl);
		}
	});
});

bot.on("!pron", function (command) {
	var pronWord = command.args.join("");
	var urlPronBuild = word.wordUrl+word.pronUrl+word.apiUrl;
	urlPronBuild = urlPronBuild.replace(/<word>/gi, pronWord).replace(/<api>/gi, word.api);
	request(urlPronBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2) {
			bot.say(command.channel, "Try another word. I've got no pronunciations for you, guy.");
		}
		else {
			var pronData = JSON.parse(body);
			try {
				var pronounceRandomInt = getRandomInt(0, pronData.length - 1);
			}
			catch (err) {
				logger.error(err);
				return;
			}
			bot.say(command.channel, pronData[pronounceRandomInt].raw);
		}
	});
});

bot.on("!pax", function (command) {
	var timeTilPAX = hbombcount(null, new Date(2015, 7, 28)).toString();
	bot.say(command.channel, "Tentatively, in " + timeTilPAX + ", we will PAX.");
});

bot.on("!tweep", function (command) {
    userTweet(command, command.args.join(""), true);
});        

bot.on("!tricked", function (command) {
	try {
		var trickedRandomInt = getRandomInt(0, tricked.items.length - 1);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	bot.say(command.channel, ">tfw " + tricked.items[trickedRandomInt]);
});
