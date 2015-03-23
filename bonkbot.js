var botConfig = require('./botConfig.json'),
botData = require('./botData.json');

var countdown = botData.countdown,
	translate = botData.translate,
	urls = botData.urls,
	dmx = botData.dmx,
	gouf = botData.gouf,
	ugh = botData.ugh,
	hyokin = botData.hyokin,
	randomMsg = botData.randomMsg,
	av = botData.av,
	rhymePos = botData.rhymePos,
	word = botData.word,
	tricked = botData.tricked;

// Get the lib
var irc = require('tennu'),
winston = require('winston'),
async = require('async'),
network = require('./netConfig.json'),
request = require('request'),
_ = require('lodash-node'),
MsTranslator = require('mstranslator'),
latinize = require('latinize'),
romaji = require("hepburn"),
hbombcount = require("countdown"),
twitter = require('twit'),
geo = require ('geocoder'),
c = require('irc-colors'),
cheerio = require('cheerio'),
util = require('util');

//var specMatch = new RegExp(/[$-/:-?{-~!"^_`\[\]]/);
//var numMatch = new RegExp(/[\d]/);

var letterPattern = new RegExp('[a-zA-Z]');
var requests = 0;

var Tw = new twitter({
    consumer_key: botConfig.twConfig.consumer_key,
    consumer_secret: botConfig.twConfig.consumer_secret,
    access_token: botConfig.twConfig.access_token,
    access_token_secret: botConfig.twConfig.access_token_secret
});

var transClient = new MsTranslator({
      client_id: botConfig.transConfig.client_id
      , client_secret: botConfig.transConfig.client_secret
    });

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: "debug"},{level:"error"},{level:"notice"},{level:"warn"},{level:"info"},{level:"crit"},{level:"alert"},{level:"emerg"}),
        new (winston.transports.File)({level:"debug", filename: './irc-log.log' })
    ]
});

var print = console.log.bind(console);

var ircLogger = function () {
    return {
        debug: print,
        info: print,
        notice: print,
        warning: print,
        error: print,
        crit: print,
        alert: print,
        emerg: print
    }
};

function getRandomInt(min,max){
    if((typeof min === "number") && Math.floor(min) === min && (typeof max === "number") && Math.floor(max) === max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }else{
        //logger.error('min or max number is not a valid number');
        throw 'min or max number is not a valid number';
    }
}

function quothTheHyo(command){
        try {
            var hyoRandomInt = getRandomInt(0,hyokin.items.length-1);
        } catch (err) {
            logger.error(err);
            return;
        }
        var hyoChosenFact = hyokin.items[hyoRandomInt];
        var person = command.args.join(" ");
 
        if (_.isEmpty(person)) {
            person = 'Hyokin';
        }
        bot.say(command.channel, '>' + hyoChosenFact.replace(/Hyokin/gi, person));
}

function detectThatShit(string, to, command){

	if(string.charAt(string.length - 1) == "~"){
	string = romaji.toHiragana(string);
	var params = { text: string };
}else{
	params = { text: string	};
}
	
	transClient.initialize_token(function(keys){
		transClient.detect(params, function(err, data){
			if (_.isEmpty(to)){
				translateThatShit(string, "en", data, command);
			}else{
				translateThatShit(string, to, data, command);
			}
		});
	});

}

function translateThatShit(string, to, from, command){
	var params = {
      text: string
      , from: from
      , to: to
    };
	
	transClient.initialize_token(function(keys){
			transClient.translate(params, function(err, data) {
				if(!err || data !== null){
					if(to == "ja"){
						data = romaji.fromKana(data);
						console.log(data, to, from);
						bot.say(command.channel,"Translation: "+latinize(data));
					}else{
						console.log(data, to, from);
						bot.say(command.channel,"Translation: "+latinize(data));
					}
				}else{
                    logger.error(err);
        			bot.say(command.channel,"ERROR: Please use a supported language code.");
        		}
    		});
	});
}

function engrishThatShit(string, to, command){
params1 = { 
      text: string
      , from: 'en'
      , to: to
    };

transClient.initialize_token(function(keys){
			transClient.translate(params1, function(err, data) {
			params2 = { text: data, from: to, to: 'en'};
			transClient.translate(params2, function(err, data) {
				bot.say(command.channel,"Engrish: "+latinize(data));
			});
		});
	});
}

function loopAcro(c, n, url, callback) {
	url = url.replace(/<search>/gi, c).replace(/<api>/gi, word.api);
	if(letterPattern.test(c)){
	request(url, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			acObj[n] = c;
		}else{	
			var acData = JSON.parse(body);
            try {
                var acroRandomInt = getRandomInt(0,acData.searchResults.length-1);
            } catch (err) {
                logger.error(err);
                callback('err',null)
            }
			acObj[n] = acData.searchResults[acroRandomInt].word;
			callback();	
		}
	});
	}else{
		acObj[n] = c;
		callback();
	}
}

function loopSyn(c, n, callback){
	var urlThesaurBuild = word.wordUrl+word.thesaurUrl+word.apiUrl;
	urlThesaurBuild = urlThesaurBuild.replace(/<word>/gi, c).replace(/<api>/gi, word.api);
	request(urlThesaurBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			synObj[n] = c;
			//synArray.push(c);
			callback();
			
		}else{
			var synData = JSON.parse(body);
            try {
                var synRandomInt = getRandomInt(0,synData[0].words.length-1);
            } catch (err) {
                logger.error(err);
                callback('err',null)
            }
			synObj[n] = synData[0].words[synRandomInt];

			//synArray.push(synData[0].words[0]);
			//acArray.push(acData.searchResults[0].word);
			callback();
		}

	});
}

function syncAcro(command, acLetter){
	acObj = {};
	requests = 0;

	async.each(acLetter, function(n, callback) {
		requests++;
		  if (requests == 1){
		   urlAcroBuild = word.searchUrl+word.acroFirstUrl+word.apiUrl;
		   loopAcro(n,requests, urlAcroBuild, callback);
		  }else if (requests == 2 || requests == acLetter.length-1){
		   urlAcroBuild = word.searchUrl+word.acroLastUrl+word.apiUrl;
		   loopAcro(n,requests, urlAcroBuild, callback);
		  }else {
		   urlAcroBuild = word.searchUrl+word.acroAnyUrl+word.apiUrl;
		   loopAcro(n,requests, urlAcroBuild, callback);
		  }
	}, function(err) {
		var acString = _.map(acObj, function(num) { return num; }).join(" ");
		bot.say(command.channel, acString.toUpperCase());
	});
}

function syncSyn(command){
	synObj = {};
	requests = 0;

	async.each(command.args, function(n, callback) {
	requests++;
	//console.log(command.args);
		if (specMatch.test(n) || numMatch.test(n)){
			console.log('got it');
		loopSyn('fuck', requests,callback);
		}else{
		loopSyn(n, requests,callback);
		}
		//loopSyn(n, requests,callback);
	}, function(err) {
		var synString = _.map(synObj, function(num) { return num; }).join(" ");
		bot.say(command.channel, synString.toUpperCase());
		//bot.say(command.channel, synArray.join(" "));
	});
}

function timeToBonk(command)
{
	var from = command.nickname;
	var target = command.args.join(" ");
    try {
        var calcRandomInt = getRandomInt(0,100);
    } catch (err) {
        logger.error(err);
        callback('err',null)
    }
    try {
        var resultRandomInt = getRandomInt(0,randomMsg.result.length -1);
    } catch (err) {
        logger.error(err);
        callback('err',null)
    }
    try {
        var attackRandomInt = getRandomInt(0,randomMsg.attacker.length -1);
    } catch (err) {
        logger.error(err);
        callback('err',null)
    }
	var calcMsg = calcRandomInt.toString() + "% of ";
	var resultMsg = randomMsg.result[resultRandomInt];
	var attackerMsg = randomMsg.attacker[attackRandomInt];

	
	var clonk = c.brown("Battlebonk results: " + calcMsg + target+"'s clonkers " + resultMsg + " by " + from+"'s " + attackerMsg);
	bot.say(command.channel, clonk);
	//var recalcColor = Math.round((calc * (randomMsg.colors.length - 1)) /100);
	var recalcAssess = Math.round((calc *(randomMsg.assess.length - 1)) /100);
	//var assessColor = "c."+randomMsg.colors[recalcColor];
	var assessment = randomMsg.assess[recalcAssess];
	console.log(assessment);
	
	bot.say(command.channel, "Battlebonk Status: " + c.red(assessment));

}

function userTweet(command, userString){

if (_.isEmpty(userString)){
		bot.say(command.channel, "No user provided. Come on man, you're better than this.");

	}else{
	var userArray = userString.split("|");
	Tw.get('statuses/user_timeline', {screen_name: userArray[0], count:'200', exclude_replies:'true', include_rts:'false'}, function(err, data, response){
			if (err === null){
				if(!_.isEmpty(data[0])){
					if(_.contains(userString,"|")){
						switch (userArray[1]) {
    						case 'name':
        						bot.say(command.channel,  data[0].user.screen_name +"'s Name: "+data[0].user.name);
        					break;
    						case 'description':
        						bot.say(command.channel,  data[0].user.screen_name +"'s Bio: "+data[0].user.description);
        					break;
        					case 'location':
        						bot.say(command.channel,  data[0].user.screen_name +"'s Location: "+data[0].user.location);
        					break;
    						case 'count':
        						bot.say(command.channel,  data[0].user.screen_name +"'s Tweet Count: "+data[0].user.statuses_count);
        					break;
    						default:
        						bot.say(command.channel,'You gotta give me something to look up, brah.');
						}}else{
                            try {
                                var tweetRandomInt = getRandomInt(0,data.length-1);
                            } catch (err) {
                                logger.error(err);
                                return;
                            }
							var arrTweet = data[tweetRandomInt].text.replace( /\n/g, "`" ).split( "`" );
							//console.log(arrTweet);
							bot.say(command.channel,  data[tweetRandomInt].user.screen_name +": " +arrTweet);
						}
					}else{
						bot.say(command.channel,"ERROR: you chose an account with no tweets. Try again, doucher.");
					}

		}else{
				bot.say(command.channel,"ERROR: try again, you fucked this up somehow.");
				console.log(err);
			}
		});
}

}

function searchDaTweet (searchString, command) {
	if (_.isEmpty(searchString)){
		bot.say(command.channel, "No text provided. Come on man, you're better than this.");

	}else if(_.contains(searchString,"|")){

		var searchArray = searchString.split("|");
		geo.geocode(searchArray[1], function(err, data){
			if(data.status == 'OK'){
				Tw.get('search/tweets', {q: searchString, count:'100', geocode: data.results[0].geometry.location.lat+','+data.results[0].geometry.location.lng+',10mi'}, 
				function(err, data, response){
					if (err === null){
						if(data.statuses.length > 0){
                            try {
                                var tweetRandomInt = getRandomInt(0,data.statuses.length-1);
                            } catch (err) {
                                logger.error(err);
                                return;
                            }
						var arrTweet = data.statuses[tweetRandomInt].text.replace( /\n/g, "`" ).split( "`" );
						//console.log(arrTweet);
						bot.say(command.channel, "Tweet from "+ data.statuses[tweetRandomInt].user.screen_name+" : "+ arrTweet +" ( http://twitter.com/"+data.statuses[tweetRandomInt].user.screen_name+"/status/"+data.statuses[tweetRandomInt].id_str+" )");
					}else{
						bot.say(command.channel, "ERROR: you fucked this up duder.");
						console.log(err);		
					}
				}else{
					bot.say(command.channel, "No tweets found, that's pretty shitty.");

				}

				});
			}else{
			bot.say(command.channel, "Location not found, or like an error happened. I don't know, man.");

		}

});
	}else{

	Tw.get('search/tweets', {q: searchString, count:'100'}, function(err, data, response){
		if (err === null){
		if(data.statuses.length > 0){
            try {
                var tweetRandomInt = getRandomInt(0,data.statuses.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
				var arrTweet = data.statuses[tweetRandomInt].text.replace( /\n/g, "`" ).split( "`" );
				console.log(arrTweet);
				bot.say(command.channel, "Tweet from "+ data.statuses[tweetRandomInt].user.screen_name+" : "+arrTweet+" ( http://twitter.com/"+data.statuses[tweetRandomInt].user.screen_name+"/status/"+data.statuses[tweetRandomInt].id_str+" )");
			}else{
					bot.say(command.channel, "No tweets found, that's pretty shitty.");	
			}
		}else{
			bot.say(command.channel, "ERROR: you fucked this up duder.");
				console.log(err);	

		}
	});
	}
}

function randImg(kind, where){
    try {
        var redditRandomInt = getRandomInt(0,kind.length-1);
    } catch (err) {
        logger.error(err);
        return;
    }
		var urlBuild = urls.reddit + kind[redditRandomInt] +'/random/.json';
		subSelect(urlBuild, where);
}

function randoSub(sub, where){
	//console.log("sub is:"+" | "+sub+" | ", sub.length);
	var urlBuild = '';
	if (_.isEmpty(sub)){
		var urlRand = urls.reddit + 'random/';
		request(urlRand, function (error, response, body){
			urlBuild = response.request.uri.href + "random/.json";
			//console.log(urlBuild);
			subSelect(urlBuild, where);
		});

	} else {

		urlBuild = urls.reddit + sub + '/random/.json';
		subSelect(urlBuild, where);
		
	}

}
function subSelect(urlBuild, where){

	request(urlBuild, function (error, response, body) {
		var invalidSub = response.request.uri.search;
			if (!error && response.statusCode == 200 && invalidSub === null) {
				var redditData = JSON.parse(body);
				var dataUrl = redditData[0].data.children[0].data;
				//econsole.log(dataUrl);
				
				if (dataUrl.over_18 === true){
					bot.say(where,'Warning: The following is NSFW/NSFL');
				}
				bot.say(where, dataUrl.title +" from r/"+ dataUrl.subreddit +" --- "+ dataUrl.url);
				
			} else if (invalidSub !== null){
					bot.say(where,'The listed subreddit is not usable, please try another one.');
			}
		}
	);
}

function hboRando (command, avStatus){

    if(typeof avStatus !== "boolean"){
        logger.error("avStatus is not a valid boolean");
    }else{
        request({url:"http://carnage.bungie.org/haloforum/halo.forum.pl",maxRedirects:2, headers: {'User-Agent': 'request'}},
            function (error, response, body) {
                if (error || response.statusCode !== 200){
                    logger.error(error, response.statusCode);
                }else{
                    var $ = cheerio.load(body);
                    var hboTop = $('div#ind_msglist a').attr('name').replace( /^\D+/g, '');
                    hboTop = parseInt(hboTop, 10);
                    var hboBase = 0;
                    switch (command.args.join(" ")) {
                        case 'newest':
                            hboBase = Math.round(hboTop * 0.90);
                            hboForumScrape(command, avStatus, hboBase, hboTop);
                            break;
                        case 'old':
                            hboBase = Math.round(hboTop * 0.50);
                            hboTop = Math.round(hboTop * 0.89);
                            hboForumScrape(command,avStatus, hboBase, hboTop);
                            break;
                        case 'OLD':
                            hboBase = Math.round(hboTop * 0.11);
                            hboTop = Math.round(hboTop * 0.49);
                            hboForumScrape(command,avStatus, hboBase, hboTop);
                            break;
                        case 'O L D':
                            hboTop = Math.round(hboTop * 0.10);
                            hboForumScrape(command,avStatus, hboBase, hboTop);
                            break;
                        default:
                            hboForumScrape(command,avStatus, hboBase, hboTop);
                    }
                }
            });
    }
}

function hboForumScrape (command, avStatus, hboBase, hboTop) {

    if((typeof hboBase === "number") && Math.floor(hboBase) === hboBase && (typeof hboTop === "number") && Math.floor(hboTop) === hboTop) {

        async.retry(5, hboCheck, hboFormatPost);

        function hboCheck(callback) {

            try {
                var hboRandomPostNumber = getRandomInt(hboBase, hboTop);
            } catch (err) {
                logger.error(err);
                callback(err, null);
            }

            //var randHBO = getRandomInt(hboBase,hboTop);
            var hboTestUrl = "http://carnage.bungie.org/haloforum/halo.forum.pl?read=" + hboRandomPostNumber;
            request({
                url: hboTestUrl,
                maxRedirects: 2,
                headers: {'User-Agent': 'request'}
            }, function (error, response, body) {
                console.log("Request, hboCheck");
                if (error || response.statusCode !== 200) {
                    console.log(error);
                    callback("Status Code or Error on Request", null);
                    //console.log( "ERROR: HBO is not responding. Claude must be clonking me.");
                } else {
                    var $ = cheerio.load(body);
                    var hboInvalid = $('big big strong').text();
                    if (hboInvalid == "No Message!") {
                        console.log('bunk, re-routing');
                        callback("Invalid Post ID", null);
                    } else {
                        callback(null, {html: $, url: hboTestUrl});
                    }
                }
            });
        }

        function hboFormatPost(err, results) {
            if (err) {
                logger.error(err);
            } else {
                var hboTitle = results.html('div.msg_headln').text();
                var hboTitleAlt = results.html('td.subjectcell b').text();
                var hboPoster = results.html('span.msg_poster').text();
                var hboPosterAlt = results.html('td.postercell').first().text().replace("Posted By:", "").replace(/<(.*?)>/g, "").trim();

                if (avStatus == true) {
                    try {
                        var randAV = getRandomInt(0, av.items.length - 1);
                    } catch (err) {
                        logger.error(err);
                        return;
                    }
                    bot.say(command.channel, results.url);
                    bot.say(command.channel, av.items[randAV].replace(/<user>/gi, hboPoster + hboPosterAlt));
                } else {
                    bot.say(command.channel, hboTitle + hboTitleAlt + " (" + hboPoster + hboPosterAlt + ") " + results.url);
                }
            }
        }
    }else {
        logger.error("hboBase or hboTop is not a valid number");
    }
}


//Start bot//

var bot = irc.Client(network, {Logger: ircLogger});

bot.connect();

logger.stream({ start: -1 }).on('error', function(error) {
	console.log(error);  
});

var kind= '';

bot.on("join", function(message){
	if(message.nickname == "Bonk-Bot"){
		bot.say(message.channel,"BonkBot Online.... use #howtobonk for instructions and running modules");
		
	}else{
		//checkOP(message.nickname);
	}
});

bot.on("quit",function(message){
	//console.log(util.inspect(message));
	var removeName = _.where(nameList, {'name': message.nickname});
	nameList = _.without(nameList, removeName[0]);
});


/*bot.on("names",function(message){
	console.log(util.inspect(message));
	for (var key in message.names) {
		checkOP(key);
	}
});

bot.on("nick",function(message){
	console.log(util.inspect(message));
	var removeName = _.where(nameList, {'name': message.old});
	nameList = _.without(nameList, removeName[0]);
	checkOP(message.new);
	
});
*/

//Commands//

bot.on('!dmx', function(command) {
    try {
        var dmxRandomInt = getRandomInt(0,dmx.phrases.length-1);
    } catch (err) {
        logger.error(err);
        return;
    }
	bot.say(command.channel, dmx.phrases[dmxRandomInt]);
});

bot.on('!gouf', function (command){
    try {
        var goufRandomInt = getRandomInt(0,gouf.items.length-1);
    } catch (err) {
        logger.error(err);
        return;
    }
	bot.say(command.channel, gouf.items[goufRandomInt]);
});
bot.on('!hbomb',function (command){
    var timeTilHBOMB = hbombcount(null ,new Date(2015, 0, 16)).toString();
    bot.say(command.channel, "This is a memorial, that "+timeTilHBOMB+" ago, we won HBOMB.");
    bot.say(command.channel, "Pics: http://imgur.com/a/qvitD , http://imgur.com/a/SjnrQ , http://imgur.com/a/infFt , http://imgur.com/a/0p5VM");
    bot.say(command.channel, "Speech: http://tinyurl.com/qywork4");

});
bot.on('!ugh', function (command){
    try {
        var ughRandomInt = getRandomInt(0,ugh.items.length-1);
    } catch (err) {
        logger.error(err);
        return;
    }
    bot.say(command.channel, ugh.items[ughRandomInt]);
});
bot.on('!qdb', function (command){
	request("http://qdb.zero9f9.com/", function (error, response, body) {
		if (error || response.statusCode !== 200){
			console.log(error, response.statusCode);
			bot.say(command.channel, "ERROR: Something's not right with QDB. Maybe it's down.")
		}else{

			var $ = cheerio.load(body);
			var match = $('div.quoteIDBox a').map(function(i, el){ return $(this).attr('href') }).get();
            try {
                var qdbRandomInt = getRandomInt(0,match.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
			var newMatch = "http://qdb.zero9f9.com/quote.php?id=" + match[qdbRandomInt].replace( /^\D+/g, '');
			bot.say(command.channel, newMatch);
		}
	});
});

bot.on('!battlebonk', function (command) {
	
	timeToBonk(command);
	
});

bot.on('!hyokin', function (command) {
    quothTheHyo(command);
});

bot.on('!img', function (command) {
    randImg(urls.subs.img, command.channel);
});

bot.on('!gif', function (command){
    randImg(urls.subs.gif, command.channel);
});

bot.on('!rando', function (command){
    randoSub(command.args.join(''), command.channel);
});

bot.on('!translate', function (command) {
    var res = command.args.join(" ").split("/");
    var setLanguage = res[1];
    var translationString = res[0];
    if(_.isEmpty(setLanguage)){
        detectThatShit(translationString, null ,command);
    }else{
        detectThatShit(translationString, setLanguage, command);
    }
});

bot.on('!engrish', function (command){
    var res = command.args.join(" ").split("/");
    if(_.isEmpty(res[1])){
        try {
            var engrishRandomInt = getRandomInt(0,translate.engrish.length -1);
        } catch (err) {
            logger.error(err);
            return;
        }
        var resultMsg = translate.engrish[engrishRandomInt];
        engrishThatShit(res[0], resultMsg, command);
    }else{
        engrishThatShit(res[0],res[1], command);
    }
});

bot.on('!twit', function (command) {
    searchDaTweet(command.args.join(" "), command);
});

bot.on('!fanfic', function (command){
    userTweet(command, 'Fanfiction_txt');
});        

bot.on('!tweet', function (command){
    searchDaTweet(command.args.join(" "), command);
});



/*bot.on('!av', function (command){
	hboRando(command,true);
});

bot.on('!hbo', function (command){
	hboRando(command,false);
});
*/

bot.on('!rhyme', function (command){
		var rhymeWord = command.args.join("");
		var urlRhymeBuild = word.wordUrl+word.rhymeUrl+word.apiUrl;
		urlRhymeBuild = urlRhymeBuild.replace(/<word>/gi, rhymeWord).replace(/<api>/gi, word.api);

	request(urlRhymeBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word, I got no rhymes for you.');
		}else{
			var rhymeData = JSON.parse(body);
            try {
                var rhymeRandomInt = getRandomInt(0,rhymeData[0].words.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
            try {
                var phraseRandomInt = getRandomInt(0,rhymePos.items.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
			var chosenRhyme = rhymePos.items[phraseRandomInt];
			var replaceRhyme =  chosenRhyme.replace(/rhymed/gi, rhymeData[0].words[rhymeRandomInt]).toUpperCase().replace(/word/gi,command.args.join("").toUpperCase());
			bot.say(command.channel, replaceRhyme);
		}
	});	
});

bot.on('!define', function (command){
	var defineWord = command.args.join("");
	var urlDefineBuild = word.wordUrl+word.defineUrl+word.apiUrl;
	urlDefineBuild = urlDefineBuild.replace(/<word>/gi, defineWord).replace(/<api>/gi, word.api);

	request(urlDefineBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word, I got no definitions for you.');
		}else{
			var defineData = JSON.parse(body);
            try {
                var defineRandomInt = getRandomInt(0,defineData.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
			bot.say(command.channel, defineData[defineRandomInt].word+" ["+defineData[defineRandomInt].partOfSpeech+"] : "+defineData[defineRandomInte].text);
		}
	});	
});

bot.on('!example', function (command){
var exampleWord = command.args.join("");
var urlExampleBuild = word.wordUrl+word.exampleUrl+word.apiUrl;
urlExampleBuild = urlExampleBuild.replace(/<word>/gi, exampleWord).replace(/<api>/gi, word.api);
request(urlExampleBuild, function (error, response, body) {
	if (error || response.statusCode !== 200 || body.length <= 2){
		bot.say(command.channel,'Try another word. I got no examples for you, jack.');
	}else{
		var exampleData = JSON.parse(body);
        try {
            var exampleRandomInt = getRandomInt(0,exampleData.examples.length-1);
        } catch (err) {
            logger.error(err);
            return;
        }
		bot.say(command.channel, exampleData.examples[exampleRandomInt].text+ " -"+exampleData.examples[exampleRandomInt].year+", "+exampleData.examples[exampleRandomInt].title);
	}
});
	
});


bot.on('!hbombforecast', function (command){
	var urlForecast ="https://api.forecast.io/forecast/a0826bcd5ec330beb7cc075b10f2e9c7/48.890123,-121.945702,2015-01-17T12:00:00";
	request(urlForecast, function (error,response, body){
		if (error || response.statusCode !== 200 || body.length <= 2){
			console.log('Error, bro :'+ error);
		}else{
			var forecastData = JSON.parse(body);
			var forecastHBOMB = forecastData.hourly.data[11];
			var date = new Date(forecastHBOMB.time*1000);
			var time = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear();
			bot.say(command.channel,"HBOMB Forecast: "+forecastHBOMB.summary+" - "+forecastHBOMB.temperature+" - Humidity : "+forecastHBOMB.humidity*100+"% - Precipitation : "+forecastHBOMB.precipType+" | "+time);
		}
	});
});


/*
bot.on('!acro', function (command){
	var acroWord = command.args.join("");
	var acLetter = acroWord.split("");
	syncAcro(command, acLetter);
});


bot.on('!syn', function (command){
	syncSyn(command);
});
*/

bot.on('!speak', function (command){
	var audioWord = command.args.join("");
	var urlAudioBuild = word.wordUrl+word.audioUrl+word.apiUrl;
	urlAudioBuild = urlAudioBuild.replace(/<word>/gi, audioWord).replace(/<api>/gi, word.api);
	request(urlAudioBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word. I got nothing to say to you, fucko.');
		}else{
			var audioData = JSON.parse(body);
            try {
                var audioRandomInt = getRandomInt(0,audioData.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
			bot.say(command.channel, audioData[audioRandomInt].fileUrl);
		}
	});
});

bot.on('!pron', function (command){
	var pronWord = command.args.join("");
	var urlPronBuild = word.wordUrl+word.pronUrl+word.apiUrl;
	urlPronBuild = urlPronBuild.replace(/<word>/gi, pronWord).replace(/<api>/gi, word.api);
	request(urlPronBuild, function (error, response, body) {
		if (error || response.statusCode !== 200 || body.length <= 2){
			bot.say(command.channel,'Try another word. I got no pronunciations for you, guy.');
		}else{
			var pronData = JSON.parse(body);
            try {
                var pronounceRandomInt = getRandomInt(0,pronData.length-1);
            } catch (err) {
                logger.error(err);
                return;
            }
			bot.say(command.channel, pronData[pronounceRandomInt].raw);
		}
	});
});

bot.on('!pax',function (command){
    var timeTilPAX = hbombcount(null ,new Date(2015, 7, 28)).toString();
    bot.say(command.channel, "Tentatively, in "+timeTilPAX+", we will PAX.");
});

bot.on('!dorj',function (command){
    bot.say(command.channel, "YA TA! http://i.imgur.com/z3E28VS.jpg");
});

bot.on('!anime',function (command){
    bot.say(command.channel, "http://www.watchcartoononline.com/outlaw-star-episode-2-english-dubbed");
});

bot.on('!tweep', function (command){
    userTweet(command, command.args.join(""));
});        
bot.on('!tricked', function (command){
    try {
        var trickedRandomInt = getRandomInt(0,tricked.items.length-1);
    } catch (err) {
        logger.error(err);
        return;
    }
    bot.say(command.channel, ">tfw "+tricked.items[trickedRandomInt]);
});


bot.on('error', function (message){
    print(message);
});