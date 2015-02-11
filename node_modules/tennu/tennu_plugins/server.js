module.exports = {
    init: function (client, imports) {
        const isupport = {};
        client._messageHandler.isupport(isupport);
        return {
            handlers: {
                '005': function (isupportMessage) {
                    isupportMessage.params.map(function (param) {
                        return param.split('=');
                    }).forEach(function (a0) {
                        if (Array.isArray ? Array.isArray(a0) : Object.prototype.toString.call(a0) === '[object Array]') {
                            if (a0.length === 1) {
                                var supported = a0[0];
                                return isupport[supported] = true;
                            }
                            if (a0.length === 2) {
                                var supported = a0[0];
                                var value = a0[1];
                                return isupport[supported] = value;
                            }
                        }
                        throw new TypeError('No match');
                    });
                }
            },
            exports: { isupport: isupport }
        };
    }
};
//# sourceMappingURL=../sourcemaps/plugin/server.js.map