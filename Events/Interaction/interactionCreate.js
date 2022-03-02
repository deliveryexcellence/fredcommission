const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            
            if (interaction.customId.includes('bug-report')) {
                const ticketsChannel = interaction.guild.channels.cache.get("941332305191010324");

                const bugReportChannel = await ticketsChannel.createChannel('bug-report')

                const supportSoonEmbed = new MessageEmbed()
                    .setTitle("🐛 | Bug Report Ticket")
                    .setDescription(`**Please explain the bug you are experiencing in as much detail as possible. **\n\n*Thank you for opening this ticket. One of our <@&941332711900073984>s will arrive soon.*`)
                    .setColor("#2F3136")
                
                await bugReportChannel.send({ content: `${interaction.user}`, embeds: [supportSoonEmbed] });
            }

            if (interaction.customId.includes('general-support')) {
                const ticketsChannel = interaction.guild.channels.cache.get("941332305191010324");

                const generalSupportChannel = await ticketsChannel.createChannel('bug-report');

                const supportSoonEmbed = new MessageEmbed()
                    .setTitle("❓ | General Support Ticket")
                    .setDescription(`**Please explain your issue in as much detail as possible. **\n\n*Thank you for opening this ticket. One of our <@&941332711900073984>s will arrive soon.*`)
                    .setColor("#2F3136")

                await generalSupportChannel.send({ content: `${interaction.user}`, embeds: [supportSoonEmbed] });
            }

            if (interaction.customId.includes("partnerships")) {
                const ticketsChannel = interaction.guild.channels.cache.get("941332305191010324");
                const member = interaction.guild.members.cache.get(interaction.user.id)

                const partnershipsChannel = await ticketsChannel.createChannel('partnership-ticket', {
                    type: 'GUILD_TEXT',
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ATTACH_FILES", "EMBED_LINKS"],
                            deny: ["USE_APPLICATION_COMMANDS", "CREATE_PUBLIC_THREADS", "CREATE_PRIVATE_THREADS"]
                        },
                        {
                            id: interaction.guild.id,
                            deny: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
                        },
                    ],
                });

                const supportSoonEmbed = new MessageEmbed()
                    .setTitle("❔ | Partnership Ticket")
                    .setDescription(`**Please answer the following questions:\n • Question #1\n • Question #2\n • Question #3\n ETC. **\n\n*Thank you for opening this ticket. One of our <@&941332711900073984>s will arrive soon.*`)
                    .setColor("#2F3136")

                await partnershipsChannel.send({ content: `${interaction.user}`, embeds: [supportSoonEmbed] });

            }

        }
    },
};