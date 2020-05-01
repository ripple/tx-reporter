const { handleMessage } = require('./index')

const originalLog = console.log

describe('handleMessage', () => {
  let consoleOutput

  beforeEach(() => {
    consoleOutput = []
    console.log = (...output) => consoleOutput.push(...output)
  })

  afterEach(() => console.log = originalLog)

  it('logs the data if it is not a transaction', () => {
    handleMessage('{"foo": "bar"}')
    expect(consoleOutput).toEqual([{foo: 'bar'}])
  })

  it.todo('logs a transaction')

  it.todo('reports when an amendment gets majority')

  it.todo('reports when an amendment loses majority')

  it.todo('reports when an amendment is activated')

  it.todo('logs a new ledger')

  it.todo('does not log an old ledger')

  it('includes the amendment name in the report', async () => {
    const tx = {
      "type": "transaction",
      "transaction": {
        "TransactionType": "EnableAmendment",
        "Amendment": "89308AF3B8B10B7192C4E613E1D2E4D9BA64B2EE2D5232402AE82A6A7220D953"
      }
    }
    await handleMessage(JSON.stringify(tx))
    expect(consoleOutput).toEqual(expect.arrayContaining([
      {
        "Amendment": "89308AF3B8B10B7192C4E613E1D2E4D9BA64B2EE2D5232402AE82A6A7220D953",
        "TransactionType": "EnableAmendment",
      },
      'slack.webhook:',
      expect.stringContaining("Amendment `fixQualityUpperBound` activated on Mainnet. Make sure we are voting in favor of it on Testnet!")
    ]))
  })
})
