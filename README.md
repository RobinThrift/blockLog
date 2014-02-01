[![Build Status](https://travis-ci.org/RobinThrift/blockLog.png?branch=master)](https://travis-ci.org/RobinThrift/blockLog)
[![NPM version](https://badge.fury.io/js/blocklog.png)](http://badge.fury.io/js/blocklog)
#blockLog
A simple and adaptable stream-based logging lib for node.js


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


---

##ROADMAP

- [Hapi](http://spumko.github.io/) compatible
- [Koa.js](http://koajs.com/) compatible
- Maps/Filters
- custom formatters
- unpipe?


---

##License

MIT

&copy; 2014 Robin Thrift


























