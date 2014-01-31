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


    middleware: function() {

        var self = this;

        self.attach(process.stdout, 'txt');

        return function(req, res, next) {
            var ip       = req.ip,
            method   = req.method,
            path     = req.path,
            protocol = req.protocol,
            isXHR    = req.xhr,
            date     = new Date();

            self.info(date + ' (' + ip + ') – [' + protocol + '] ' + method.toUpperCase() + ' ' + path + ' (XHR: ' + isXHR + ')');

            next();
        }

    }
};



module.exports = bricksNlogs;