'use strict';
const server = require('net').createServer(connection => {
	console.log('Subscriber connected.');
	// Two message chunks that together make a whole message.
	const firstChunk = '{"foo1": ';
	const secondChunk = '"bar"}';
	// Send the first chunk immediately.
	connection.write(firstChunk);
	process.nextTick(() => {
		connection.write(secondChunk);
		connection.end();
	})
	// After a short delay, send the other chunk.
	//const timer = setTimeout(() => {
	//	connection.write(secondChunk);
	//	connection.end();
	//	}, 3000);
	// Clear timer when the connection ends.
	connection.on('end', () => {
		//		clearTimeout(timer);
		console.log('Subscriber disconnected.');
	});
});

server.listen(60300, function() {
	console.log('Test server listening for subscribers...');
});
