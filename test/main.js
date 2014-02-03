var should = require('should'),
    blockLog    = require('../'),
    fs     = require('fs');

require('mocha');

describe('blockLog logging lib – ', function() {

    describe('test base functions – ', function() {
        it('should pipe to stdout', function(done) {

            var log = new blockLog('stdout-log-stream');

            process.stdout.once('pipe', function(src) {
                done();
            });

            log.attach('stdout', process.stdout);

            log.info('blub');
        });

        it('should pipe to a file', function(done) {

            fs.writeFileSync('test/fixtures/filetest.txt', '');

            var log = new blockLog('file-log-stream'),
                ws = fs.createWriteStream('test/fixtures/filetest.txt', {encoding: 'utf8'});

            log.attach('testFile', ws, {
                type: 'json'
            });

            ws.once('finish', function() {
                var fixt = '{"level":"info","msg":"test"}\n',
                    res  = fs.readFileSync('test/fixtures/filetest.txt', {encoding: 'utf8'});

                res.should.be.equal(fixt);
                done();
            });

            log.info('test');

            ws.end();

        });

    });



    describe('advanced features – ', function() {

        it('custom map', function(done) {

            fs.writeFileSync('test/fixtures/maptest.txt', '');

            var log = new blockLog('custom-formatter-log-stream'),
                ws = fs.createWriteStream('test/fixtures/maptest.txt', {encoding: 'utf8'});

            log.attach('testFile', ws, {
                type: 'plain'
            });

            log.addMap(function(data, cb) {
                data.msg += 10;
                cb(null, data);
            }, 'plain');

            ws.once('finish', function() {
                var fixt = '[INFO] 20\n',
                    res  = fs.readFileSync('test/fixtures/maptest.txt', {encoding: 'utf8'});

                res.should.be.equal(fixt);
                done();
            });

            log.info(10);

            ws.end();


        });

        it('custom plain formatter', function(done) {

            fs.writeFileSync('test/fixtures/formattest.txt', '');

            var log = new blockLog('custom-formatter-log-stream'),
                ws = fs.createWriteStream('test/fixtures/formattest.txt', {encoding: 'utf8'});

            log.setPlainFormat(function(data) {
                return JSON.stringify(data.msg);
            });

            log.attach('testFile', ws, {
                type: 'plain'
            });

            ws.once('finish', function() {
                var fixt = '"world"',
                    res  = fs.readFileSync('test/fixtures/formattest.txt', {encoding: 'utf8'});

                res.should.be.equal(fixt);
                done();
            });

            log.info('world');

            ws.end();


        });

    });


    describe('framework integration with', function() {

        it('express', function(done) {
            
            var log     = new blockLog('express-log-stream'),
                mockReq = {
                    ip: '127.0.0.1',
                    method: 'get',
                    path: '/',
                    protocol: 'http',
                    xhr: false
                },
                middleware;

            process.stdout.once('pipe', function() {
                done();
            });

            middleware = log.express();

            middleware(mockReq, {}, function() {});

        });

    });


});
