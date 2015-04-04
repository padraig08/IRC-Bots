var howToBonkPlugin = {
	init: function (client, imports) {
		return {
			handlers: {
				"!howtobonk": function (command) {
					client.say(command.channel, "Sending instructions your way, " + command.nickname);
					//client.act(command.channel, "tips in solidarity");
					client.say(command.nickname, 
						["--Battlebonk--",
						"To initiate battlebonk use command: !battlebonk [target]",
						"Make sure [target] is someone currently in the chat-- otherwise you could bonk yourself",
						"--ImageRoulette--",
						"Get a random image with !img or a GIF with !gif",
						"Note: GIFs may show up with !img",
						"Get a random post from any subreddit with !rando [target]",
						"If no target is specified, a random subreddit will be selected for you",
						"Warning: Not all random posts will be images and the SFW value depends on the subreddit",
						"--DMX--",
						"Use !dmx to deploy a DMX signature bark or video",
						"--Translate--",
						"Translate things with !translate [text] for translation to English, or add /[language code] to translate to that language",
						"For a list of language codes, use !howtotranslate",
						"Note: If you want to translate Romaji Japanese, end the text with ~",
						"Use !engrish to translate text to a designated or random language then back to English-- see what gets lost in translation!",
						"--Tweets--",
						"Use !tweet [text] to search for a random tweet with that string of text, and add |[location] for location-based searches",
						"Use !fanfic to pull a random @fanfiction_txt post from the past 200",
						"--Words--",
						"Use !define [word] to get a definition",
						"Use !rhyme [word] to get a rhyming word",
						"Use !example [word] to see the word in a sentence",
						"--Mad--",
						"Use !mad when you're unsure how mad someone is",
						"--Care--",
						"Use !care to determine how much to care about something",
						"--Big--",
						"Use !big [words] to get big",
						"--Calulate--",
						"Enter !calculate [numbers and operators] to do math"]);
				},

					"!howtotranslate": function (command){
						client.say(command.nickname,
							["Use !translate [text]/[language code] to translate.",
							"--Full List of Language Codes--",
							"ar: Arabic"+" | "+"bg: Bulgarian"+" | "+"ca: Catalan"+" | "+"zh-CHS: Chinese"+" | "+"cs: Czech"+" | "+"da: Danish"+" | "+"nl: Dutch"+" | "+"en: English"+" | "+"et: Estonian"+" | "+"fi: Finnish"+" | "+"fr: French"+" | "+"de: German"+" | "+"el: Greek"+" | "+"ht: Haitian Creole"+" | "+"he: Hebrew"+" | "+"hi: Hindi"+" | "+"mww: Hmong Daw"+" | "+"hu: Hungarian"+" | "+"id: Indonesian"+" | "+"it: Italian",
							"ja: Japanese"+" | "+"tlh: Klingon"+" | "+"ko: Korean"+" | "+"lv: Latvian"+" | "+"lt: Lithuanian"+" | "+"ms: Malay"+" | "+"mt: Maltese"+" | "+"no: Norwegian"+" | "+"fa: Persian"+" | "+"pl: Polish"+" | "+"pt: Portuguese"+" | "+"ro: Romanian"+" | "+"ru: Russian"+" | "+"sk: Slovak"+" | "+"sl: Slovenian"+" | "+"es: Spanish"+" | "+"sv: Swedish"+" | "+"th: Thai"+" | "+"tr: Turkish"+" | "+"uk: Ukrainian"+" | "+"ur: Urdu"+" | "+"vi: Vietnamese"+" | "+"cy: Welsh"]);
					}
			},

			help: {
				"command": [
					"!howtobonk",
					" ",
					"Gives you instructions."]
			},

			commands: ["howtobonk", "howtotranslate"]
		}
	}
};

module.exports = howToBonkPlugin;