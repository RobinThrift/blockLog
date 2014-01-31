[![Build Status](https://travis-ci.org/RobinThrift/blocksNlogs.png?branch=master)](https://travis-ci.org/RobinThrift/blocksNlogs)
#blocks 'n' logs
A simple and adaptable stream-based logging lib for node.js


- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [ROADMAP](#roadmap)


##Installation
Simply install via **npm**:   
`npm install --save-dev blocks 'n' logs`

##Usage

First of all require it:  
`var log = require('blocksNlogs');`

Then you will need to attach an adapter to stream to. This must be a writeable stream, like `process.stdout` or a writeable file stream using `fs.createWriteStream`. 

For most streams you will also need to specify the logging type. At the moment there are three logging types:

- **raw**: The raw input data will be piped through
- **txt**: `blocks 'n' logs` will nicely format the logging message into a nice string for you (as `[LEVEL] MSG"`)
- **json**: The data will be passed as JSON strings. Useful when you want to read the data later, without complicated parsing.

> NOTE: When using the **txt** or **json** format `blocks 'n' logs` will append a `\n` at the end of the formatted string.


Once you have attached a stream (you may attach more than one, at any time) you can start logging:

```js  
var log = require('blocksNlogs');

log.attach(process.stdout, 'txt');

log.info('Hello World');

log.warning('Oh no');

log.error('whoops', 'another Error');

log.log('customLogLevel', ['msg1', 'msg2']);

```

If you want to log to a file simply open a writeable stream with `fs`:

```js  
var log = require('blocksNlogs'),
    fs  = require('fs');

log.attach(fs.createWriteStream('path/to/file.txt', {encoding: 'uft8'}), 'json');

log.info('Hello File');


```

##Usage with [Express.js](http://expressjs.com/api.html#app.use)
`blocks 'n' logs` comes with a middleware wrapper for `express.js` applications.

```js
//...

app.use(log.middleware());

```
Don't forget to attach streams to the logger, otherwise you won't see anything.

---


##API

####`attach(stream, type)`
This method simply accepts a writable stream and the type of data the stream accepts, e. g. plain text (`txt`) or raw data (`raw`).

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

- Allow multiple instances
- [Hapi](http://spumko.github.io/) compatible
- [Koa.js](http://koajs.com/) compatible





























