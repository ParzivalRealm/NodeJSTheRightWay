'use strict';
const EventEmitter = require('events').EventEmitter;

class LDJClientNull extends EventEmitter {
	constructor(stream) {
		super();
		try {
			stream.on('data', data => {
				this.emit('message', JSON.parse(data));
			});
		}
		catch {
			throw new Error('wrong or null stream');
		}

	}
}

module.exports = LDJClientNull;
