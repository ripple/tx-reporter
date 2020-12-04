'use strict';

const WebSocket = require('ws')
const slack = require('./slack')
const { types } = require('./types')

const rippledUri = process.env['RIPPLED_URI']

function messageSlack (message) {
  slack.webhook({
    text: message
  }, function(err, response) {
    if (err)
      console.log(err)
  });
}

var ledger = 0
var ws

function subscribe(ip) {

  console.log('subscribing to', ip)
  ws = new WebSocket(ip);

  ws.on('error', function(error) {
    ws.close();
    console.log('error')
    console.log(error)
  });

  ws.on('close', function(error) {
    console.log('close error')
    console.log(error)
  });

  function heartbeat() {
    this.isAlive = true;
  }

  ws.on('open', function() {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.send(JSON.stringify({
      id: 1,
      command: 'subscribe',
      streams: [
        'transactions'
      ]
    }), function (error) {
      if (error) {
        console.log('send error')
        console.log(error)
      }
    });
  });

  ws.on('message', handleMessage);
}

if (rippledUri) {
  subscribe(rippledUri);

  setInterval(function ping() {
    if (ws.isAlive === false) {
      console.log('reconnect')
      ws.terminate();
      subscribe(rippledUri);
    }

    ws.isAlive = false;
    ws.ping('', true, true);
  }, 5000);
}

async function handleMessage(dataString) {
  const data = JSON.parse(dataString);
  if (data.type === 'transaction') {
    switch (data.transaction.TransactionType) {
      case 'EnableAmendment':
        messageSlack(await types.enableAmendment.asyncMessage(data));
        break;
      case 'TicketCreate':
        messageSlack(types.ticketCreate.message(data));
        break;
      default:
        // 
    }

    if (data.transaction.TicketSequence) messageSlack(types.transactionWithTicket.message(data));
    
    if (ledger < data.ledger_index) {
      ledger = data.ledger_index
      console.log(ledger)
    }
  } else {
    console.log(data);
  }
}

module.exports = {
  handleMessage
}
