var dmxPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!dmx': function (command) {
                    var dmxChosenPhrase = getRandomInt(0,dmx.phrases.length-1);
                    client.say(network.channels[0], dmx.phrases[dmxChosenPhrase]);
                },
                '!gouf': function (command){
                    var goufChosenVid = getRandomInt(0,gouf.items.length-1);
                    client.say(network.channels[0], gouf.items[goufChosenVid]);
                },
                '!hbomb':function (command){
                    var timeTilHBOMB = hbombcount(null ,new Date(2015, 0, 16)).toString();
                    var randTimer = getRandomInt(0,countdown.items.length-1);
                    var HBOMBstr = countdown.items[randTimer];
                    client.say(network.channels[0], HBOMBstr.replace("<time>",timeTilHBOMB));
                },
                '!ugh': function (command){
                    var ughRand = getRandomInt(0,ugh.items.length-1);
                    client.say(network.channels[0], ugh.items[ughRand]);
                },
                '!qdb': function (command){
                    var randQDB = getRandomInt(1,642);
                    client.say(network.channels[0], "http://qdb.zero9f9.com/quote.php?id="+randQDB );
                }
            },

            help: {
                'command': [
                    '#dmx',
                    ' ',
                    'Gives you instructions.'
                ]
            },

            commands: ['dmx']
        }
    }
};

module.exports = dmxPlugin;