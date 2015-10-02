var assert = require('chai').assert;
var fs = require('fs');
var mllp = require('../index.js');
var net = require('net');

describe('test server with client data exchange', function () {
    var hl7 = '';
    var server;

    before(function () {
        hl7 = fs.readFileSync('./test/fixtures/test.txt').toString().split('\n').join('\r');

        server = new mllp.MLLPServer('127.0.0.1', 6969);
    });

    it('sends and receives', function () {

        var client = net.connect({
                port: 6969
            },
            function () { //'connect' listener
                console.log('client connected');
                client.write('@' + hl7 + '@@');
            });

        client.on('data', function (data) {
            var blah = data.toString();

            console.log('ack received: ', blah.substring(1, blah.length - 3).split('\r').join('\n'));
            blah = blah.split('\r');
            assert.equal(blah[1].substring(0, 7), 'MSA|AA|');

            client.end();
        });
    });

    it('receives exactly the information sent', function (done) {

        server.on('hl7', function (data) {
           assert.equal(hl7, data);
           done();
        });

        var client = net.connect({
            port: 6969
        }, function () {
            console.log('client connected');
            client.write('@' + hl7 + '@@');
        });

        client.on('data', function (dat) {
            console.log('ack received');
            client.end();
        });
    });
});
