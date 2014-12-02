var howToBonkPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!howtobonk': function (command) {
                    client.say(command.channel, 'Sending instructions your way, ' + command.nickname);
                    //client.act(command.channel, "tips in solidarity");
                    client.say(command.nickname, 
                        ["--Battlebonk--",
                        "To initiate battlebonk use command: #battlebonk <target>",
                        "Make sure <target> is someone currently in the chat. Otherwise you could bonk yourself",
                        "--ImageRoulette--",
                        "To get a random image or gif use: #img or #gif",
                        "Note: Gifs may still come up in image randomizer.",
                        "To get a random post from any subreddit, use #rando <target>",
                        "If no target is specified, a random subreddit will be selected for you.",
                        "Warning: Not all random posts will be images or gifs and the sfw value depends on the subreddit.",
                        "--DMX--",
                        "use #dmx to deploy a DMX signature bark and video",
                        "--Gouf--",
                        "use #gouf to deploy a ;_;7 for all the goufs lost over the years",
                        "--Hyokin--",
                        "use #hyokin to get some much needed Hyokin facts",
                        "leave it blank for hyokin classic, or add a <target> to make a new fact. Custom made.",
                        "--Translate--",
                        "use #translate to translate text to English or other languages",
                        "leave it blank for translation to English, or add /<language code> to translate in that language. For a list of language codes, use #howtotranslate",
                        "NOTE: if you want to translate Romaji Japanese, end the string with ~",
                        "use #engrish to translate text to a designated language or random language then back to english. See what gets lost in translation!",
                        "--Twit--",
                        "use #twit <string> to search for a random tweet with that string. Add |<location> for location based searches.",
                        "use #fanfic to pull a random fanfiction_txt post from the past 200."]);
                },
                    '!howtotranslate':function (command){
                        client.say(command.nickname,["Use #translate <text>/<language code> to translate.",
                                    "---Full List of Language Codes---",
                                    "ar: Arabic"+" | "+"bg: Bulgarian"+" | "+"ca: Catalan"+" | "+"zh-CHS: Chinese"+" | "+"cs: Czech"+" | "+"da: Danish"+" | "+"nl: Dutch"+" | "+"en: English"+" | "+"et: Estonian"+" | "+"fi: Finnish"+" | "+"fr: French"+" | "+"de: German"+" | "+"el: Greek"+" | "+"ht: Haitian Creole"+" | "+"he: Hebrew"+" | "+"hi: Hindi"+" | "+"mww: Hmong Daw"+" | "+"hu: Hungarian"+" | "+"id: Indonesian"+" | "+"it: Italian",
                                    "ja: Japanese"+" | "+"tlh: Klingon"+" | "+"ko: Korean"+" | "+"lv: Latvian"+" | "+"lt: Lithuanian"+" | "+"ms: Malay"+" | "+"mt: Maltese"+" | "+"no: Norwegian"+" | "+"fa: Persian"+" | "+"pl: Polish"+" | "+"pt: Portuguese"+" | "+"ro: Romanian"+" | "+"ru: Russian"+" | "+"sk: Slovak"+" | "+"sl: Slovenian"+" | "+"es: Spanish"+" | "+"sv: Swedish"+" | "+"th: Thai"+" | "+"tr: Turkish"+" | "+"uk: Ukrainian"+" | "+"ur: Urdu"+" | "+"vi: Vietnamese"+" | "+"cy: Welsh"]);
                
                }
            },

            help: {
                'command': [
                    '#howtobonk',
                    ' ',
                    'Gives you instructions.'
                ]
            },

            commands: ['howtobonk','howtotranslate']
        }
    }
};

module.exports = howToBonkPlugin;