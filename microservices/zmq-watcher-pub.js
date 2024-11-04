'use strict';

const fs = require('fs');
const zmq = require('zeromq');
const filename = process.argv[2];

// create the publisher endpoint.

const publisher = new zmq.Publisher();

fs.watch(filename, () => {
	//send a message to any and all subscribers.
	console.log('change');
	publisher.send(JSON.stringify({
		type: 'changed',
		file: filename,
		timestamp: Date.now()
	}));
});


//Listen to TCP port 60400.
publisher.bind('tcp://*:60400');
console.log('Listening for zmq subscribers...');
