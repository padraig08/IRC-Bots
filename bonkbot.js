var config = {
	channels: ["#tsd"],
	server: "irc.teamschoolyd.org",
	botName: "BonkBot"
};

// Get the lib
var irc = require("irc");
var request = require('request');
var _ = require('lodash-node');

var urls = {
	reddit: 'http://www.reddit.com/r/',
	subs: { img: ['pics','photoshopbattles','OldSchoolCool','dataisbeautiful','gunpla','DIY', 'AnimalsBeingJerks', 'thathappened', 'picturesofiansleeping','notinteresting'], 
			gif:['gifs','combinedgifs','blackpeoplegifs','whitepeoplegifs','animegifs','brokengifs','shittyreactiongifs','chemicalreactiongifs','reactiongifs','kramergifs','georgegifs','perfectLoops', 'HighQualityGifs','SuperSaiyanGifs','ProWrestlingGIFs']},
	commands: ['img','gif','howtoimg','Clonk', 'rando']
};

var clonkometer = 0;

var randomMsg = {
	attacker:	['Armada',
				'Invisibrutes',
				'Titan nicknamed "Mr.Bonkle"',
				'Fischer Price Care Bear War Hero Automaton',
				'Prince of All Saiyans',
				'Mechanized 1998 Harlem Globetrotters',
				'Godzilla sized Daft Punk using cities as their dance clubs',
				'well placed bonk',
				'unforseen clonk',
				'Orbital Death Laser',
				'Swag Overload',
				'The Clonkening',
				'secret of the ooze',
				'Gorillas wearing jetpacks with no concept of how to use a jetpack',
				'Drill, that is the drill that will pierce the heavens',
				'J-Pop Kill Squad',
				'Regulation issued Bonkgiver',
				'Five Finger Slam Bringer',
				'MAKUROSU',
				'Production ready Gak sexual monsters',
				'several hundred nuclear warheads',
				'Weaponized Dubstep',
				'Vaguemind',
				'MAXIMUM OGREDRIVE',
				'Slowjam feat. Lionel Richie',
				'Tom Cruise Missiles',
				'Squadron of War Corgis (also known as Worgis)',
				'Sweet Hand of Irony'],
	result:		['were taken out to pasture',
				'have been irrevocably rekt',
				'were slammed, jammed, thank you maamd',
				'have been shaked, quaked, and space kaboomed',
				'were made more important than a one night stand',
				'were taken to district court',
				'have been BTFO',
				'were BLOWN THE FUCK OUT',
				'Molded into new Gak',
				'were made to understand their fate',
				'are currently in bite sized chunks scattered to the wind',
				'were blown to smiteroons',
				'were hacked into the future',
				'are being bonk, bonking, bonked',
				'are not recognizable anymore',
				'were completely decimated',
				'have lived up to the name "live by the bonk, die by the bonk"'],
	assess:		['#cantbonkthis',
				'Whadda ya gonna do, drop a bonk on me?',
				'About Bonking Time',
				'Clonkers are still in the fight',
				'Holding on by the skin of your clonkers',
				'bonks all around',
				'Was that a good bonking or a bad clonking?',
				'Get Bonked',
				'Come on and Bonk and Welcome to the Clonk',
				'Samurai Bonk',
				'Bonk Around the Clock',
				'Great Bonks of Fire',
				'Bonkzilla',
				'Rebonkulous',
				'UNBONKINGBELIEVABLE'],
	colors:		['light_blue',
				'light_green',
				'yellow',
				'light_red'],
	commands:	['battlebonk',
				'howtobonk',
				'Clonk']
};

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

function timeToBonk(from, to, target)
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

function bonkVengeance(victimOnline, victimName){
	if(victimOnline){
		console.log(victimName);
		bot.say(victimName, "I remember what you did, and I know where you sleep. Not a day will go by where I will not remember the things you have done. I will always be waiting and watching, can you dig?");
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
		battlebonk: '^#'+randomMsg.commands[0]+'(.*)$',
		howtobonk:	'^#'+randomMsg.commands[1]+'(.*)$',
		rando: '^#'+urls.commands[4]+'(.*)$'};
	var imgPattern = new RegExp(commands.img);
	var gifPattern = new RegExp(commands.gif);
	var howPattern = new RegExp(commands.howtoimg);
	var clonkPattern = new RegExp(commands.clonk);
	var bonkPattern = new RegExp(commands.battlebonk);
	var howbonkPattern = new RegExp(commands.howtobonk);
	var randoPattern = new RegExp(commands.rando);
	var kind= '';

bot.addListener("join", function(channel, who, message){
	if(who == "BonkBot"){
		bot.say(config.channels[0],"BonkBot Online.... ImageRoulette and Battlebonk have combine into me (For cmd's use #howtoimg)");
		
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
	var nartonline = _.some(nameList, {'name': 'NartFOpc'});
	var zackonline = _.some(nameList, {'name': 'ZackDark'});
	bonkVengeance(zackonline, 'ZackDark');
	bonkVengeance(nartonline, 'NartFOpc');
});

bot.addListener("message", function(from, to, text, message) {

	//Only needs to be matched if the command means to capture text
	var bonkMatch = text.match(bonkPattern);
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

	if(howbonkPattern.test(text)){
		bot.say(config.channels[0],"Sending list of commands your way, " + from);
		bot.say(from, "To initiate battlebonk use command: #battlebonk <target>");
		bot.say(from, "Make sure <target> is someone currently in the chat. Otherwise you could bonk yourself");
	}
	
	if (bonkPattern.test(text)){

		var givenName = bonkMatch[1].trim();
		var selectedName = _.some(nameList, {'name': givenName});
		
		//console.log('========================================');
		//console.log('givenName: ', givenName);
		//console.log('nameList: ', nameList);
		//console.log('Selected Name: ', selectedName);

		if (selectedName){
			timeToBonk(from, to, givenName);	
		}else {
			if (clonkometer === 0){
				clonkometer++;
				bot.say(config.channels[0], "Please enter the name of someone in the chat. You're dangerously close to bonking yourself, " + from);
			} else if (clonkometer === 1){
				clonkometer++;
				bot.say(config.channels[0], "Next person to fuck this up, you're gonna get bonked.");
			} else if (clonkometer > 1){
				timeToBonk(from, to, from);
			}
		}
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
		bot.say(config.channels[0], "BonkBot offline...");
		bot.disconnect("SeeYouNextTimeSpaceCowboy");
	}

	if(randoPattern.test(text)){
		randoSub(randoMatch[1].trim());
	}
});