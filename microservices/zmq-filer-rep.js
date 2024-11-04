'use strict';
const fs = require('fs');
const zmq = require('zeromq');

async function run() {


	//socket to reply to client requests.
	const responder = new zmq.Reply();

	// listen to port 60401
	await responder.bind('tcp://127.0.0.1:60401');
	console.log('responder created', responder);

	// Close the responder when the Node process ends.
	process.on('SIGINT', () => {
		console.log('shutting down...');
		responder.close();
	});

	//handle incoming requests using for await func from zeromq
	for await (const [data] of responder) {
		//parse the incoming message
		const request = JSON.parse(data)

		console.log(`received request to get: ${request.path}`);
		//read the file and reply with content.
		await fs.readFile(request.path, (err, content) => {
			console.log('sending response content.');
			responder.send(JSON.stringify({
				content: data.toString(),
				timestamp: Date.now(),
				pid: process.pid

			}));
		})
	}


}
run();
