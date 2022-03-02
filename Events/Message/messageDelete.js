// const { MessageEmbed, Message, WebhookClient } = require('discord.js');

// module.exports = {
//     name: 'messageDelete',

//     /**
//      * @param {Message} message 
//      */
    
//     async execute(message) {
//         if (message.author.bot) return;

//         if (message.content === 'yes') {
//             console.log('message includes yes');
//         }

//         const Log = new MessageEmbed()  
//             .setTitle("Message Deleted")
//             .setAuthor(`${message.author.tag} | ${message.author.id}`, `${message.author.displayAvatarURL({ dynamic: true })}`)
//             .setDescription(`Deleted message content:\n\`${message.content ? message.content : "none"}\`\n\nChannel: ${message.channel}\nURL: ${message.url}`.slice(0,4096))
//             .setColor("RED");

//         new WebhookClient({url: "https://discord.com/api/webhooks/927267325852405780/GbG8kwLXErAGpfVxkAk3ngMewA9NQfVzUqF_fHWoXOvYudYyz1RAXEv80EsP6k7a3bb8"}).send({ embeds: [Log]}).catch((err) => {console.log(err)});
//     }
// }