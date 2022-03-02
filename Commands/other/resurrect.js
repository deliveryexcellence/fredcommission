const { MessageEmbed } = require("discord.js");
const { pendingTicketsCategoryId, claimedTicketsCategoryId, brokenTicketsCategoryId } = require('../../config.json');

module.exports = {
    name: 'resurrect',
    async execute(message, args) {

        const channelToResurrect = message.channel;

        await channelToResurrect.setParent(pendingTicketsCategoryId, { lockPermissions: false });

        const resurrectedEmbed = new MessageEmbed()
            .setTitle("Ticket Resurrected")
            .setDescription(`This ticket has been successfully resurrected by ${message.author}.`)
            .setColor("AQUA")

        return message.channel.send({ embeds: [resurrectedEmbed] });

    }
}