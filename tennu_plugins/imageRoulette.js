var imagePlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!img': function (command) {
                    console.log(util.inspect(command));
                    kind = urls.subs.gif;
                    randImg(kind, network.channels[0]);
                },

                '!gif': function (command){
                    kind = urls.subs.gif;
                    randImg(kind, network.channels[0]);
                },

                '!rando':function (command){
                    randoSub(randoMatch[1].trim(), network.channels[0]);
                }
            },

            help: {
                'command': [
                    '#howtobonk',
                    ' ',
                    'Gives you instructions.'
                ]
            },

            commands: ['img']
        }
    }
};

module.exports = imagePlugin;