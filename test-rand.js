winston = require('winston');

function getRandomInt(min,max){
    if((typeof min === "number") && Math.floor(min) === min && (typeof max === "number") && Math.floor(max) === max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }else{
        console.log('FAILURE');
    }
}

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: "debug"},{level:"error"},{level:"notice"},{level:"warn"},{level:"info"},{level:"crit"},{level:"alert"},{level:"emerg"}),
        new (winston.transports.File)({level:"debug", filename: './irc-log.log' })
    ]
});

var quack = getRandomInt(1,parseInt(2,10));
logger.debug(quack);
logger.error("BATMAN");
