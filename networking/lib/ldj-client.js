'use strict';
const EventEmitter = require('events').EventEmitter;
class LDJClient extends EventEmitter {
	constructor(stream) {
		super();
		let buffer = '';
		stream.on('data', data => {
			buffer += data;
		});

		stream.on('close', signal => {
			this.emit('close', JSON.parse(buffer));
			buffer = '';
			console.log(signal);
		})
	}
	static connect(stream) {
		return new LDJClient(stream);
	}
}
module.exports = LDJClient;
