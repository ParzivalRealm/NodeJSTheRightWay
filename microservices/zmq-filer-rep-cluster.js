'use strict';
const cluster = require('cluster');
const fs = require('fs');
const zmq = require('zeromq');

const numWorkers = require('os').cpus().length;

async function run() {
  // master process creates ROUTER and DEALER sockets and binds endpoints.

  if (cluster.isMaster) {
    const router = new zmq.Router();
    const dealer = new zmq.Dealer();

    await router.bind('tcp://127.0.0.1:60401');
    await dealer.bind('ipc://filer-dealer.ipc');

    // listen for workers to come online.
    cluster.on('online',
      worker => console.log(`worker ${worker.process.pid} is online. `));

    // fork a worker process for each CPU.

    for (let i = 0; i < numWorkers; i++) {
      console.log('creating forks');
      cluster.fork();
      console.log('forks created');
    }


    //forward messages between the roudet and dealer.

    for await (const [msg] of router) {
      console.log('dealer sending msg from router', msg);
      await dealer.send(msg);
      console.log('waiting msg of router');
      console.log(msg);
    }
    console.log('going for dealer loop');
    for await (const [msg1] of dealer) {
      console.log('router sending msg from dealer', msg1);
      await router.send(msg1);
      console.log('waiting msg of dealer');
      console.log(msg1);
    }


  } else {
    // Worker processes create a REP socket and connect to the DEALER.

    const responder = new zmq.Reply();

    await responder.connect('ipc://filer-dealer.ipc');

    for await (const [msg] of responder) {
      // parse incoming message
      const request = JSON.parse(msg);
      console.log(`${process.pid} received request for: ${request.path}`)

      // read the file and reply with content
      fs.readFile(request.path, (err, content) => {
        console.log(`${process.pid} sending response`);
        responder.send(JSON.stringify({
          content: content.toString(),
          timestamp: Date.now(),
          pid: process.pid
        }));
      });
    }
  }
}
run().catch(err => console.error('Main process error:', err));
