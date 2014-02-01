var es = require('event-stream');

var blockLog = function(name) {

    this.name = name;
    this._s = es.through();
    this._attached = {};

};


blockLog.prototype = {

    _jsonStream: es.stringify, 

    _txtStream: function () { 
        return es.map(function(data, cb) { 
            cb(null, '[' + data.level.toUpperCase() + '] ' + data.msg + '\n');
        });
    },

    _write: function(data) {
        this._s.write(data);
    },

    log: function(level, msgs) {
        msgs.forEach(function(msg) {
            this._write({
                level: level,
                msg: msg
            });
        }.bind(this));
    },

    info: function() {
        this.log('info', Array.prototype.slice.call(arguments, 0));
    },

    warning: function() {
        this.log('warning', Array.prototype.slice.call(arguments, 0));
    },

    error: function() {
        this.log('error', Array.prototype.slice.call(arguments, 0));
    },

    attach: function(name, listener, type) {
        this._attached[name] = {
            name: name,
            stream: listener,
            type: type
        };

        switch (type) {
            case 'json':
                this._s.pipe(this._jsonStream()).pipe(listener);
            break;
            case 'raw':
                this._s.pipe(listener);
            break;
            case 'plain':
            default:
                this._s.pipe(this._txtStream()).pipe(listener);
            break;
        }
    },


    express: function() {

        var self = this;

        self.attach('stdout', process.stdout, 'plain');

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

module.exports = blockLog;