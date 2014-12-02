var hyoPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!hyokin': function (command) {
                    quothTheHyo(command.trim(), from);
                }
            },

            help: {
                'command': [
                    '#howtobonk',
                    ' ',
                    'Gives you instructions.'
                ]
            },

            commands: ['hyokin']
        }
    }
};

module.exports = hyoPlugin;