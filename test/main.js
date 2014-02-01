var should = require('should'),
    blockLog    = require('../'),
    fs     = require('fs');

require('mocha');

describe('blocksNlogs logging lib – ', function() {

    describe('test base functions – ', function() {
        it('should pipe to stdout', function(done) {

            var log = new blockLog('stdout-log-stream');

            process.stdout.once('pipe', function(src) {
                done();
            });

            log.attach('stdout', process.stdout, 'plain');

            log.info('blub');
        });

        it('should pipe to a file', function(done) {

            fs.writeFileSync('test/fixtures/test.txt', '');

            var log = new blockLog('file-log-stream'),
                ws = fs.createWriteStream('test/fixtures/test.txt', {encoding: 'utf8'})

            log.attach('testFile', ws, 'json');

            ws.once('finish', function() {
                var fixt = fs.readFileSync('test/fixtures/fixt.txt', {encoding: 'utf8'}),
                    res  = fs.readFileSync('test/fixtures/test.txt', {encoding: 'utf8'});

                res.should.be.equal(fixt);
                done();
            });

            log.info('test');

            ws.end();

        });

    });



});
