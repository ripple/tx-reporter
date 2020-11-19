const message = (data) => {
    let message = `Transaction \`${data.transaction.hash}\` has used a TicketSequence (${data.transaction.TicketSequence}).`;
    return message;
};
  
exports.message = message;
