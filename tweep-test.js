var twitter = require('twit');
var _ = require('lodash-node');
var botConfig = require('./botConfig.json');
var userString = "WOOT";

var Tw = new twitter({
    consumer_key: botConfig.twConfig.consumer_key,
    consumer_secret: botConfig.twConfig.consumer_secret,
    access_token: botConfig.twConfig.access_token,
    access_token_secret: botConfig.twConfig.access_token_secret
});

function getRandomInt(min,max){
	var rando = Math.floor(Math.random() * (max - min +1)) + min;
	return rando;
}


var AllTweets = [];
var currentTweets = [];

if (_.isEmpty(userString)){
		bot.say(command.channel, "No user provided. Come on man, you're better than this.");

	}else{
	var userArray = userString.split("|");
	Tw.get('statuses/user_timeline', {screen_name: userArray[0], count:'200', exclude_replies:'true', include_rts:'false'}, function(err, data, response){
			if (err === null){
				if(_.contains(userString,"|")){
					switch (userArray[1]) {
    					case 'name':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Name: "data[0].user.name);
        				break;
    					case 'description':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Bio: "data[0].user.description);
        				break;
        				case 'location':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Location: "data[0].user.location);
        				break;
    					case 'count':
        					bot.say(command.channel,  data[randTweet].user.screen_name +"'s Tweet Count: "data[0].user.status_count);
        				break;
    					default:
        				console.log('You gotta give me something to look up, brah.');
					}}else{
						var randTweet = getRandomInt(0,data.length-1);
						var arrTweet = data[randTweet].text.replace( /\n/g, "`" ).split( "`" );
						console.log(arrTweet);
						//bot.say(command.channel,  data[randTweet].user.screen_name +": " +arrTweet);
			}}else{
				console.log("ERROR: try again, you fucked this up somehow.");
			}
		});
}