const { MessageEmbed, WebhookClient } = require('discord.js');
const ticketSchema = require('../../Models/roplyTicketSchema');
const roplyCustomerRepSchema = require('../../Models/roplyCustomerRep');
const roplyTicketRatingSchema = require('../../Models/roplyTicketRating');

module.exports = {
    name: 'end',
    async execute(message, args, client) {

        const sleep = delay => new Promise(res => setTimeout(res, delay));

        if (!args.length) {
            return message.reply("Invalid command.\nHave you tried `!end rate` or `!end none`?")
        }

        if (args[0].toLowerCase() === "rate") {

            const fetchCustomerRep = await roplyCustomerRepSchema.findOne({ customerRepId: message.author.id });
            const customerRepWebhookURL = new WebhookClient({ url: `${fetchCustomerRep.webhookURL}` });

            const supportChannelId = message.channel.id;
            const fetchTicketInfo = await ticketSchema.findOne({ ticketChannelId: supportChannelId });
            const fetchUser = await message.client.users.cache.get(fetchTicketInfo.userId)

            const ticketCount = fetchTicketInfo.ticketId;
            const ticketType = fetchTicketInfo.ticketType;

            const roplyTicketRatingSchemaDoc = await new roplyTicketRatingSchema({ ticketCount: fetchTicketInfo.ticketId, ticketChannelId: message.channel.id, userRating: "User hasn't given a rating yet.", repSummary: "Customer Representative hasn't given a summary yet." });
            await roplyTicketRatingSchemaDoc.save();

            // .then(async (usr) => {

            const ratingEmbed = new MessageEmbed()
                .setTitle("👋 | Hey there!")
                .setDescription(`**Would you please rate us?**\nFrom 1-5, please rate us one being the worst and 5 being the best support you have had.`)
                .setColor("#36DF14")
                .setFooter({ text: "This prompt will end in 5 minutes." })

            const repSummaryEmbed = new MessageEmbed()
                .setTitle("Time for a ticket summary!")
                .setDescription("Please explain what actions you took in this ticket:")
                .setColor("BLUE")

            const member = message.guild.members.cache.get(fetchTicketInfo.userId);

            message.channel.permissionOverwrites.edit(member, {
                deny: ["VIEW_CHANNEL"]
            })


            const ratingMsg = await fetchUser.send({ embeds: [ratingEmbed] });
            await ratingMsg.react("1️⃣");
            await ratingMsg.react("2️⃣");
            await ratingMsg.react("3️⃣");
            await ratingMsg.react("4️⃣");
            await ratingMsg.react("5️⃣");

            const filter = (reaction, user) => reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣' || reaction.emoji.name === '3️⃣' || reaction.emoji.name === '4️⃣' || reaction.emoji.name === '5️⃣' && user.id !== '940957075507384331';

            ratingMsg.awaitReactions({ filter, max: 1 })
                .then(async collected => {

                    await collected.first().message.channel.send(`${collected.first().emoji.name} | Thank you for your feedback. `)
                    console.log(collected.first().emoji.name);

                    await roplyTicketRatingSchema.findOneAndUpdate({ ticketChannelId: message.channel.id }, { userRating: `${collected.first().emoji.name}` });

                    const userRatingEmbed = new MessageEmbed()
                        .setTitle("✅ | User rating has been collected.")
                        .setDescription(`User ${fetchUser} rated: ${collected.first().emoji.name}`)
                        .setColor("#2F3136")

                    await message.channel.send({ embeds: [userRatingEmbed] });

                    const awaitingRepSummarySent = await message.channel.send({ embeds: [repSummaryEmbed] });

                    const msgFilter1 = m1 => m1.author.id === message.author.id && m2.author.id !== "940957075507384331";

                    awaitingRepSummarySent.channel.awaitMessages({ msgFilter1, max: 1, time: 5 * 60000 })
                        .then(async collectedContent => {

                            const collectedSummary = collectedContent.first().content;

                            await roplyTicketRatingSchema.findOneAndUpdate({ ticketChannelId: message.channel.id }, { repSummary: `${collectedSummary}` });

                            const userRatingEmbed = new MessageEmbed()
                                .setTitle("✅ | Customer Representative Summary has been collected.")
                                .setDescription(`User ${message.author} has given a summary:\n> *${collectedSummary}*`)
                                .setColor("#2F3136")
                                .setFooter({ text: "Summary will be sent to the CR's corresponding channel once a rating has been collected from the ticket creator." })

                            await message.channel.send({ embeds: [userRatingEmbed] });


                            const fetchFromDBEndRate = await roplyTicketRatingSchema.findOne({ ticketChannelId: message.channel.id });

                            const summaryRatingCopyEmbed = new MessageEmbed()
                                .setTitle(`Ticket Summary for #${ticketCount}`)
                                .addFields(
                                    { name: "Type", value: `${ticketType}`, inline: false },
                                    { name: "Actions taken", value: `${fetchFromDBEndRate.repSummary}`, inline: false },
                                    { name: "Rating", value: `${fetchFromDBEndRate.userRating}`, inline: false }
                                )
                                .setColor("#2F3136")

                            
                                await message.channel.send({ content: "Summary completed. Here is a copy:", embeds: [summaryRatingCopyEmbed] });
                                await customerRepWebhookURL.send({ embeds: [summaryRatingCopyEmbed] });
                                await message.channel.send("Summary sent. This ticket will close in `10` seconds.");
            
                                await roplyTicketRatingSchema.findOneAndDelete({ ticketChannelId: message.channel.id});

                                await sleep(10 * 1000);
            
                                message.channel.delete();

                        })

                }).catch(console.error);



        } else if (args[0].toLowerCase() === "none") {


            const fetchTicketChannel = await ticketSchema.findOne({ ticketChannelId: message.channel.id });
            const member = message.guild.members.cache.get(fetchTicketChannel.userId);

            message.channel.permissionOverwrites.edit(member, {
                deny: ["VIEW_CHANNEL"]
            })

            const ticketSummaryEmbed = new MessageEmbed()
                .setTitle("Time for a ticket summary!")
                .setDescription("Please explain what actions you took in this ticket:")
                .setColor("BLUE")

            const msgFilter2 = m2 => m2.author.id === message.author.id && m2.author.id !== "940957075507384331";

            const ticketSummaryEmbedSent = await message.channel.send({ embeds: [ticketSummaryEmbed] });
            ticketSummaryEmbedSent.channel.awaitMessages({ msgFilter2, max: 1 })
                .then(async collected2 => {
                    const ticketCount = fetchTicketChannel.ticketId;
                    const ticketType = fetchTicketChannel.ticketType;

                    const fetchCustomerRep = await roplyCustomerRepSchema.findOne({ customerRepId: message.author.id });
                    const customerRepWebhookURL = new WebhookClient({ url: `${fetchCustomerRep.webhookURL}` });

                    const summaryCopyEmbed = new MessageEmbed()
                        .setTitle(`Ticket Summary for #${ticketCount}`)
                        .addFields(
                            { name: "Type", value: `${ticketType}`, inline: false },
                            { name: "Actions taken", value: `${collected2.first().content}`, inline: false },
                            { name: "Rating", value: `Ticket creator was not prompted for a rating.`, inline: false }
                        )
                        .setColor("#2F3136")

                    await ticketSummaryEmbedSent.channel.send({ content: "Summary completed. Here is a copy:", embeds: [summaryCopyEmbed] });
                    await customerRepWebhookURL.send({ embeds: [summaryCopyEmbed] });
                    await ticketSummaryEmbedSent.channel.send("Summary sent. This ticket will close in `10` seconds.");

                    await sleep(10 * 1000);

                    ticketSummaryEmbedSent.channel.delete();

                })


        } else {
            return message.reply("Invalid command.\nHave you tried `!end rate` or `!end none`?")
        }

    }
}