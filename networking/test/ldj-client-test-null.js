'use strict';
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const LDJClient = require('../lib/ldj-client-multiple-messages.js');

describe('LDJClient', () => {
	let stream = null;
	let client = null;

	beforeEach(() => {
		stream = new EventEmitter();
	});

	it('should emit an error if the LDJClient is null', done => {
		//console.log(assert.throws(client = new LDJClient(null)));

		assert.doesNotThrow(() => {
			client = new LDJClient(stream);
			console.log(client);
		}, Error)
		done();
	});
})
