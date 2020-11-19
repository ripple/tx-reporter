const { nameOfAmendmentID } = require('../services/amendments')

const asyncMessage = async (data) => {
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
    const amendmentName = await nameOfAmendmentID(data.transaction.Amendment);

    // Amendment got majority
    if (data.transaction.Flags === 65536) {
        message += 'Amendment `' + amendmentName + '` got majority on Mainnet. (`tfGotMajority`) If majority holds, will activate in about 2 weeks. Make sure we are voting in favor of it on Testnet!\n\nPseudo-transaction details:\n```\n'
    }

    // Amendment lost majority
    if (data.transaction.Flags === 131072) {
        message += 'Amendment `' + amendmentName + '` LOST majority on Mainnet. (`tfLostMajority`) Make sure we are vetoing it on Testnet!\n\nPseudo-transaction details:\n```\n'
    }

    // Amendment activated
    if (!data.transaction.Flags) {
        message += 'Amendment `' + amendmentName + '` activated on Mainnet. Make sure we are voting in favor of it on Testnet!\n\nPseudo-transaction details:\n```\n'
    }

    message += JSON.stringify(data.transaction, null, '  ')
    message += '\n```'
    return message;
};
  
exports.asyncMessage = asyncMessage;

