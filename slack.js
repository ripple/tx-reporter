const webhookUri = process.env['WEBHOOK_URI']

let slack

if (webhookUri) {
  const Slack = require('slack-node')
  slack = new Slack();
  slack.setWebhook(webhookUri)
} else {
  slack = {
    webhook: (object, callback) => {
      console.log('slack.webhook:', object.text)
      callback(null, 'ok')
    }
  }
}

module.exports = slack
