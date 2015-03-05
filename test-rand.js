winston = require('winston');
_= require('lodash-node');
async = require('async');
request = require('request');


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

/*
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


});*/

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
                    hboForumScrape(command, avStatus, hboTop, hboBase);
                    break;
                case 'old':
                    hboBase = Math.round(hboTop * 0.50);
                    hboTop = Math.round(hboTop * 0.89);
                    hboForumScrape(command,avStatus, hboTop, hboBase);
                    break;
                case 'OLD':
                    hboBase = Math.round(hboTop * 0.11);
                    hboTop = Math.round(hboTop * 0.49);
                    hboForumScrape(command,avStatus, hboTop, hboBase);
                    break;
                case 'O L D':
                    hboTop = Math.round(hboTop * 0.10);
                    hboForumScrape(command,avStatus, hboTop, hboBase);
                    break;
                default:
                    hboForumScrape(command,avStatus, hboTop, hboBase);
            }
        }
    });
}

//hboForumScrape(true,100000,1000);

function hboForumScrape (/*command,*/ avStatus, hboTop, hboBase) {

    async.retry(5, hboCheck, hboFormatPost);

    function hboCheck(callback){

        try {
            var hboRandomPostNumber = getRandomInt(hboBase,hboTop);
        }catch(err){
            logger.error(err);
            callback(err,null);
        }

        //var randHBO = getRandomInt(hboBase,hboTop);
        var hboTestUrl = "http://carnage.bungie.org/haloforum/halo.forum.pl?read="+hboRandomPostNumber;
        request(hboTestUrl, function (error, response, body) {
                console.log("Request, hboCheck");
            if (error || response.statusCode !== 200) {
                console.log(error);
                callback("Status Code or Error on Request",null);
                //console.log( "ERROR: HBO is not responding. Claude must be clonking me.");
            } else {
                var $ = cheerio.load(body);
                var hboInvalid = $('big big strong').text();
                if (hboInvalid == "No Message!") {
                    console.log('bunk, re-routing');
                    callback("Invalid Post ID", null);
                }else{

                }
            }
        });
    }
    function hboFormatPost(err, results) {
        if(err){
            logger.error(err);
        }else{
            var hboTitle = $('div.msg_headln').text();
            var hboTitleAlt = $('td.subjectcell b').text();
            var hboPoster = $('span.msg_poster').text();
            var hboPosterAlt = $('td.postercell').first().text().replace("Posted By:", "").replace(/<(.*?)>/g, "").trim();

            if (avStatus == true) {
                var randAV = getRandomInt(0, av.items.length - 1);
                console.log( hboRandUrl);
                console.log( av.items[randAV].replace(/<user>/gi, hboPoster + hboPosterAlt));
            } else {
                console.log( hboTitle + hboTitleAlt + " (" + hboPoster + hboPosterAlt + ") " + hboRandUrl);
            }
        }
    }
}

