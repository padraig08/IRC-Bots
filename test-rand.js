var botData = require('./botData.json'),
    av = botData.av,
    winston = require('winston'),
    _= require('lodash-node'),
    async = require('async'),
    request = require('request'),
    cheerio = require('cheerio');




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

//hboForumScrape(false, 1000,30000);

function hboForumScrape (/*command,*/ avStatus, hboBase, hboTop) {

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
                    console.log(results.url);
                    console.log(av.items[randAV].replace(/<user>/gi, hboPoster + hboPosterAlt));
                } else {
                    console.log(hboTitle + hboTitleAlt + " (" + hboPoster + hboPosterAlt + ") " + results.url);
                }
            }
        }
    }else {
        logger.error("hboBase or hboTop is not a valid number");
    }
}
