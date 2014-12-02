var battlebonkPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!battlebonk': function (command) {
                    var givenName = bonkMatch[1].trim();
                    var selectedName = _.some(nameList, {'name': givenName});
                    
                    //console.log('========================================');
                    //console.log('givenName: ', givenName);
                    //console.log('nameList: ', nameList);
                    //console.log('Selected Name: ', selectedName);
            
                                if (selectedName){
                                    timeToBonk(from, givenName);    
                                }else {
                                    if (clonkometer === 0){
                                        clonkometer++;
                                        bot.say(network.channels[0], "Please enter the name of someone in the chat. You're dangerously close to bonking yourself, " + from);
                                    } else if (clonkometer === 1){
                                        clonkometer++;
                                        bot.say(network.channels[0], "Next person to fuck this up, you're gonna get bonked.");
                                    } else if (clonkometer > 1){
                                        timeToBonk(from, from);
                                    }
                                }
                            }
            },

            help: {
                'command': [
                    '#howtobonk',
                    ' ',
                    'Gives you instructions.'
                ]
            },

            commands: ['battlebonk']
        }
    }
};

module.exports = battlebonkPlugin;