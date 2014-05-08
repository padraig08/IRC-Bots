var config = {
	channels: ["#tsd"],
	server: "irc.teamschoolyd.org",
	botName: "Battlebonk"
};

// Get the lib
var irc = require("irc");
var _ = require('lodash-node');

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

var clonkometer = 0;

var randomMsg = {
	attacker:	['Armada',
				'Invisibrutes',
				'Titan nicknamed "Mr.Bonkle"',
				'Fischer Price Care Bear War Hero Automaton',
				'Prince of All Saiyans',
				'Mechanized 1998 Harlem Globetrotters',
				'Godzilla sized Daft Punk using citys as their dance clubs',
				'well placed bonk',
				'Gorillas wearing jetpacks with no concept of how to use a jetpack',
				'several hundred nuclear warheads',
				'Weaponized Dubstep',
				'Tom Cruise Missiles',
				'Squadron of War Corgis (also known as Worgis)',
				'Sweet Hand of Irony'],
	result:		['were taken out to pasture',
				'have been irrevocably rekt',
				'were slammed, jammed, thank you maamd',
				'have been shaked, quaked, and space kaboomed',
				'taken to district court',
				'were made to understand their fate',
				'are currently in bite sized chunks scattered to the wind',
				'were blown to smiteroons',
				'are not recognizable anymore',
				'were completely decimated',
				'have lived up to the name "live by the bonk, die by the bonk"'],
	assess:		['#cantbonkthis',
				'Whadda ya gonna do, drop a bonk on me?',
				'About Bonking Time',
				'Clonkers are still in the fight',
				'Holding on by the skin of your clonkers',
				'Was that a good bonking or a bad clonking?',
				'Get Bonked',
				'Samurai Bonk',
				'Bonk Around the Clock',
				'Great Bonks of Fire',
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


bot.addListener("join", function(channel, who, message){
	if(who == "Battlebonk"){
		bot.say(config.channels[0],"Battlebonk Online.... Prepare for Battlebonk (For cmd's use .howtobonk)");
	}else{
		checkOP(who);
	}
});

bot.addListener("names",function(channel, names){
	for (var key in names) {
		checkOP(key);
	}
});

/*bot.addListener("nick",function(oldname, newname, channel, message){
		var removedUser = nameList.indexOf(oldname);
		nameList.splice(removedUser,1);
		nameList.push(newname);
		console.log(nameList);
});*/

bot.addListener("quit",function(name, reason, channels, message){
	var removeName = _.where(nameList, {'name': name});
	nameList = _.without(nameList, removeName[0]);
});


bot.addListener("message", function(from, to, text, message) {

	var commands = {
		battlebonk: '^.'+randomMsg.commands[0]+'(.*)$',
		howtobonk:	'^.'+randomMsg.commands[1]+'(.*)$',
		clonk:		'^.'+randomMsg.commands[2]+'(.*)$'};
	var bonkPattern = new RegExp(commands.battlebonk);
	var howPattern = new RegExp(commands.howtobonk);
	var clonkPattern = new RegExp(commands.clonk);

	//Only needs to be matched if the command means to capture text
	var bonkMatch = text.match(bonkPattern);
	
	
	if(howPattern.test(text)){
		bot.say(config.channels[0],"Sending list of commands your way, " + from);
		bot.say(from, "To initiate battlebonk use command: .battlebonk <target>");
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

	if(clonkPattern.test(text)){
		bot.say(config.channels[0], "It's been an honor serving with you gents...");
		bot.disconnect("SeeYouNextTimeSpaceCowboy");
	}
});