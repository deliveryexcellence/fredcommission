const roplyCustomerRepSchema = require('../../Models/roplyCustomerRep');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'enroll',
    async execute(message, args) {

        if (!args.length) return message.reply("Incorrect command usage.");

        let customerRepMention = await message.mentions.members.first();
        const customerRepId = customerRepMention.id;

        const firstFetch = await roplyCustomerRepSchema.findOne({ customerRepId: customerRepId})

        if (!firstFetch) {

        webhookURL = args[1];
        if (!args[1]) return message.reply("Please provide a webhook URL.") 
        if (!webhookURL.includes('discord')) return message.reply("Please provide a valid webhook URL.")

        const roplyCustomerRepSchemaDoc = await new roplyCustomerRepSchema({ customerRepId: customerRepId, webhookURL: webhookURL,onShift: false, totalTickets: 0 });
        await roplyCustomerRepSchemaDoc.save();

        const embed = new MessageEmbed()
            .setDescription(`<@${customerRepId}> has been successfully enrolled as a **Customer Representative**`)
            .setColor("#2F3136")

        return message.reply({ embeds: [embed] });
        } else {

            const alreadyEnrolledEmbed = new MessageEmbed()
                .setDescription(`<@${customerRepId}> is already enrolled.`)
                .setColor("RED")
            return message.reply({ embeds: [alreadyEnrolledEmbed] });
        }

    }
}