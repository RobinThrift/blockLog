[![Build Status](https://travis-ci.org/RobinThrift/blockLog.png?branch=master)](https://travis-ci.org/RobinThrift/blockLog)
[![NPM version](https://badge.fury.io/js/blocklog.png)](http://badge.fury.io/js/blocklog)
#blockLog
A simple and adaptable stream-based logging lib for node.js, with support for multiple outputs and log rotation.


- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [ROADMAP](#roadmap)
- [License](#license)


##Installation
Simply install via **npm**:   
`npm install --save blocklog`

##Usage

First of all require it and get a new instance:  
```js
var blockLog = require('blocklog'),
    log      = new blockLog('name');
```

Then you will need to attach an adapter to stream to. This must be a writeable stream, like `process.stdout` or a writeable file stream using `fs.createWriteStream`. 

For most streams you will also need to specify the logging type. At the moment there are three logging types:

- **raw**: The raw input data will be piped through
- **plain**: `blockLog` will nicely format the logging message into a nice string for you (as `[LEVEL] MSG"`)
- **json**: The data will be passed as JSON strings. Useful when you want to read the data later, without complicated parsing.

> NOTE: When using the **plain** or **json** format `blockLog` will append a `\n` at the end of the formatted string.


Once you have attached a stream (you may attach more than one, at any time) you can start logging:

```js  
var blockLog = require('blocklog'),
    log      = new blockLog('name');

log.attach('stdout', process.stdout, 'plain');

log.info('Hello World');

log.warning('Oh no');

log.error('whoops', 'another Error');

log.log('customLogLevel', ['msg1', 'msg2']);

```

If you want to log to a file simply open a writeable stream with `fs`:

```js  
var blockLog = require('blocklog'),
    log      = new blockLog('name');
    fs       = require('fs');

log.attach('fileLog', fs.createWriteStream('path/to/file.txt', {encoding: 'uft8'}), 'json');

log.info('Hello File');


```

##Usage with [Express.js](http://expressjs.com/api.html#app.use)
`blockLog` comes with a middleware wrapper for `express.js` applications.

```js
//...

app.use(log.express());

```
Don't forget to attach streams to the logger, otherwise you won't see anything.

---


##API

####`new blockLog(name)`
You can create multiple instances, each with their own set of attached streams, filters, formatters, etc. You may pass in a name to be able to distinguish the instances, if they log to the same stream (like stdout). 

####`attach(name, stream, type)`
The first argument is the name of the stream (used internally and can be used to remove it later one), then a writable stream and the type of data the stream accepts, e. g. plain text (`plain`) or raw data (`raw`).

####`info(msg...)`
Logs the parameters to the stream and marks them as info level logs.

####`warning(msg...)`
Logs the parameters to the stream and marks them as info level logs.

####`error(msg...)`
Logs the parameters to the stream and marks them as info level logs.

####`log(level, msgs)`
The internal method used to log to the stream. Accepts a log level and an array of log messages.


####`setPlainFormat(fn)`
Replace the default format for the plain text output. The function takes one parameter, which will be the log data: log level and message.  
**Example:**  
```js
log.setPlainFormat(function(data) {
    return '|' + data.level + '| -> ' + JSON.stringify(data.msg) + '\n';
});  
```

####`addMap(mapFn, opts)`
Add a map to transform the log data. The `mapFn` will be passed to [`event-stream`](https://github.com/dominictarr/event-stream#map-asyncfunction)'s `map` function, so each function will get two parameters, the data and a callback that must be called.  
  
`opts` can hold the following keys:

|key|default|description|
|:--|:------|:----------|
|type|'all'|To which type of log output should this map apply, like 'json' or 'plain'|
|levels|'all'|Either 'all' or an array of log levels the map should apply, e. g. ['info', 'error']|



**Example:**  
```js
log.addMap(function(data, cb) {
    data.msg += ' (transformed)';
    cb(null, data);
}); 
```


####`createEndpoint(fn)`
If you don't want to deal with streams you can simply create an endpoint to pipe to. This method takes a function that will be executed for each logged item.
```js
var ep  = log.createEndpoint(function(data) {
        mail(data).to("email");
        // or do anything else you want to do with your data here
    });

log.attach('endpoint', ep);
``` 


###Log rotation
`blockLog` supports log roation for file based streams. Create a writeable file stream and attach it to the log stream. By passing the `rotation` option you can specify the log rotation.

|key|description|
|:--|:----------|
|path|The path to the file that is being rotated. The old logs will have the same name with the `format` appended|
|format|The way the time will be formated when the old log file is created|
|period|A string made up of a number and a unit|
|afterRotate|A callback that will be fired after the log rotation has created a new file. It will be passed the path to the new file and the timestamp at which it was created|

####Options for the period:
|unit|description|
|:--|:----------|
|s|Seconds|
|m|Minutes|
|h|Hours|
|d|Days|
|w|Weeks|
|M|Months|
|y|Years|


```js
var ws = fs.createWriteStream('logs/rotating.log', {encoding: 'utf8'});

log.attach('rotating-file', ws, {
    type: 'plain',
    rotation: {
        path: 'logs/rotating.log',
        format: '.YYYY-MM-DD-ss',
        period: '1d',
        afterRotate: function(newPath, now) {
            fs.unlinkSync(newPath);
        }
    }
});

```
> NOTE: new file streams are created using utf8 encoding


---

##ROADMAP

- [Hapi](http://spumko.github.io/) compatible
- [Koa.js](http://koajs.com/) compatible
- unpipe?


---

##License

MIT

&copy; 2014 Robin Thrift


























