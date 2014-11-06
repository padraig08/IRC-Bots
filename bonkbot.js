var config = {
	channels: ["#tsd"],
	server: "irc.teamschoolyd.org",
	botName: "BonkBot"
};

// Get the lib
var irc = require("irc"),
request = require('request'),
_ = require('lodash-node'),
MsTranslator = require('mstranslator'),
latin = require('./node_modules/latinise/latinise'),
romaji = require("hepburn"),
hbombcount = require("countdown"),
twitter = require('twit');


var Tw = new twitter({
    consumer_key: 'Q00cDGH1Uts9EMM054m49YPSP',
    consumer_secret: 'efMhSkHrffYMwcL9mBfauzaFwyqnxg1DXVOeTXw0r4wBU7uW1R',
    access_token: '101582044-SuccSiCG5tUT5p9rf2IbgOhUFvlSzdQhiiNbZLtH',
    access_token_secret: 'arCaTp4Ko0gjIcrHB9lSH115eABMCGubQYH1nnTEALH61'
});

var transClient = new MsTranslator({
      client_id: "BonkBot"
      , client_secret: "siyaadX0Xc8ECdH2wLfEQq1wvLfVGO10FYE58Wqh0f4="
    });
var countdown = {
		commands: 'hbomb',
		items : ['According to my calculations, HBOMB is in approximately <time>',
				"Great Scott! it's <time> til HBOMB!",
				"Anomaly detected. Mt.Baker. T-Minus <time>. Enact HBOMB protcol.",
				'"In <time>, my plan will come to pass. Those fools." -The Ghost of Rowboat',
				"Finally, after <time>, I'm free. Time to conquer HBOMB."]
}

var fanfic = {
	commands: 'fanfic'
};

var translate = {
	commands: ['translate','howtotranslate','engrish'],
	language:  ['ar',
				'bg',
				'ca',
				'zh-CHS',
				'zh-CHT',
				'cs',
				'da',
				'nl',
				'et',
				'fi',
				'fr',
				'de',
				'el',
				'ht',
				'he',
				'hi',
				'mww',
				'hu',
				'id',
				'it',
				'ja',
				'tlh',
				'tlh-Qaak',
				'ko',
				'lv',
				'lt',
				'ms',
				'mt',
				'no',
				'fa',
				'pl',
				'pt',
				'ro',
				'ru',
				'sk',
				'sl',
				'es',
				'sv',
				'th',
				'tr',
				'uk',
				'ur',
				'vi',
				'cy']}
var urls = {
	reddit: 'http://www.reddit.com/r/',
	subs: { img: ['pics','photoshopbattles','OldSchoolCool','dataisbeautiful','gunpla','DIY', 'AnimalsBeingJerks', 'thathappened', 'picturesofiansleeping','notinteresting'], 
			gif:['gifs','combinedgifs','blackpeoplegifs','whitepeoplegifs','animegifs','shittyreactiongifs','chemicalreactiongifs','reactiongifs','kramergifs','georgegifs','perfectLoops', 'HighQualityGifs','SuperSaiyanGifs','ProWrestlingGIFs']},
	commands: ['img','gif','howtobonk','Clonk', 'rando']
};
var dmx = {
	commands: 'dmx',
	phrases: ['X GON GIVE IT TO YA',
			'DONE WAITING FOR YA TO GET IT ON YO OWN, X GON DELIVER TO YA',
			"KNOCK, KNOCK, OPEN UP THE DOOR IT'S REAL",
			"WITH THE NONSTOP POP POP, THE STAINLESS STEEL",
			"HIT IT WITH FULL STRENFF",
			"BREAK BREAD WITH THE ENEMY",
			"I'LL BREAK WHO YOU'RE SENDING ME",
			"FIRST WE GON ROCK, THEN WE GON ROLL",
			"Y'ALL GON MAKE ME LOSE MY MIND, UP IN HERE, UP IN HERE",
			"Y'ALL GON MAKE ME ACT A FOOL, UP IN HERE, UP IN HERE",
			"GGRRRRRRRRR.... WHAT!",
			"https://www.youtube.com/watch?v=thIVtEOtlWM",
			"https://www.youtube.com/watch?v=ThlhSnRk21E",
			"https://www.youtube.com/watch?v=fGx6K90TmCI",
			"https://www.youtube.com/watch?v=8k6SS6uWI-k",
			"https://www.youtube.com/watch?v=vkOJ9uNj9EY",
			"https://www.youtube.com/watch?v=ExitLAP6F9U",
			"https://www.youtube.com/watch?v=Grj9zdnbKQ4",
			"https://www.youtube.com/watch?v=kPBFzNFV6DQ",
			"https://www.youtube.com/watch?v=roo0CeT1VXI",
			'https://www.youtube.com/watch?v=Qy8SPLff5pQ',
			'https://www.youtube.com/watch?v=OnkpPMH4i9o',
			'https://www.youtube.com/watch?v=5Q6lgzzfPS4',
			'https://www.youtube.com/watch?v=xFSwIw-_-as',
			'https://www.youtube.com/watch?v=Pit2gYQka2M',
			'https://www.youtube.com/watch?v=v5yTzlw5dKs',
			'https://www.youtube.com/watch?v=zxP038dKDuo',
			'https://www.youtube.com/watch?v=he_JgaDUvIU',
			'https://www.youtube.com/watch?v=wkx8Mw6uMdM',
			'https://www.youtube.com/watch?v=3IoaCC_ZDno',
			'https://www.youtube.com/watch?v=ZtBaeOwwK3c',
			'https://www.youtube.com/watch?v=GGiIuBaXGQw',
			'https://www.youtube.com/watch?v=8hgmW4B9wVs',
			'https://www.youtube.com/watch?v=47G3SK8QEhQ']
};
var gouf = {
	commands: 'gouf',
	items: ['https://www.youtube.com/watch?v=CPqomrYO960',
			'https://www.youtube.com/watch?v=nKqs1JLDbp4',
			'https://www.youtube.com/watch?v=ts7--zxXXKQ']
};
var ugh = {
	commands: 'ugh',
	items: 'https://www.youtube.com/watch?v=jq9JaTp7pFo'
};

var hyokin = {
	commands: 'hyokin',
	items: ["Hyokin is a 19-year old American writer, artist, voice-actor, webpage designer, and all around Halo fan.",
			"Hyokin began playing Halo in 2004 when Hyokin purchased his first Xbox and soon moved to the newly released Halo 2.",
			"In January 2010, Hyokin began hosting a weekly Custom Game night on Halo.Bungie.Org where Hyokin met many of the leaders of his clan, The Customs Clan; including Chris101 b, Imonkey777, CaneCutter, and Deafhawk36.",
			"Hyokin works at a small local grocery store where Hyokin bags groceries, maintains the recycling room, and pushes carts.",
			"Hyokin spends his free time playing Halo, writing short stories, and maintaining his various websites.",
			"Hyokin also enjoys hiking and swimming.",
			"Hyokin's favorite Halo 3 ODST Character is Buck. Hyokin also enjoys the line 'Barn, said the lady'",
			"Hyokin has unlocked Recon Armor in Halo 3.",
			"Hyokin has unlocked Sergeant Johnson in Halo 3 ODST.",
			"Hyokin has less than 5000 Gamerpoints, over 4000 of which came from Halo 3 and Halo 3 ODST.",
			"Hyokin did not complete Halo Wars and found it to be boring.",
			"Hyokin is always eating a snack on the HBO Customs Podcast.",
			"Hyokin likes CaneCutter and picks on his accent because Hyokin considers him a good friend.",
			"Hyokin and Monkey are bestest pals.",
			"Hyokin is in all but two of Chris101 b's 'Things You Wouldn't Expect Reach Videos.",
			"Hyokin made it into a Bungie Vidoc The Good, The Ugly, and the Badass' at 16-seconds in, using 'Team Armor Lock'",
			"Hyokin has been on HBO since 2006. Hyokin started playing Halo in 2004 and got a computer and Xbox Live in 2006.",
			"Hyokin joined HBO after reading Stephen Loftus' articles.",
			"Hyokin's favorite Halo level of all time is Assault On The Control Room in Halo: Combat Evolved.",
			"Hyokin has more HBO forum posts than Louis Wu and everyone else from Customs Clan.",
			"Hyokin quit Halo for a month when Hyokin saw the Reach trailer in December 2009.",
			"Hyokin return and created Customs.",
			"Hyokin recieved his Halo: Reach Beta Code from Frank O'Conner through e-mail. Frankie gave it to him because Hyokin posted first in a thread where Frankie was asking Cody Miller if he had a code yet. Hyokin explained that Cody had one but he did not. Frankie then e-mailed him a code subject line reading 'Cody's Sloppy Seconds'",
			"Hyokin wears purple armor with an EVA Helmet, Scout Shoulders, and a CQB chestplate.",
			"Hyokin's emblem in Halo games is the letter 'H' created using the Marathon and Vertical Stripes images.",
			"Hyokin will turn on Halo, play around on a single forge map for two hours, then turn it off.",
			"Hyokin loves Forging maps.",
			"Hyokin's biggest desire for Halo Reach's Forge system is Trees.",
			"Hyokin likes Chinese food and Pepsi.",
			"Hyokin has recieved a fortune cookie reading 'Oops! Wrong Cookie'",
			"Hyokin is attending a community college for graphic art and communcations.",
			"Hyokin enjoys creating video games on his computer using FPS Creator and RPG Maker VX.",
			"Hyokin has been making video games for almost ten years, though never completeing a project.",
			"Hyokin has been designing websites since 2003.",
			"Hyokin owns a black Xbox 360 Elite with a black controller.",
			"Hyokin has a white Xbox Arcade headset.",
			"Hyokin's cellphone has a sticker of a gopher poking its head up from a hole saying 'Sup'",
			"Hyokin is husky, though not obese.",
			"Hyokin hates Grifball.",
			"Hyokin owns a white t-shirt reading 'Ihyokin.com' in purple text with a purple skull. Custom made.",
			"Hyokin owns a calico cat named Zoey.",
			"Hyokin lives in his parent's basement in a room Hyokin and his stepdad built themselves.",
			"Hyokin has an HD TV.",
			"Hyokin owns his own personal 'Gamer' couch.",
			"Hyokin purchased the Legendary Edition of Halo 3 and has the cat-head helmet in his closet.",
			"Hyokin has a purple iPod Nano.",
			"Hyokin drives a black, bubble-shaped car. It is similar to his Halo 3 EVA helmet, except it is black not purple.",
			"Hyokin's stepfather would never let his son drive a purple car.",
			"Hyokin's Bungie.net account name is 'Dellaro Studios' which was the name of a website Hyokin ran years ago."]
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
				'were cuffed and detained',
				'were made husky though not obese',
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

function quothTheHyo(sub, from){
        var hyoChosenFact = hyokin.items[getRandomInt(0,hyokin.items.length-1)];
        var person = sub;
 
        if (!sub.length || sub.length === 0 || sub === ""){
                person = 'Hyokin';
        }else if (sub.length > 50 || sub.indexOf(".") > -1 || sub.indexOf("s/") > -1){
                person = "That fucker "+from+", the douche king himself";
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
			if (!to || to === null || to === ""){
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


function randImg(kind, where){
		var subreddit = getRandomInt(0, kind.length-1);
		var urlBuild = urls.reddit + kind[subreddit] +'/random/.json';
		subSelect(urlBuild, where);
}

function randoSub(sub, where){
	//console.log("sub is:"+" | "+sub+" | ", sub.length);
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
		gouf: '^#'+gouf.commands+'(.*)$',
		hyo: '^#'+hyokin.commands+'(.*)$',
		trans: '^#'+translate.commands[0]+'(.*)$',
		howtrans: '^#'+translate.commands[1]+'(.*)$',
		engrish: '^#'+translate.commands[2]+'(.*)$',
		hbomb: '^#'+countdown.commands+'(.*)$',
		ugh: '^#'+ugh.commands+'(.*)$',
		fanfic:'^#'+fanfic.commands+'(.*)$'
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


bot.addListener("message#tsd", function(from, text, message) {

	//Only needs to be matched if the command means to capture text
	var bonkMatch = text.match(bonkPattern);
	var randoMatch = text.match(randoPattern);
	var hyoMatch = text.match(hyoPattern);
	var transMatch = text.match(transPattern);
	var engrishMatch = text.match(engrishPattern);

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
		if(!res[1] || res[1] === null || res[1] === ""){
			detectThatShit(res[0]);
		}else{
			detectThatShit(res[0],res[1]);
		}
	}

	if(engrishPattern.test(text)){
		var res = engrishMatch[1].trim().split("/");
		if(!res[1] || res[1] === null || res[1] === ""){
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
		bot.say(config.channels[0], ugh.items);
	}

	if(fanficPattern.test(text)){
		Tw.get('statuses/user_timeline', {screen_name: 'fanfiction_txt', count:'200', exclude_replies:'true', include_rts:'false'}, function(err, data, response){
			var randTweet = getRandomInt(0,data.length-1);
			bot.say(config.channels[0], "Fanfiction_txt: " +data[randTweet].text);
		});
		
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