var config = {
	channels: ["#tsd"],
	server: "localhost",
	botName: "ImageRoulette"
};

// Get the lib
var irc = require("irc");
var request = require('request');

var urls = {
	reddit: 'http://www.reddit.com/r/',
	subs: { img: ['pics','photoshopbattles','OldSchoolCool','dataisbeautiful', 'AnimalsBeingJerks', 'thathappened', 'picturesofiansleeping','notinteresting'], 
			gif:['gifs','reactiongifs','perfectLoops', 'HighQualityGifs','analogygifs','SuperSaiyanGifs','ProWrestlingGIFs']},
	commands: ['img','gif','howtoimg','Clonk', 'rando']
};

var stripOP = '^[@&#+$~%!*?](.*)$';

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}

function randImg(kind){
		var subreddit = getRandomInt(0, kind.length-1);
		var urlBuild = urls.reddit + kind[subreddit] +'/random/.json';
		subSelect(urlBuild);
}

function randoSub(sub){
	//console.log("sub is:"+"|"+sub+"|", sub.length);
	var urlBuild = '';
	if (!sub.length || sub.length === 0 || sub === ""){
		var urlRand = urls.reddit + 'random/';
		request(urlRand, function (error, response, body){
			urlBuild = response.request.uri.href + "random/.json";
			console.log(urlBuild);
			subSelect(urlBuild);
		});

	} else {

		urlBuild = urls.reddit + sub + '/random/.json';
		subSelect(urlBuild);
		
	}

}

function subSelect(urlBuild){

	request(urlBuild, function (error, response, body) {
		var invalidSub = response.request.uri.search;
			if (!error && response.statusCode == 200 && invalidSub === null) {
				var redditData = JSON.parse(body);
				var dataUrl = redditData[0].data.children[0].data;
				//econsole.log(dataUrl);
				
				if (dataUrl.over_18 === true){
					bot.say(config.channels[0],'Warning: The following is NSFW/NSFL');
				}
				bot.say(config.channels[0], dataUrl.title +" from r/"+ dataUrl.subreddit +" --- "+ dataUrl.url);
				
			} else if (invalidSub !== null){
					bot.say(config.channels[0],'The listed subreddit is not usable, please try another one.');
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
		rando: '^#'+urls.commands[4]+'(.*)$'};
	var imgPattern = new RegExp(commands.img);
	var gifPattern = new RegExp(commands.gif);
	var howPattern = new RegExp(commands.howtoimg);
	var clonkPattern = new RegExp(commands.clonk);
	var randoPattern = new RegExp(commands.rando);
	var kind= '';

bot.addListener("join", function(channel, who, message){
	if(who == "ImageRoulette"){
		bot.say(config.channels[0],"ImageRoulette Online.... (For cmd's use #howtoimg)");
	}
});

bot.addListener("message", function(from, to, text, message) {
	//Only needs to be matched if the command means to capture text
	var randoMatch = text.match(randoPattern);

	if(howPattern.test(text)){
		bot.say(config.channels[0],"Sending list of commands your way, " + from);
		bot.say(from, "To get a random image or gif use: #img or #gif");
		bot.say(from, "Note: Gifs may still come up in image randomizer.");
		bot.say(from, "To get a random post from any subreddit, use #rando <target>");
		bot.say(from, "If no target is specified, a random subreddit will be selected for you.");
		bot.say(from, "Warning: Not all random posts will be images or gifs and the sfw value depends on the subreddit.");
	}
	
	if (imgPattern.test(text) ){
		kind = urls.subs.img;
		randImg(kind);
	}

	if(gifPattern.test(text)){
		kind = urls.subs.gif;
		randImg(kind);
	}
		
	if(clonkPattern.test(text)){
		bot.say(config.channels[0], "ImageRoulette offline...");
		bot.disconnect("SeeYouNextTimeSpaceCowboy");
	}

	if(randoPattern.test(text)){
		randoSub(randoMatch[1].trim());
	}
});