// const { MessageEmbed, Message, WebhookClient } = require('discord.js');

// module.exports = {
//     name: 'messageUpdate',
//     /**
//      * @param {Message} oldMessage
//      * @param {Message} newMessage
//      */
//     execute(oldMessage, newMessage) {
//         if (oldMessage.author.bot) return;

//         if (oldMessage.content === newMessage.content) return;

//         const Count = 1950;

//         const Original = oldMessage.content.slice(0, Count) + (oldMessage.content.length > 1950 ? " ..." : "");
//         const Edited = newMessage.content.slice(0, Count) + (newMessage.content.length > 1950 ? " ..." : "");

//         const Log = new MessageEmbed()
//             .setTitle("Message Edited")
//             .setDescription(`**Original: **\n${Original}\n\n**Edited: **\n${Edited}\n\n**Channel: **${oldMessage.channel}\n**Message ID: **${oldMessage.id}`)

//         new WebhookClient({ url: "https://discord.com/api/webhooks/927267541234118757/goTnUYc5cQCgOJVhtTn223xPXfhzAWZZkTZIHGHltxZc2y7ZrEQAvpJC_E12yO2k-SR8"}).send({ embeds: [Log] }).catch((err) => console.log(err));
//     }
// }