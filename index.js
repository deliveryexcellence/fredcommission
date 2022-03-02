const ticketSchema = require('./Models/roplyTicketSchema');
const currentTicketCountSchema = require('./Models/roplyCurrentTicketCount');
const roplyCustomerRepSchema = require('./Models/roplyCustomerRep');

const { pendingTicketsCategoryId, claimedTicketsCategoryId, brokenTicketsCategoryId, clientId, roleId } = require('./config.json');

const fs = require('fs');
const mongoose = require('mongoose')
const Discord = require('discord.js');
const { Client, Collection, Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const { message } = require('noblox.js');
const client = new Client({
    intents:
        [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        ],
    partials:
        [
            'MESSAGE',
            'CHANNEL',
            'REACTION',
        ]
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    if (reaction.emoji.name === "🐛" || reaction.emoji.name === "❓" || reaction.emoji.name === "❔" && reaction.message.channel.id === "927315784886288465") {

        await reaction.users.remove(user.id);

        const sleep = delay => new Promise(res => setTimeout(res, delay));

        const member = reaction.message.channel.guild.members.cache.get(user.id)
        const currentNumberSchemaFetch = await currentTicketCountSchema.findOne({ key: "roply" });
        let currentTicketNumber = currentNumberSchemaFetch.currentTicketCount;
        let newTicketNumber = parseInt(parseInt(currentTicketNumber) + 1);
        await currentTicketCountSchema.findOneAndUpdate({ key: "roply" }, { currentTicketCount: parseInt(newTicketNumber) });

        const msgFilter = m => m.author.id !== clientId;

        const supportSoonEmbed = new MessageEmbed()
            .setTitle("1/ Creation of a support ticket.")
            .setDescription("Please provide a complete description to support.\n\n**Did you inadvertently create the ticket?**\nDo nothing for 5 minutes, and the ticket will close automatically!")
            .setFooter({ text: "This ticket will automatically close in 5 minutes if there is no response." })
            .setColor("YELLOW")

        const agentSoonEmbed = new MessageEmbed()
            .setTitle("2:) Alright, you'll have an agent shortly!")
            .setDescription("You're in our queue, it shouldn't take long to get support. Once your agent has arrived, you will be pinged, and a notification will be created in the channel. Please do not ping any staff during this process.")
            .setColor("GREEN")

        if (reaction.emoji.name === "🐛") {
            const pendingTicketsChannel = reaction.message.channel.guild.channels.cache.get(pendingTicketsCategoryId);
            const ticketsChannel = reaction.message.channel.guild.channels.cache.get(claimedTicketsCategoryId);

            const bugReportChannel = await pendingTicketsChannel.createChannel(`bug-report-${currentTicketNumber}`, {
                type: 'GUILD_TEXT',
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "EMBED_LINKS"],
                        deny: ["USE_APPLICATION_COMMANDS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS"]
                    },
                    {
                        id: reaction.message.channel.guild.id,
                        deny: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                    },
                ],
            });

            const ticketSchemaDoc = await new ticketSchema({ userId: user.id, ticketId: currentTicketNumber, ticketChannelId: bugReportChannel.id, ticketType: "Bug Report", isClaimed: false, claimedBy: `Ticket not claimed yet!` });
            await ticketSchemaDoc.save();

            await bugReportChannel.send({ content: `${user}`, embeds: [supportSoonEmbed] }).catch(console.error);


            bugReportChannel.awaitMessages({ msgFilter, max: 1, time: 5 * 60000, errors: ['time'] })
                .then(async collected => {
                    collected.first().channel.send({ embeds: [agentSoonEmbed] });

                    const fetchOnShiftCRs = await roplyCustomerRepSchema.find({ onShift: true }, { customerRepId: 1 });

                    const noCREmbed = new MessageEmbed()
                        .setTitle("Don't worry!")
                        .setDescription("Your CR will be with you shortly.\nWe apologize for the wait. You do not need to create a new ticket!")
                        .setColor("#2F3136")

                    if (fetchOnShiftCRs.length === 0) {
                        await bugReportChannel.setParent(brokenTicketsCategoryId, { lockPermissions: false })
                        return bugReportChannel.send({ content: `<@&${roleId}>`, embeds: [noCREmbed] });
                    }

                    const ticketReadyForClaimEmbed = new MessageEmbed()
                        .setTitle("📬 | Incoming ticket!")
                        .setDescription(`There's a new ticket waiting to be claimed. React with \`👍\` to claim it.\n\n**Ticket type: **Bug report\n**Channel: **${collected.first().channel}`)
                        .setColor("#2F3136")
                        .setFooter({ text: "Ticket will be sent to the broken tickets category, if not claimed within 3 minutes." })


                    for (const i in fetchOnShiftCRs) {
                        const customerRepIdToUser = await collected.first().client.users.cache.get(fetchOnShiftCRs[i].customerRepId);
                        const embedSentToCRMsg = await customerRepIdToUser.send({ embeds: [ticketReadyForClaimEmbed] }).catch(console.error);
                        await embedSentToCRMsg.react("👍")
                        await sleep(300);

                        const reactionClaimFilter = (reaction, user) => {
                            return user.id !== clientId;
                        };

                        const collector = embedSentToCRMsg.createReactionCollector({ reactionClaimFilter, time: 3 * 60000, max: 1 });

                        collector.on('collect', async (reaction, user) => {

                            const fetchCurrentTicket = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });
                            const isClaimed = fetchCurrentTicket.isClaimed;

                            if (isClaimed === true) {
                                const ticketClaimedEmbed = new MessageEmbed()
                                    .setDescription(`:x: | Ticket is already claimed.`)
                                    .setColor("RED")


                                return user.send({ embeds: [ticketClaimedEmbed] }).catch(console.error);
                            }

                            const ticketClaimed = new MessageEmbed()
                                .setTitle("Support has arrived!")
                                .setDescription(`${user} has claimed this ticket.`)
                                .setColor("GREEN")

                            const userClaimedEmbed = new MessageEmbed()
                                .setDescription(`You have successfully claimed this ticket: <#${bugReportChannel.id}>`)
                                .setColor("YELLOW")

                            await ticketSchema.findOneAndUpdate({ ticketChannelId: bugReportChannel.id }, { isClaimed: true });
                            await ticketSchema.findOneAndUpdate({ ticketChannelId: bugReportChannel.id }, { claimedBy: `${user.id}` });

                            user.send({ embeds: [userClaimedEmbed] }).catch(console.error);
                            await bugReportChannel.setParent(claimedTicketsCategoryId, { lockPermissions: false });


                            await sleep(200);
                            await bugReportChannel.send({ embeds: [ticketClaimed] });
                        });

                        collector.on('end', async collected => {

                            let x = 1;

                            do {

                                const fetchCurrentTicketAgain = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });

                                console.log(fetchCurrentTicketAgain.isClaimed);

                                if (fetchCurrentTicketAgain.isClaimed === false) {
                                    await bugReportChannel.setParent(brokenTicketsCategoryId, { lockPermissions: false })

                                    const noCREmbed = new MessageEmbed()
                                        .setTitle("Don't worry!")
                                        .setDescription("Your CR will be with you shortly.\nWe apologize for the wait. You do not need to create a new ticket!")
                                        .setColor("#2F3136")

                                    return bugReportChannel.send({ content: `<@&${roleId}>`, embeds: [noCREmbed] });
                                }

                            } while (x===3)


                        });
                    }

                })
                .catch(() => {
                    bugReportChannel.delete();
                    user.send("Ticket closed due to no response in \`5\` minutes.").catch(console.error);
                });
        }

        if (reaction.emoji.name === "❓") {

            const pendingTicketsChannel = reaction.message.channel.guild.channels.cache.get(pendingTicketsCategoryId);
            const ticketsChannel = reaction.message.channel.guild.channels.cache.get(claimedTicketsCategoryId);

            const bugReportChannel = await pendingTicketsChannel.createChannel(`general-support-${currentTicketNumber}`, {
                type: 'GUILD_TEXT',
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "EMBED_LINKS"],
                        deny: ["USE_APPLICATION_COMMANDS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS"]
                    },
                    {
                        id: reaction.message.channel.guild.id,
                        deny: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                    },
                ],
            });

            const ticketSchemaDoc = await new ticketSchema({ userId: user.id, ticketId: currentTicketNumber, ticketChannelId: bugReportChannel.id, ticketType: "General Support", isClaimed: false, claimedBy: `Ticket not claimed yet!` });
            await ticketSchemaDoc.save();

            await bugReportChannel.send({ content: `${user}`, embeds: [supportSoonEmbed] }).catch(console.error);

            bugReportChannel.awaitMessages({ msgFilter, max: 1, time: 5 * 60000, errors: ['time'] })
                .then(async collected => {
                    collected.first().channel.send({ embeds: [agentSoonEmbed] });

                    const fetchOnShiftCRs = await roplyCustomerRepSchema.find({ onShift: true }, { customerRepId: 1 });

                    const noCREmbed = new MessageEmbed()
                        .setTitle("Don't worry!")
                        .setDescription("Your CR will be with you shortly.\nWe apologize for the wait. You do not need to create a new ticket!")
                        .setColor("#2F3136")

                    if (fetchOnShiftCRs.length === 0) {
                        await bugReportChannel.setParent(brokenTicketsCategoryId, { lockPermissions: false })
                        return bugReportChannel.send({ content: `<@&${roleId}>`, embeds: [noCREmbed] });
                    }

                    const ticketReadyForClaimEmbed = new MessageEmbed()
                        .setTitle("📬 | Incoming ticket!")
                        .setDescription(`There's a new ticket waiting to be claimed. React with \`👍\` to claim it.\n\n**Ticket type: **General Support\n**Channel: **${collected.first().channel}`)
                        .setColor("#2F3136")
                        .setFooter({ text: "Ticket will be sent to the broken tickets category, if not claimed within 3 minutes." })


                    for (const i in fetchOnShiftCRs) {
                        const customerRepIdToUser = await collected.first().client.users.cache.get(fetchOnShiftCRs[i].customerRepId);
                        const embedSentToCRMsg = await customerRepIdToUser.send({ embeds: [ticketReadyForClaimEmbed] }).catch(console.error);
                        await embedSentToCRMsg.react("👍")
                        await sleep(300);

                        const reactionClaimFilter = (reaction, user) => {
                            return user.id !== clientId;
                        };

                        const collector = embedSentToCRMsg.createReactionCollector({ reactionClaimFilter, time: 3 * 60000, max: 1 });

                        collector.on('collect', async (reaction, user) => {

                            const fetchCurrentTicket = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });
                            const isClaimed = fetchCurrentTicket.isClaimed;

                            if (isClaimed === true) {
                                const ticketClaimedEmbed = new MessageEmbed()
                                    .setDescription(`:x: | Ticket is already claimed.`)
                                    .setColor("RED")


                                return user.send({ embeds: [ticketClaimedEmbed] }).catch(console.error);
                            }

                            const ticketClaimed = new MessageEmbed()
                                .setTitle("Support has arrived!")
                                .setDescription(`${user} has claimed this ticket.`)
                                .setColor("GREEN")

                            const userClaimedEmbed = new MessageEmbed()
                                .setDescription(`You have successfully claimed this ticket: <#${bugReportChannel.id}>`)
                                .setColor("YELLOW")


                            await ticketSchema.findOneAndUpdate({ ticketChannelId: bugReportChannel.id }, { isClaimed: true });
                            await ticketSchema.findOneAndUpdate({ ticketChannelId: bugReportChannel.id }, { claimedBy: `${user.id}` });

                            user.send({ embeds: [userClaimedEmbed] }).catch(console.error);
                            await bugReportChannel.setParent(claimedTicketsCategoryId, { lockPermissions: false });



                            await sleep(200);
                            await bugReportChannel.send({ embeds: [ticketClaimed] });
                        });

                        collector.on('end', async collected => {

                            let x = 1;

                            do {

                                const fetchCurrentTicketAgain = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });

                                console.log(fetchCurrentTicketAgain.isClaimed);

                                if (fetchCurrentTicketAgain.isClaimed === false) {
                                    await bugReportChannel.setParent(brokenTicketsCategoryId, { lockPermissions: false })

                                    const noCREmbed = new MessageEmbed()
                                        .setTitle("Don't worry!")
                                        .setDescription("Your CR will be with you shortly.\nWe apologize for the wait. You do not need to create a new ticket!")
                                        .setColor("#2F3136")

                                    return bugReportChannel.send({ content: `<@&${roleId}>`, embeds: [noCREmbed] });
                                }

                            } while (x===3)


                        });
                    }

                })
                .catch(() => {

                    bugReportChannel.delete();
                    user.send("Ticket closed due to no response in \`5\` minutes.").catch(console.error);
                });
        }

        if (reaction.emoji.name === "❔") {

            const pendingTicketsChannel = reaction.message.channel.guild.channels.cache.get(pendingTicketsCategoryId);
            const ticketsChannel = reaction.message.channel.guild.channels.cache.get(claimedTicketsCategoryId);

            const bugReportChannel = await pendingTicketsChannel.createChannel(`partnership-${currentTicketNumber}`, {
                type: 'GUILD_TEXT',
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "EMBED_LINKS"],
                        deny: ["USE_APPLICATION_COMMANDS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS"]
                    },
                    {
                        id: "927322354638524498",
                        allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "EMBED_LINKS"],
                        deny: ["USE_APPLICATION_COMMANDS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS"]
                    },
                    {
                        id: reaction.message.channel.guild.id,
                        deny: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                    },
                ],
            });

            const ticketSchemaDoc = await new ticketSchema({ userId: user.id, ticketId: currentTicketNumber, ticketChannelId: bugReportChannel.id, ticketType: "Partnership", isClaimed: false, claimedBy: `Ticket not claimed yet!` });
            await ticketSchemaDoc.save();

            await bugReportChannel.send({ content: `${user}`, embeds: [supportSoonEmbed] }).catch(console.error);

            bugReportChannel.awaitMessages({ msgFilter, max: 1, time: 5 * 60000, errors: ['time'] })
                .then(async collected => {
                    collected.first().channel.send({ embeds: [agentSoonEmbed] });

                    const fetchOnShiftCRs = await roplyCustomerRepSchema.find({ onShift: true }, { customerRepId: 1 });

                    const noCREmbed = new MessageEmbed()
                        .setTitle("Don't worry!")
                        .setDescription("Your CR will be with you shortly.\nWe apologize for the wait. You do not need to create a new ticket!")
                        .setColor("#2F3136")

                    if (fetchOnShiftCRs.length === 0) {
                        await bugReportChannel.setParent(brokenTicketsCategoryId, { lockPermissions: false })
                        return bugReportChannel.send({ content: `<@&${roleId}>`, embeds: [noCREmbed] });
                    }

                    const ticketReadyForClaimEmbed = new MessageEmbed()
                        .setTitle("📬 | Incoming ticket!")
                        .setDescription(`There's a new ticket waiting to be claimed. React with \`👍\` to claim it.\n\n**Ticket type: **Pertnership Ticket\n**Channel: **${collected.first().channel}`)
                        .setColor("#2F3136")
                        .setFooter({ text: "Ticket will be sent to the broken tickets category, if not claimed within 3 minutes." })


                    for (const i in fetchOnShiftCRs) {
                        const customerRepIdToUser = await collected.first().client.users.cache.get(fetchOnShiftCRs[i].customerRepId);
                        const embedSentToCRMsg = await customerRepIdToUser.send({ embeds: [ticketReadyForClaimEmbed] }).catch(console.error);
                        await embedSentToCRMsg.react("👍")
                        await sleep(300);

                        const reactionClaimFilter = (reaction, user) => {
                            return user.id !== clientId;
                        };

                        const collector = embedSentToCRMsg.createReactionCollector({ reactionClaimFilter, time: 3 * 60000, max: 1 });

                        collector.on('collect', async (reaction, user) => {

                            const fetchCurrentTicket = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });
                            const isClaimed = fetchCurrentTicket.isClaimed;

                            if (isClaimed === true) {
                                const ticketClaimedEmbed = new MessageEmbed()
                                    .setDescription(`:x: | Ticket is already claimed.`)
                                    .setColor("RED")


                                return user.send({ embeds: [ticketClaimedEmbed] }).catch(console.error);
                            }

                            const ticketClaimed = new MessageEmbed()
                                .setTitle("Support has arrived!")
                                .setDescription(`${user} has claimed this ticket.`)
                                .setColor("GREEN")

                            const userClaimedEmbed = new MessageEmbed()
                                .setDescription(`You have successfully claimed this ticket: <#${bugReportChannel.id}>`)
                                .setColor("YELLOW")

                            await ticketSchema.findOneAndUpdate({ ticketChannelId: bugReportChannel.id }, { isClaimed: true });
                            await ticketSchema.findOneAndUpdate({ ticketChannelId: bugReportChannel.id }, { claimedBy: `${user.id}` });

                            user.send({ embeds: [userClaimedEmbed] }).catch(console.error);
                            await bugReportChannel.setParent(claimedTicketsCategoryId, { lockPermissions: false });

                            await sleep(200);
                            await bugReportChannel.send({ embeds: [ticketClaimed] });
                        });

                        collector.on('end', async collected => {

                            const fetchCurrentTicketAgain = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });

                            let x = 1;

                            do {

                                const fetchCurrentTicketAgain = await ticketSchema.findOne({ ticketChannelId: bugReportChannel.id });

                                console.log(fetchCurrentTicketAgain.isClaimed);

                                if (fetchCurrentTicketAgain.isClaimed === false) {
                                    await bugReportChannel.setParent(brokenTicketsCategoryId, { lockPermissions: false })

                                    const noCREmbed = new MessageEmbed()
                                        .setTitle("Don't worry!")
                                        .setDescription("Your CR will be with you shortly.\nWe apologize for the wait. You do not need to create a new ticket!")
                                        .setColor("#2F3136")

                                    return bugReportChannel.send({ content: `<@&${roleId}>`, embeds: [noCREmbed] });
                                }

                            } while (x===3)


                        });
                    }

                })
                .catch(() => {
                    bugReportChannel.delete();
                    user.send("Ticket closed due to no response in \`5\` minutes.").catch(console.error);
                });

        }
    }
});

client.commands = new Collection();
client.cooldowns = new Collection();

['eventsHandler', 'commandsHandler'].forEach(handler => {
    require(`./Handlers/${handler}`)(client, Discord)
});

client.login(token);