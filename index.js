var es = require('event-stream');

var bricksNlogs = {
    _s: es.pause(),

    jsonStream: es.stringify,
     
    txtStream: function () { 
        return es.map(function(data, cb) { 
            cb(null, '[' + data.level.toUpperCase() + '] ' + data.msg + '\n');
        });
    },

    write: function(data) {
        this._s.write(data);
    },

    log: function(level, msgs) {
        msgs.forEach(function(msg) {
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

    attach: function(listener, type) {
        switch (type) {
            case 'json':
                this._s.pipe(this.jsonStream()).pipe(listener);
            break;
            case 'raw':
                this._s.pipe(listener);
            break;
            case 'txt':
            default:
                this._s.pipe(this.txtStream()).pipe(listener);
            break;
        }
    },


    }
};



module.exports = bricksNlogs;