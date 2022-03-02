const ticketSchema = require('../../Models/roplyTicketSchema');
const { MessageEmbed, WebhookClient } = require('discord.js');
const { pendingTicketsCategoryId, claimedTicketsCategoryId, brokenTicketsCategoryId } = require('../../config.json');

module.exports = {
    name: 'force',
    async execute(message, args) {



        if (message.channel.type === "GUILD_CATEGORY" && message.channel.parentId === pendingTicketsCategoryId || message.channel.parentId === claimedTicketsCategoryId || message.channel.parentId === brokenTicketsCategoryId) {

            if (!args.length) return message.reply("Did you mean `!force claim` or `!force close`?")

            if (args[0].toLowerCase() === "claim") {
                await message.channel.setParent(claimedTicketsCategoryId, { lockPermissions: false });

                await ticketSchema.findOneAndUpdate({ ticketChannelId: message.channel.id }, { isClaimed: true });
                await ticketSchema.findOneAndUpdate({ ticketChannelId: message.channel.id }, { claimedBy: `${message.author.id}` });


                const ticketClaimed = new MessageEmbed()
                    .setTitle("Support has arrived!")
                    .setDescription(`${message.author} has claimed this ticket.`)
                    .setColor("GREEN")

                return message.channel.send({ embeds: [ticketClaimed] });

            }

            if (args[0].toLowerCase() === "close") {

                const webhookURL = new WebhookClient({ url: "https://discord.com/api/webhooks/942447569982861343/MCq-3M-8WAHtpj1aqw9OjB9I93zicZCad86Zs5KMGXOF-BFRpWWW30NIVDYoTydU9uvH" });

                const whoClosedEmbed = new MessageEmbed()
                    .setTitle("Ticket Forcibly Closed")
                    .setDescription(`**Ticket:** ${message.channel.name}\n**Closed by:** ${message.author.tag}\n**Closed at:** <t:${parseInt(Date.now() / 1000)}>`)
                    .setColor("RED")

                await webhookURL.send({ embeds: [whoClosedEmbed] });

                return message.channel.delete();


            }

            else {
                return message.reply("Did you mean `!force claim` or `!force close`?")
            }

        } else {
            return;
        }
    }
}