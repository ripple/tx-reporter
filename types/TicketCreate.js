const message = (data) => {
    // Example:
    // {
    //     "TransactionType": "TicketCreate",
    //     "Account": "rP1TMyJHp5QceDoh9MdxLhYaJL2yCwPom",
    //     "TicketCount": 1,
    //     "Flags": 2147483648,
    //     "LastLedgerSequence": 32,
    //     "Fee": "12",
    //     "Sequence": 73,
    //     "SigningPubKey": "03A3D6C689BDB3B65BED054E06BFC2DA6B43FD45C0CA8D1C7322AC4FAD9D4E37BB"
    // }
    let message = `Account ${data.transaction.Account} just created ${data.transaction.TicketCount} new Ticket(s)\nTransaction Hash: ${data.transaction.hash}`;
    return message;
};
  
exports.message = message;
