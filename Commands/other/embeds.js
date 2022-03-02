const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'embeds',
    async execute(message) {


        const codeEmbed1 = new MessageEmbed()
            .setTitle("EMBED #1")
            .setDescription(`👋 | Hey there, ${message.author}!\n\nHere is your verification code:\n\`123456\`\n\nEnter it in [game](https://roblox.com)`)
            .setColor("RED")
            .setFooter({ text: "The code will expire in 5 minutes." })

        const codeEmbed2 = new MessageEmbed()
            .setTitle("EMBED #2")
            .setDescription(`👋 | Hey there, ${message.author}!\n\nHere is your verification code:\n\`\`\`123456\`\`\`\n\nEnter it in [game](https://roblox.com)`)
            .setColor("RED")
            .setFooter({ text: "The code will expire in 5 minutes." })


        await message.channel.send({ content: 'Embed #1', embeds: [codeEmbed1] })
        return message.channel.send({ content: 'Embed #2', embeds: [codeEmbed2] })
    }
}