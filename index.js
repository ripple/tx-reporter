'use strict';

const WebSocket = require('ws');
var Slack = require('slack-node');
 
const webhookUri = process.env['WEBHOOK_URI']
const rippledUri = process.env['RIPPLED_URI']

var slack = new Slack();
slack.setWebhook(webhookUri);

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

  ws.on('message', function(dataString) {
    const data = JSON.parse(dataString);

    if (data.type === 'transaction') {
      if (data.transaction.TransactionType === 'EnableAmendment') {
        console.log(data.transaction)

        var message = '`' + data.transaction.TransactionType + '`\n```\n'
        message += JSON.stringify(data.transaction, null, '  ')
        message += '\n```'
        messageSlack(message)
      }

      if (ledger < data.ledger_index) {
        ledger = data.ledger_index
        console.log(ledger)
      }
    } else {
      console.log(data);
    }
  });
}

subscribe(rippledUri);

const interval = setInterval(function ping() {
  if (ws.isAlive === false) {
    console.log('reconnect')
    ws.terminate();
    subscribe(rippledUri);
  }

  ws.isAlive = false;
  ws.ping('', true, true);
}, 5000);
