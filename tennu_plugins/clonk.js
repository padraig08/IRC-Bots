var clonkPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                "!clonk": function (command) {
                    if (command.nickname == "General_Vagueness" || command.nickname == "GeneralVagueness" ||
					command.nickname == "Gen_Vagueness") {
						client.quit("Goodbye world");
					}
					else {
						client.say(command.channel, "That command is restricted");
					}
                   }
            },

            help: {
                "command": [
                    "Send the bot to the shadow realm",
                    " ",
                    "To the shadow realm. (bot owner only)"]
            },

            commands: ["clonk"]
        }
    }
};

module.exports = clonkPlugin;