'use strict';

const WebSocket = require('ws')
const slack = require('./slack')
const { nameOfAmendmentID } = require('./amendments')

const rippledUri = processnpmv['RIPPLED_URI']

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
    if (data.transaction.TransactionType === 'EnableAmendment') {
      console.log(data.transaction)
      // Example:
      // {
      //   "Account": "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
      //   "Amendment": "89308AF3B8B10B7192C4E613E1D2E4D9BA64B2EE2D5232402AE82A6A7220D953",
      //   "Fee": "0",
      //   "LedgerSequence": 5707521,
      //   "Sequence": 0,
      //   "SigningPubKey": "",
      //   "TransactionType": "EnableAmendment",
      //   "date": 638396422,
      //   "hash": "BDE80A017E902A1341009A595EF596C059315349C2DAE845AAD572A07C6F431A"
      // }

      let message = '';

      // Amendment got majority
      if (data.transaction.Flags === 65536) {
        message += 'Amendment `' + (await nameOfAmendmentID(data.transaction.Amendment)) + '` got majority on Mainnet. (`tfGotMajority`) If majority holds, will activate in about 2 weeks. Make sure we are voting in favor of it on Testnet!\n\nPseudo-transaction details:\n```\n'
      }

      // Amendment lost majority
      if (data.transaction.Flags === 131072) {
        message += 'Amendment `' + (await nameOfAmendmentID(data.transaction.Amendment)) + '` LOST majority on Mainnet. (`tfLostMajority`) Make sure we are vetoing it on Testnet!\n\nPseudo-transaction details:\n```\n'
      }

      // Amendment activated
      if (!data.transaction.Flags) {
        message += 'Amendment `' + (await nameOfAmendmentID(data.transaction.Amendment)) + '` activated on Mainnet. Make sure we are voting in favor of it on Testnet!\n\nPseudo-transaction details:\n```\n'
      }

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
}

module.exports = {
  handleMessage
}
