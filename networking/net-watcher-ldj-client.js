'use strict';
const netClient = require('net').connect({ port: 60300 });
const ldjClient = require('./lib/ldj-client.js').connect(netClient);
ldjClient.on('message', message => {
	console.log(message);
});

ldjClient.on('close', message => {
	console.log('close message', message);
})
