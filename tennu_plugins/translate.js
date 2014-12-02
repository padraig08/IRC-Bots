var translatePlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!translate': function (command) {
                    var res = transMatch[1].trim().split("/");
                    if(_.isEmpty(res[1])){
                        detectThatShit(res[0]);
                    }else{
                        detectThatShit(res[0],res[1]);
                    }
                },
                '!engrish': function (command){
                    var res = engrishMatch[1].trim().split("/");
                    if(_.isEmpty(res[1])){
                        var result = getRandomInt(0,translate.language.length -1);
                        var resultMsg = translate.language[result];
                        engrishThatShit(res[0], resultMsg);
                    }else{
                        engrishThatShit(res[0],res[1]);
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

            commands: ['translate']
        }
    }
};

module.exports = translatePlugin;