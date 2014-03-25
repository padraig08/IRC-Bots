var config = {
	channels: ["#tsd"],
	server: "irc.teamschoolyd.org",
	botName: "Battlebonk"
};

// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

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
	result: ['were taken out to pasture',
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
	assess: ['#cantbonkthis',
			'About Bonking Time',
			'Clonkers are still in the fight',
			'Holding on by the skin of your clonkers',
			'Was that a good bonking or a bad clonking?',
			'Get Bonked',
			'Samurai Bonk',
			'Bonk Around the Clock',
			'Rebonkulous',
			'UNBONKINGBELIEVABLE'],
	colors: ['light_blue',
			'light_green',
			'yellow',
			'light_red']
};

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}

bot.addListener("join", function(channel, who, message){
	if(who == "Battlebonk"){
		bot.say(config.channels[0],"Battlebonk Online.... Prepare for Battlebonk (For cmd's use howtobonk)");
	}
});

bot.addListener("message", function(from, to, text, message) {
	
	//bot.say(config.channels[0], "Rebonkulous!");
	//console.log(from+","+to+","+text+","+message);

	if(text.indexOf(".howtobonk") !== -1){
		bot.say(config.channels[0],"Sending list of commands your way, " + from);
		bot.say(from, "To initiate battlebonk use command: .battlebonk <target>");
	}
	
	if (text.indexOf(".battlebonk") !== -1){

		var calc = getRandomInt(0,100);
		var result = getRandomInt(0,randomMsg.result.length -1);
		var attacker = getRandomInt(0,randomMsg.attacker.length -1);

		console.log(calc, result, attacker);

		var calcMsg = calc.toString() + "% of";
		var resultMsg = randomMsg.result[result];
		var attackerMsg = randomMsg.attacker[attacker];

		console.log(calcMsg, resultMsg, attackerMsg);
		
		clonk = irc.colors.wrap("orange", "Battlebonk results: " + calcMsg + text.substring(11)+"'s clonkers " + resultMsg + " by " + from+"'s " + attackerMsg);
		bot.say(config.channels[0], clonk);

		var recalcColor = Math.round((calc * (randomMsg.colors.length - 1)) /100);
		var recalcAssess = Math.round((calc *(randomMsg.assess.length - 1)) /100);

		console.log(randomMsg.colors.length, recalcAssess, recalcColor);

		assessment = irc.colors.wrap(randomMsg.colors[recalcColor],randomMsg.assess[recalcAssess]);
		bot.say(config.channels[0], "Battlebonk Status: " + assessment);

	}

	if(text.indexOf(".Clonk") !== -1){
		bot.say(config.channels[0], "It's been an honor serving with you gents...");
		bot.disconnect("SeeYouNextTimeSpaceCowboy");
	}
});