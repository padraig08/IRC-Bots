var clonkPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!clonk': function (command) {
                    client.quit("It's Bonk Tonight!");
                   }
            },

            help: {
                'command': [
                    'Send BonkBot to the shadow realm',
                    ' ',
                    'To the shadow realm. (bot owner only)'
                ]
            },

            commands: ['clonk']
        }
    }
};

module.exports = clonkPlugin;