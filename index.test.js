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

  it('includes the TicketCount in the report', async () => {
    const tx = {
      engine_result: "tesSUCCESS",
      engine_result_code: 0,
      engine_result_message: "The transaction was applied. Only final in a validated ledger.",
      ledger_hash: "5C314B90AE08E0A814745DF0ADCE330A1ACD1710F25B8CC2F2DB06E99911C159",
      ledger_index: 42,
      meta: {
        AffectedNodes: [],
        TransactionIndex: 0,
        TransactionResult: "tesSUCCESS"
      },
      status: "closed",
      transaction: {
        Account: "rP1TMyJHp5QceDoh9MdxLhYaJL2yCwPom",
        Fee: "12",
        Flags: 2147483648,
        LastLedgerSequence: 52,
        Sequence: 95,
        SigningPubKey: "03A3D6C689BDB3B65BED054E06BFC2DA6B43FD45C0CA8D1C7322AC4FAD9D4E37BB",
        TicketCount: 1,
        TransactionType: "TicketCreate",
        TxnSignature: "3045022100B7F4ACCE8FFCC9C371ED2204A0010F04CD400879D62FD205400F5D6E64CDE64E0220557722C642398362CC8ED27B4FF73217C19C5F7FE4CF640FB8430F907A5226B3",
        date: 659105440,
        hash: "8AEEF8F62E29DC7E1A991816F1F88844E0F5A377299453FD882F7AB6BD7D0C2C"
      },
      type: "transaction",
      validated: true
    }
    await handleMessage(JSON.stringify(tx))
    expect(consoleOutput).toEqual(expect.arrayContaining([
      'slack.webhook:',
      expect.stringContaining("Account rP1TMyJHp5QceDoh9MdxLhYaJL2yCwPom just created 1 new Ticket(s)\nTransaction Hash: 8AEEF8F62E29DC7E1A991816F1F88844E0F5A377299453FD882F7AB6BD7D0C2C")
    ]))
  })

  it('generates a correct message when a TicketSequence is used', async () => {
    const tx = {
      "engine_result": "tesSUCCESS",
      "engine_result_code": 0,
      "engine_result_message": "The transaction was applied. Only final in a validated ledger.",
      "ledger_hash": "B3F13D3B8C7F157BF492D75ED992B1BBE78167BEE388B54F71C1419BC017E0D7",
      "ledger_index": 59,
      "meta": {
        "AffectedNodes": [],
        "TransactionIndex": 1,
        "TransactionResult": "tesSUCCESS",
        "delivered_amount": "10000"
      },
      "status": "closed",
      "transaction": {
        "Account": "rP1TMyJHp5QceDoh9MdxLhYaJL2yCwPom",
        "Amount": "10000",
        "Destination": "rEwWzvekJ6nLYZB1UBKFFrxCj9TpqXGG1F",
        "Fee": "12",
        "Flags": 2147483648,
        "LastLedgerSequence": 63,
        "Sequence": 0,
        "SigningPubKey": "03A3D6C689BDB3B65BED054E06BFC2DA6B43FD45C0CA8D1C7322AC4FAD9D4E37BB",
        "TicketSequence": 121,
        "TransactionType": "Payment",
        "TxnSignature": "30440220108DFE5846EA675990DFFD6BA4634C785A7C88C2AB840F546A5137BE39F1C408022029B95DDBCD94BF1B38FE1DB9CD337868618E4DE8B3674B5DAD89BB38969900A4",
        "date": 659116490,
        "hash": "B3DB0A523163AC950651790652C65351D9E87853202919292E34EC9DF55C4F50"
      },
      "type": "transaction",
      "validated": true
    }
    await handleMessage(JSON.stringify(tx))
    expect(consoleOutput).toEqual(expect.arrayContaining([
      'slack.webhook:',
      expect.stringContaining("Transaction `B3DB0A523163AC950651790652C65351D9E87853202919292E34EC9DF55C4F50` has used a TicketSequence (121).")
    ]))
  })
})
