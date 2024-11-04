'use strict';
const zmq = require('zeromq');
const filename = process.argv[2];

async function run() {
	// create zmq requester instance
	const requester = new zmq.Request();

	// connect to tcp socket
	requester.connect('tcp://127.0.0.1:60401');

	// send data and since its a promise you need to use await
	console.log(`Sending a request for ${filename}`);
	await requester.send(JSON.stringify({ path: filename }));
	//handle replies after send promise is resolved
	const [result] = await requester.receive();
	console.log(JSON.parse(result));
}

run();
