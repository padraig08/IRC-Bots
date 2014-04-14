var config = {
	channels: ["#tsd"],
	server: "irc.teamschoolyd.org",
	botName: "ImageRoulette"
};

// Get the lib
var irc = require("irc");
var request = require('request');

var urls = {
	reddit: 'http://www.reddit.com/r/',
	subs: { img: ['pics','photoshopbattles','OldSchoolCool','dataisbeautiful', 'AnimalsBeingJerks', 'thathappened', 'picturesofiansleeping','notinteresting'], 
			gif:['gifs','reactiongifs','perfectLoops', 'HighQualityGifs','analogygifs','SuperSaiyanGifs','ProWrestlingGIFs']},
	commands: ['img','gif','howtoimg','Clonk']
};

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
	return name;
}

function randImg(kind){
		var subreddit = getRandomInt(0, kind.length-1);
		var urlBuild = urls.reddit + kind[subreddit] +'/random/.json';
	
			request(urlBuild, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var redditData = JSON.parse(body);
					var dataUrl = redditData[0].data.children[0].data;
					//econsole.log(dataUrl);
				bot.say(config.channels[0], dataUrl.title +" from r/"+ dataUrl.subreddit +" --- "+ dataUrl.url);
			}
		});
}

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

var commands = {
		img: '^#'+urls.commands[0]+'(.*)$',
		gif: '^#'+urls.commands[1]+'(.*)$',
		howtoimg:	'^#'+urls.commands[2]+'(.*)$',
		clonk:		'^#'+urls.commands[3]+'(.*)$'};
	var imgPattern = new RegExp(commands.img);
	var gifPattern = new RegExp(commands.gif);
	var howPattern = new RegExp(commands.howtoimg);
	var clonkPattern = new RegExp(commands.clonk);
	var kind= '';

bot.addListener("join", function(channel, who, message){
	if(who == "ImageRoulette"){
		bot.say(config.channels[0],"ImageRoulette Online.... (For cmd's use #howtoimg)");
	}
});

bot.addListener("message", function(from, to, text, message) {


	if(howPattern.test(text)){
		bot.say(config.channels[0],"Sending list of commands your way, " + from);
		bot.say(from, "To get a random image or gif use: #img or #gif");
		bot.say(from, "Note: Gifs may still come up in image randomizer.");
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
});