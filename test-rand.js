winston = require('winston');
_= require('lodash-node');
async = require('async');


function getRandomInt(min,max){
    if((typeof min === "number") && Math.floor(min) === min && (typeof max === "number") && Math.floor(max) === max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }else{
        //logger.error('min or max number is not a valid number');
        throw 'min or max number is not a valid number';
    }
}

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: "debug"},{level:"error"},{level:"notice"},{level:"warn"},{level:"info"},{level:"crit"},{level:"alert"},{level:"emerg"}),
        new (winston.transports.File)({level:"debug", filename: './irc-log.log' })
    ]
});















function randRight(callback){
    try {
        var randNumber = getRandomInt(1, 5);
    }catch(err){
        logger.error(err);
        return;
    }
    console.log(randNumber);
 if(randNumber == 5){
     callback(null,true);
 }else{
     callback("not 5",null);
 }
}



async.retry(5, randRight, function(err, result) {
    console.log("CB: "+err+result);
});



function hboCheck (command, avStatus, hboTop, hboBase) {

    var randHBO = getRandomInt(hboBase,hboTop);
    //var hboRandUrl = "http://carnage.bungie.org/haloforum/halo.forum.pl?read="+randHBO;
    request(hboRandUrl, function (error, response, body) {
        console.log("Request, hboCheck");
        if (error || response.statusCode !== 200){
            console.log(error);
            bot.say(command.channel, "ERROR: HBO is not responding. Claude must be clonking me.");
        }else{
            var $ = cheerio.load(body);
            var hboInvalid = $('big big strong').text();
            if(hboInvalid == "No Message!"){
                console.log('bunk, re-routing');
                //hboCheck(command, avStatus, hboTop, hboBase);
            }else{
                var hboTitle = $('div.msg_headln').text();
                var hboTitleAlt = $('td.subjectcell b').text();
                var hboPoster = $('span.msg_poster').text();
                var hboPosterAlt = $('td.postercell').first().text().replace("Posted By:","").replace(/<(.*?)>/g,"").trim();

                if(avStatus == true){
                    var randAV = getRandomInt(0, av.items.length-1);
                    bot.say(command.channel,hboRandUrl);
                    bot.say(command.channel, av.items[randAV].replace(/<user>/gi,hboPoster+hboPosterAlt));
                }else{
                    bot.say(command.channel, hboTitle+ hboTitleAlt+ " ("+hboPoster+hboPosterAlt+") "+ hboRandUrl);
                }



            }

        }
    });
}

function hboRando (command, avStatus){

    request("http://carnage.bungie.org/haloforum/halo.forum.pl", function (error, response, body) {
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
                    hboCheck(command, avStatus, hboTop, hboBase);
                    break;
                case 'old':
                    hboBase = Math.round(hboTop * 0.50);
                    hboTop = Math.round(hboTop * 0.89);
                    hboCheck(command,avStatus, hboTop, hboBase);
                    break;
                case 'OLD':
                    hboBase = Math.round(hboTop * 0.11);
                    hboTop = Math.round(hboTop * 0.49);
                    hboCheck(command,avStatus, hboTop, hboBase);
                    break;
                case 'O L D':
                    hboTop = Math.round(hboTop * 0.10);
                    hboCheck(command,avStatus, hboTop, hboBase);
                    break;
                default:
                    hboCheck(command,avStatus, hboTop, hboBase);
            }
        }
    });
}