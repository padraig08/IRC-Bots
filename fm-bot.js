var plug = require('plugapi');

var bot = new plug({
	"email":"padraig08@live.com",
	"password":"TSDFMBOTFORGREATFUTURE"
});

bot.connect('-1911581813480328609');

bot.on('djAdvance', function(){

	console.log("Song Changed");
});
bot.on('roomJoin', function(room){
	console.log("Joined" + room);
});