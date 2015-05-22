var clonkPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!clonk': function (command) {
                    if(command.nickname == "Paddy"){
                        client.quit("It's Bonk Tonight!");
                    }else{
                        client.say(command.channel, "ʕ ͡°ᴥ ͡° ʔ");
                    }
                   }
            },

            help: {
                'command': [
                    'Send BonkBot to the shadow realm',
                    ' ',
                    'To the shadow realm. (must be Paddy.)'
                ]
            },

            commands: ['clonk']
        }
    }
};

module.exports = clonkPlugin;