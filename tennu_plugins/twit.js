var twitPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                '!twit': function (command) {
                    searchDaTweet(twitMatch[1].trim());
                },
                '!fanfic': function (command){
                    userTweet(text);
                },        
                '!tweet':function (command){
                    searchDaTweet(tweetMatch[1].trim());
                }
            },

            help: {
                'command': [
                    '#howtobonk',
                    ' ',
                    'Gives you instructions.'
                ]
            },

            commands: ['twit']
        }
    }
};

module.exports = twitPlugin;