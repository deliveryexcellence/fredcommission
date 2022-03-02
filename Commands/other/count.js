const currentTicketCountSchema = require('../../Models/roplyCurrentTicketCount');

module.exports = {
    name: 'count',
    async execute(message, args) {

        const currentTicketCountSchemaDoc = await new currentTicketCountSchema({ key: "roply", currentTicketCount: 0 });
        await currentTicketCountSchemaDoc.save();

        return message.react("✅");

    }
}