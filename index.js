var es      = require('event-stream'),
    _       = require('lodash'),
    fs      = require('fs'),
    moment  = require('moment');

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
                msg: msg,
                time: moment().unix(),
                uptime: process.uptime(),
                pid: process.pid
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
            rot    = o.rotation || false,
            _ns;

        this._attached[name] = {
            name: name,
            stream: listener,
            type: type,
            levels: levels,
            rotation: rot
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

        if (rot) {
            this._rotate(name);
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


    createEndpoint: es.map,


    _rotate: function(name) {
        var self = this,
            _st  = this._attached[name],
            _t   = this._parsePeriod(_st.rotation.period);

        _st._rotate = function() {
            var newPath = _st.rotation.path + moment().format(_st.rotation.format);

            _st.stream.close();

            fs.rename(_st.rotation.path, newPath, function() {
                _st.stream = fs.createWriteStream(_st.rotation.path, {encoding: 'utf8'});
                self.attach(name, _st.stream, _st);
                if (_.isFunction(_st.rotation.afterRotate)) {
                    _st.rotation.afterRotate(newPath, moment());
                }
            });
        }

        _st.timeout = setTimeout(_st._rotate, moment().add(_t.unit, _t.amount).valueOf() - moment().valueOf());

    },

    _parsePeriod: function(period) {
        var _p  = /([0-9]+)(d|s|m|y|w|h)/.exec(period),
            res = {};

        res.amount = _p[1];

        switch (_p[2]) {
            case 'seconds':
            case 's':
                res.unit = 'seconds';
            break;
            case 'minutes':
            case 'm':
                res.unit = 'minutes';
            break;
            case 'hours':
            case 'h':
                res.unit = 'hours';
            break;
            case 'days':
            case 'd':
                res.unit = 'days';
            break;
            case 'weeks':
            case 'w':
                res.unit = 'weeks';
            break;
            case 'months':
            case 'M':
                res.unit = 'months';
            break;
            case 'years':
            case 'y':
                res.unit = 'years';
            break;
        }

        return res;
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