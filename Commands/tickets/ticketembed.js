const { MessageEmbed } = require("discord.js")


module.exports = {
    name: 'ticketembed',
    async execute(message, client) {

        const ticketEmbed = new MessageEmbed()
            .setTitle("🎟 | Support Tickets")
            .setDescription(`Found a bug, or error? Have a question, or another concern? Would you like to partner with us? Click one of the buttons corresponding to what we listed here!\n\n🐛 - Report a bug\n❓ - General Support\n❔ - Partnerships`)
            .setColor("#2F3136")
            
        await message.delete();
        const ticketEmbedMsg = await message.channel.send({ embeds: [ticketEmbed] });
        await ticketEmbedMsg.react("🐛");
        await ticketEmbedMsg.react("❓");
        await ticketEmbedMsg.react("❔");

    }
}