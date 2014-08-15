var config = {
	channels: ["#bots"],
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
			gif:['gifs','combinedgifs','blackpeoplegifs','whitepeoplegifs','animegifs','shittyreactiongifs','chemicalreactiongifs','reactiongifs','kramergifs','georgegifs','perfectLoops', 'HighQualityGifs','SuperSaiyanGifs','ProWrestlingGIFs']},
	commands: ['img','gif','howtoimg','Clonk', 'rando']
};
var dmx = {
	commands: 'dmx',
	phrases: ['X GON GIVE IT TO YA',
			'TOOK TOO LONG TO GET IT ON YO OWN, X GON DELIVER TO YA',
			"KNOCK, KNOCK, OPEN UP THE DOOR IT'S REAL",
			"WITH THE NONSTOP POP POP, THE STAINLESS STEEL",
			"HIT IT WITH FULL STRENFF",
			"FIRST WE GON ROCK, THEN WE GON ROLL",
			"Y'ALL GON MAKE ME LOSE MY MIND, UP IN HERE, UP IN HERE",
			"Y'ALL GON MAKE ME ACT A FOOL, UP IN HERE, UP IN HERE",
			"GGRRRRRRRRR.... WHAT!"],
	vids: ["https://www.youtube.com/watch?v=thIVtEOtlWM",
		"https://www.youtube.com/watch?v=ThlhSnRk21E",
		"https://www.youtube.com/watch?v=fGx6K90TmCI",
		"https://www.youtube.com/watch?v=8k6SS6uWI-k",
		"https://www.youtube.com/watch?v=vkOJ9uNj9EY",
		"https://www.youtube.com/watch?v=ExitLAP6F9U",
		"https://www.youtube.com/watch?v=Grj9zdnbKQ4",
		"https://www.youtube.com/watch?v=kPBFzNFV6DQ",
		"https://www.youtube.com/watch?v=roo0CeT1VXI"]
};
var gouf = {
	commands: 'gouf',
	items: ['https://www.youtube.com/watch?v=CPqomrYO960',
			'https://www.youtube.com/watch?v=nKqs1JLDbp4',
			'https://www.youtube.com/watch?v=ts7--zxXXKQ']
};

var clonkometer = 0;
var offQuestion = false;

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
				'Great Teacher Onizuka',
				'Hydrogen powered chest blimps',
				'Long Donged Ippo',
				'Fast in-boxing',
				'Mongoloid out-boxing',
				'minor technicality in the Laredo Rules',
				'TDVictoryLap',
				'IRC Avengers',
				'Captain Battlebonk',
				'Tumblr Mercenaries',
				'Victory Swole',
				'sonic fanfic',
				'S-Shrek',
				'fully armed and operational bonklestation',
				'two fat dwarves',
				'Reverse engineered kek set to Danger Maximum',
				'Destination Maximum',
				'DMX grrr cannon',
				'The Clonkening',
				'fuckin ball pit',
				'secret of the ooze',
				'Gorillas wearing jetpacks with no concept of how to use a jetpack',
				'Drill, that is the drill that will pierce the heavens',
				'J-Pop Kill Squad',
				'Regulation issued Bonkgiver',
				'Five Finger Slam Bringer',
				'MAKUROSU',
				'Intense batch of Smellikinesis',
				'good whiff',
				'Production ready Gak',
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
				'were bad bonked',
				'were made just... just a mess',
				"got GTO'd",
				"were set to Danger Maximum",
				'fell victim to bonk',
				"didn't make it in the third round",
				"got KO'd with 3 seconds remaining",
				"were totally bamboozled",
				"were judged",
				'were BLOWN THE FUCK OUT',
				'were Molded into new Gak',
				'were made to understand their fate',
				'are currently in bite sized chunks scattered to the wind',
				'were blown to smiteroons',
				'have been sent back to mother in a cardboard box',
				'were taken in for questioning',
				'were cuffed by Lou',
				'were hacked into the future',
				'are being bonk, bonking, bonked',
				'are not recognizable anymore',
				'were completely decimated',
				'have lived up to the name "live by the bonk, die by the bonk"'],
	assess:		['#cantbonkthis',
				'Whadda ya gonna do, drop a bonk on me?',
				'About Bonking Time',
				'Dark Side of the Clonk',
				'Clonkers are still in the fight',
				'Holding on by the skin of your clonkers',
				'bonks all around',
				'Double Bonk',
				'Was that a good bonking or a bad clonking?',
				'Get Bonked',
				'Come on and Bonk and Welcome to the Clonk',
				'Triple Bonk',
				'The Incredible Bonk',
				'Bonk Around the Clonk',
				'Great Bonks of Fire',
				'OverBonk',
				'Bonkzilla',
				'I am the Bonk',
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


function randImg(kind, where){
		var subreddit = getRandomInt(0, kind.length-1);
		var urlBuild = urls.reddit + kind[subreddit] +'/random/.json';
		subSelect(urlBuild, where);
}

function randoSub(sub, where){
	//console.log("sub is:"+"|"+sub+"|", sub.length);
	var urlBuild = '';
	if (!sub.length || sub.length === 0 || sub === ""){
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
		gouf: '^#'+gouf.commands+'(.*)$'};
	var imgPattern = new RegExp(commands.img);
	var gifPattern = new RegExp(commands.gif);
	var howPattern = new RegExp(commands.howtoimg);
	var clonkPattern = new RegExp(commands.clonk);
	var bonkPattern = new RegExp(commands.battlebonk);
	var howbonkPattern = new RegExp(commands.howtobonk);
	var randoPattern = new RegExp(commands.rando);
	var dmxPattern = new RegExp(commands.dmx);
	var goufPattern = new RegExp(commands.gouf);
	var kind= '';

bot.addListener("join", function(channel, who, message){
	if(who == "BonkBot"){
		bot.say(config.channels[0],"BonkBot Online.... ImageRoulette and Battlebonk have combine into me (For cmd's use #howtoimg and #howtobonk)");
		
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
	console.log(oldnick, newnick);
	var removeName = _.where(nameList, {'name': oldnick});
	nameList = _.without(nameList, removeName[0]);
	checkOP(newnick);
	
});


bot.addListener("message#bots", function(from, text, message) {

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
		if(from == "Paddy" || from == "Paddio"){
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
		var dmxChosenVid =  getRandomInt(0,dmx.vids.length-1);
		bot.say(config.channels[0], dmx.phrases[dmxChosenPhrase]);
		bot.say(config.channels[0], dmx.vids[dmxChosenVid]);
	}

	if(goufPattern.test(text)){
		var goufChosenVid = getRandomInt(0,gouf.items.length-1);
		bot.say(config.channels[0], gouf.items[goufChosenVid]);
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