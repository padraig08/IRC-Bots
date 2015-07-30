var howToBonkPlugin = {
	init: function (client, imports) {
		return {
			handlers: {
				"!howtobonk": function (command) {
					client.say(command.channel, "Sending instructions your way, " + command.nickname);
					//client.act(command.channel, "tips in solidarity");
					client.say(command.nickname, 
						["--Mad--",
						"Use !mad when you're unsure how mad someone is",
						"--Care--",
						"Use !care to determine how much to care about something",
						"--Big--",
						"Use !big [words] to get big",
						"--Old--",
						"Use !old to check on something's oldness status",
						"--Calulate--",
						"Enter !calc [numbers and operators] to do math",
						"--Battlebonk--",
						"To initiate battlebonk use command: !battlebonk [target]",
						"Make sure to include a target-- otherwise you could bonk yourself",
						"--DMX--",
						"Use !dmx to deploy a DMX signature bark or video",
						"--Translate--",
						"Translate things to English with !translate [text]",
						"Use !translate [text]/[language code] to translate to the specified language",
						"For a list of language codes, use !howtotranslate",
						"Note: If you want to translate Romaji Japanese, end the text with ~",
						"--Tweets--",
						"Use !tweet [text] to search for a random tweet with that string of text, and add |[location] for location-based searches",
						"Use !tweep [name] to get a random recent tweet from the person with that handle"]);
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