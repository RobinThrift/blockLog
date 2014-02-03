var es = require('event-stream'),
    _  = require('lodash');

var blockLog = function(name) {

    this.name = name;
    this._s = es.through();
    this._attached = {};
    this._maps = [];

    this._plainFormat = function(data) {
        return '[' + data.level.toUpperCase() + '] ' + JSON.stringify(data.msg) + '\n';
    };

};


blockLog.prototype = {

    setPlainFormat: function(fn) {
        this._s = es.through();
        
        this._plainFormat = fn;

        _.each(this._attached, function(_s) {
            this.attach(_s.name, _s.stream, _s);
        }.bind(this));
    },

    _jsonStream: es.stringify, 

    _levelMap: function(levels) {
        return es.map(function(data, cb) {
            var _l = data.level.toLowerCase();
            if (levels == 'all' || levels == _l || _.contains(levels, _l)) {
                cb(null, data);
            } else {
                cb();
            }
        });
    },

    _txtStream: function () { 
        var self = this;
        return es.map(function(data, cb) { 
            cb(null, self._plainFormat(data));
        });
    },

    _write: function(data) {
        this._s.write(data);
    },

    log: function(level, msgs) {
        _.each(msgs, function(msg) {
            this._write({
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

    attach: function(name, listener, opts) {
        var o      = opts || {},
            type   = o.type || 'plain',
            levels = o.levels || 'all',
            _ns;

        this._attached[name] = {
            name: name,
            stream: listener,
            type: type,
            levels: levels
        };


        _ns = this._s.pipe(this._levelMap(levels));

        _.each(this._maps, function(map) {
            if ((map.levels == 'all' 
                    || map.levels == levels 
                    || _.intersection(map.levels, levels)) 
                    && (map.type == type
                    || map.type == 'all')) {
                _ns = _ns.pipe(map.fn());
            }
        });


        switch (type) {
            case 'json':
                _ns = _ns.pipe(this._jsonStream());
            break;
            case 'plain':
            default:
                _ns = _ns.pipe(this._txtStream());
            break;
        }

        _ns.pipe(listener);
    },



    addMap: function(mapFn, opts) {
        var defaults = {
                type: 'all',
                levels: 'all'
            },
            map;

        map = _.defaults(defaults, opts);

        this._s = es.through();

        map.fn = function() {return es.map(mapFn);};

        this._maps.push(map);

        _.each(this._attached, function(_s) {

            this.attach(_s.name, _s.stream, _s);

        }.bind(this));

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