const { MessageEmbed } = require('discord.js');
const roplyCustomerRepSchema = require('../../Models/roplyCustomerRep');

module.exports = {
    name: 'unenroll',
    async execute(message, args) {
 
        let userId = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        userId = userId.id;

        await roplyCustomerRepSchema.findOneAndDelete({ customerRepId: userId });

        const crRemovalEmbed = new MessageEmbed()
            .setDescription(`Successfully removed <@${userId}> from the Customer Representatives Team.`)
            .setColor("#2F3136")

        return message.reply({ embeds: [crRemovalEmbed] });

    }
}