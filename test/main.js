var should = require('should'),
    bnl    = require('../');

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
    });

});
