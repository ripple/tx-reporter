# XRPL Transaction Reporter

Reports XRP Ledger transactions to Slack

## Usage

````
npm install
RIPPLED_URI=wss://s1.ripple.com:51233 WEBHOOK_URI=<your-slack-webhook-uri> npm start
````

If `WEBHOOK_URI` is not set, tx-reporter will just log to stdout.
