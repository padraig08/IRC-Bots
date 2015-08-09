var argConfig = "./" + process.argv[2] + "NetConfig.json";
var botConfig = require("./botConfig.json"),
	botData = require("./botData.json");

var translate = botData.translate,
	dmx = botData.dmx,
	battle = botData.battle,
	mad = botData.mad,
	stream = botData.stream,
	old = botData.old,
	ride = botData.ride;

var irc = require("tennu"),
	winston = require("winston"),
	async = require("async"),
	network = require(argConfig),
	request = require("request"),
	_ = require("lodash-node"),
	MsTranslator = require("mstranslator"),
	latinize = require("latinize"),
	romaji = require("hepburn"),
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

function translateText(string, to, from, command) {
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

function detectRomaji(string, to, command) {
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
				translateText(string, "en", data, command);
			}
			else {
				translateText(string, to, data, command);
			}
		});
	});
}

function timeToBonk(command)
{
	var from = command.nickname;
	var target = command.args.join(" ");
	
	try {
		var calcRandomInt = getRandomInt(0, 100);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}
	
	try {
		var resultRandomInt = getRandomInt(0, battle.result.length - 1);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}
	
	try {
		var attackRandomInt = getRandomInt(0, battle.attacker.length - 1);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}
	
	var calcMsg = calcRandomInt.toString() + "% of ";
	var resultMsg = battle.result[resultRandomInt];
	var attackerMsg = battle.attacker[attackRandomInt];
	
	var clonk = c.brown("Battlebonk results: " + calcMsg + target+"'s clonkers " + resultMsg + " by " + from+"'s " + attackerMsg);
	bot.say(command.channel, clonk);
	//var recalcColor = Math.round((calc * (battle.colors.length - 1)) /100);
	var recalcAssess = Math.round((calcRandomInt *(battle.assess.length - 1)) /100);
	//var assessColor = "c."+battle.colors[recalcColor];
	var assessment = battle.assess[recalcAssess];
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
								bot.say(command.channel, data[0].user.screen_name + "'s Name: " + data[0].user.name);
							break;
							case "description":
								bot.say(command.channel, data[0].user.screen_name + "'s Bio: " + data[0].user.description);
							break;
							case "location":
								bot.say(command.channel, data[0].user.screen_name + "'s Location: " + data[0].user.location);
							break;
							case "count":
								bot.say(command.channel, data[0].user.screen_name + "'s Tweet Count: " + data[0].user.statuses_count);
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

function searchTweet (searchString, command) {
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
		var resultRandomInt = getRandomInt(0, battle.result.length - 1);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}

	try {
		var attackRandomInt = getRandomInt(0, battle.attacker.length - 1);
	}
	catch (err) {
		logger.error(err);
		callback("err", null)
	}

	// build the bonk message
	var calcMsg = calcRandomInt.toString() + "% of ";
	var resultMsg = battle.result[resultRandomInt];
	var attackerMsg = battle.attacker[attackRandomInt];
	
	// deliver the bonk
	var clonk = c.brown("Battlebonk results: " + calcMsg + target + "'s clonkers " + resultMsg + " because of " + from + attackerMsg);
	bot.say(command.channel, clonk);
	
	// assess the damage
	var recalcAssess = Math.round((calcRandomInt * (battle.assess.length - 1)) / 100);
	var assessment = battle.assess[recalcAssess];
	
	bot.say(command.channel, "Battlebonk Status: " + c.red(assessment));
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

function randStatus (statusType) {
	// does some of the repeated work of various random response functions
	
	try {
		var selector = getRandomInt(0, statusType.status.length - 1);
	}
	catch (err) {
		logger.error(err);
		return;
	}
	
	var status = statusType.status[selector];
	return status;
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

bot.on("!ride", function (command) {
	var target = command.args.join(" ");
	
	var status = randStatus(ride);
	
	if (_.isEmpty(target)) {
		status = "Ride status: [X] " + status;
	}
	else {
		status = "Ride status for " + target + ": [X] " + status;
	}
	
	bot.say(command.channel, status);
});

bot.on("!old", function (command) {
	var target = command.args.join(" ");
	
	var status = randStatus(old);
	
	if (_.isEmpty(target)) {
		status = "Old status: [X] " + status;
	}
	else {
		status = "Old status for " + target + ": [X] " + status;
	}
	
	bot.say(command.channel, status);
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
	
	var status = randStatus(mad);
	
	if (_.isEmpty(target)) {
		status = "Mad status: [X] " + status;
	}
	else {
		status = "Mad status for " + target + ": [X] " + status;
	}
	
	bot.say(command.channel, status);
});

bot.on("!dmx", function(command) {
	var status = randStatus(dmx);
	
	bot.say(command.channel, status);
});

bot.on("!battlebonk", function (command) {
	timeToBonk(command);
});

bot.on("!translate", function (command) {
	var res = command.args.join(" ").split("/");
	var setLanguage = res[1];
	var translationString = res[0];
	
	if (_.isEmpty(setLanguage)) {
		detectRomaji(translationString, null, command);
	}
	else {
		detectRomaji(translationString, setLanguage, command);
	}
});

bot.on("!tweet", function (command) {
	searchTweet(command.args.join(" "), command);
});

bot.on("!tweep", function (command) {
	userTweet(command, command.args.join(""), true);
});