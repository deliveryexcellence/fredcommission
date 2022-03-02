const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'embeds2',
    async execute(message) {


        const embed = new MessageEmbed()
            .setTitle("Embed #1")
            .setDescription(`Found a bug, or error? Have a question, or another concern? Would you like to partner with us? Click one of the buttons corresponding to what we listed here!\n\n🐛 - Report a bug\n❓ - General Support\n❔ - Partnerships`)
            .setColor("#2F3136")

        const row = new MessageActionRow()
            .addComponents(
                button1 = new MessageButton()
                    .setEmoji("🐛")
                    .setStyle("SECONDARY")
                    .setLabel("Report a bug")
                    .setCustomId("bug-report"),

                button2 = new MessageButton()
                    .setEmoji("❓")
                    .setStyle("SECONDARY")
                    .setLabel("General Support")
                    .setCustomId("general-support"),

                button3 = new MessageButton()
                    .setEmoji("❔")
                    .setStyle("SECONDARY")
                    .setLabel("Partnerships")
                    .setCustomId("partnerships"),
            )

        await message.channel.send({ content: "Ticket Embed **#1**", embeds: [embed], components: [row] });
        const reactionEmbed = await message.channel.send({ content: "Ticket Embed **#2**", embeds: [embed] });
        await reactionEmbed.react("🐛");
        await reactionEmbed.react("❓");
        await reactionEmbed.react("❔");
        return;
    }
}