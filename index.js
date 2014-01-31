var _  = require('lodash'),
    es = require('event-stream');

var bricksNlogs = {
    _s: es.pause(),

    write: function(data) {
        this._s.write(JSON.stringify(data) + "\n");
    },

    log: function(level, msgs) {
        _.each(msgs, function(msg) {
            this.write({
                level: level,
                msg: msg
            });
        }.bind(this));
    },

    info: function() {
        this.log('info', _.toArray(arguments));
    },

    warning: function() {
        this.log('warning', _.toArray(arguments));
    },

    error: function() {
        this.log('error', _.toArray(arguments));
    },

    attach: function(listener) {
        this._s.pipe(listener);
    }
};



module.exports = bricksNlogs;