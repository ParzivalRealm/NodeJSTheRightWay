'use strict';
const zmq = require('zeromq');

//create subscriber endpoint
async function run() {
	const subscriber = new zmq.Subscriber();
	// connect to publisher
	subscriber.connect("tcp://localhost:60400");
	//subscribe to all messages
	subscriber.subscribe();
	// handle messages from the publisher.
	console.log('subscriber connected', subscriber);

	for await (const [msg] of subscriber) {
		const message = JSON.parse(msg);
		const date = new Date(message.timestamp);
		console.log(`file "${message.file}" changed at ${date}`);
	}
}
run()
