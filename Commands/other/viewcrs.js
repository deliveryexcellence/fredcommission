const roplyCustomerRepSchema = require('../../Models/roplyCustomerRep');
const { MessageEmbed } = require('discord.js')

module.exports = {
    name: 'viewcrs',
    async execute(message) {

        const fetchAllCRs = await roplyCustomerRepSchema.find();
        
        let description = '';
        for (const i in fetchAllCRs) {
            
            const fetchUserFromId = message.client.users.cache.get(`${fetchAllCRs[i].customerRepId}`)
            description += `**Customer Representative #${parseInt(i)+1}**\n${fetchUserFromId.tag} | \`${fetchUserFromId.id}\`\n\n`
        }

        const viewCREmbed = new MessageEmbed()
            .setTitle("Customer Representatives")
            .setDescription(description)
            .setColor("#2F3136")
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ dynamic: true, size: 256 })}`})

        return message.channel.send({ embeds: [viewCREmbed] });

    }
}