let sprintf = require(`sprintf-js`).sprintf
    , instance = null
;

class Adapter {
    constructor() {
        this.name = `weku`;

        this.connection = require(`@steemit/steem-js`);
        this.reconnect();
    }

    static instance() {
        if (null === instance) {
            instance = new Adapter();
        }

        return instance;
    }

    reconnect() {
        this.connection.api.setOptions({ url: `wss://standby.weku.io:8190` });
        this.connection.config.set(`address_prefix`, `WKA`);
        this.connection.config.set(`chain_id`, `b24e09256ee14bab6d58bfa3a4e47b0474a73ef4d6c47eeea007848195fa085e`);
    }

    async processAccountDetails(username, callback, notFoundCallback) {
        let instance = this;

        instance.reconnect();
        instance.connection.api.getDynamicGlobalProperties(function(err, gp) {
            if (err) {
                console.error(`Adapter: Failed to load dynamic global properties`);
                console.error(err);

                return;
            }

            instance.reconnect();
            instance.connection.api.getAccounts([username], function (err, result) {
                if (err) {
                    console.error(sprintf(`Adapter: Failed to load account info: "%s"`, username));
                    console.error(err);

                    return;
                }
                if (result.length < 1) {
                    if (notFoundCallback) {
                        notFoundCallback()
                    } else {
                        console.error(sprintf(`Adapter: Account "%s" not found.`, username));
                    }

                    return;
                }

                callback(result[0], gp);
            });
        });
    }
}

module.exports.Adapter = Adapter;
