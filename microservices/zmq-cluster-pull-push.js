'use strict';
const cluster = require('cluster');
const zmq = require('zeromq');

const numWorkers = require('os').cpus().length;
let readyCounter = 0;
console.log('previous run');
async function run() {
  console.log('started run');
  // creates promise that resolves when readyCounter hits target

  async function messageHandler(msg) {
    switch (msg.type) {
      case 'ready':
        readyCounter += 1;
        break;
      case 'disconnect':
        readyCounter -= 1;
        break;
      case 'job':
        try {
          await workerPusher.send(JSON.stringify({
            type: 'result',
            content: 'hello from job dog',
            id: cluster.worker.id
          }));
        } catch {
          console.log('job message received without existing workerPusher instance');
        }
        break;
      case 'result':
        console.log(`its me dog, result from ${msg.id}`);
    }
  }
  // initialize pull and push sockets and bind thems to an ip 
  if (cluster.isPrimary) {
    const masterPusher = new zmq.Push();
    const masterPuller = new zmq.Pull();
    await masterPusher.bind("ipc://msg-pusher.ipc");
    await masterPuller.bind('ipc://msg-puller.ipc');

    // Create workers 
    for (let index = 0; index < numWorkers; index++) {
      cluster.fork();
      console.log(`worker ${index} created`);
    }

    async function waitForWorkers(targetCount) {
      return new Promise((resolve) => {
        // solves inmediattely if condition true
        if (readyCounter >= targetCount) {
          resolve();
          return;
        }
        while (readyCounter <= targetCount) {
          console.log('waiting for ready messages');
        }

        resolve();
        // adds listener to check when workers come online
      });
    }
    // wait for 3 workers send ready msg
    await waitForWorkers(3);
    console.log('all workers ready!');

    for (let i = 0; i < 30; i++) {
      try {
        masterPusher.send(JSON.stringify({ type: 'job', msgNo: i, msg: `im pushing for ${i} time` }));
      } catch {
        console.log(`error sending msg from MasterPusher at i: ${i}`);
      }
    }

    for await (const [msg] of masterPuller) {
      messageHandler(msg);
    }
  } else {
    const workerPusher = new zmq.Push();
    const workerPuller = new zmq.Pull();
    await workerPusher.connect('ipc://msg-puller.ipc');
    await workerPuller.connect('ipc://msg-pusher.ipc');

    for await (const [msg] of workerPuller) {
      messageHandler(msg);
    }

    workerPusher.on('disconnect', messageHandler)
    try {
      await workerPusher.send(JSON.stringify({
        type: 'ready',
        content: 'im ready',
        id: cluster.worker.id
      }));
    } catch {
      console.log('error while trying to send ready message');
    }
  }
}
run().catch(err => console.error('Main process error:', err));
