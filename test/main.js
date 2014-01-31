var should = require('should'),
    bnl    = require('../'),
    fs     = require('fs');

require('mocha');

describe('blocksNlogs logging lib', function() {

    describe('test base functions:', function() {
        it('should pipe to stdout', function(done) {

            process.stdout.on('pipe', function(src) {
                (bnl._s === src).should.be.ok;
                done();
            });

            bnl.attach(process.stdout);

            bnl.info('test', 'blub');
        });

        it('should pipe to a file', function(done) {

            fs.writeFileSync('test/fixtures/test.txt', '');

            var ws = fs.createWriteStream('test/fixtures/test.txt', {encoding: 'utf8'});

            bnl.attach(ws);

            ws.once('finish', function(src) {
                var fixt = fs.readFileSync('test/fixtures/fixt.txt', {encoding: 'utf8'}),
                    res  = fs.readFileSync('test/fixtures/test.txt', {encoding: 'utf8'});

                res.should.be.equal(fixt);
                done();
            });

            bnl.info('test');

            ws.end();

        });
    });



});