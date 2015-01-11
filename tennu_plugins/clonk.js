var clonkPlugin = {
    init: function (client, imports) {
        return {
            handlers: {
                "!clonk": function (command) {
                    client.quit("Goodbye world");
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