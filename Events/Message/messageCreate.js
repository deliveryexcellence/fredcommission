const { Client, Message, Collection, MessageEmbed } = require('discord.js');
const { prefix, guildId } = require('../../config.json');

module.exports = {
    name: 'messageCreate',
    /**
     * @param {Client} client
     * @param {Message} Message
     */

    async execute(message, client, Discord) {

        if (message.content.startsWith(">") && message.content.includes("terminate")) {
            process.exit(0);

        }

        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        const { cooldowns } = client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection())
        }

        const modUser = message.author.id;
        const modMember = message.guild.members.cache.get(modUser);

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        let cooldownAmount = (command.cooldown || 1) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (modMember.roles.cache.some(role => role.id === '932004659781074984')) {
                cooldownAmount === 0;
            } else if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const timeLeftEmbed = new MessageEmbed()
                    .setTitle("You're on cooldown!")
                    .setDescription(`Please wait another ${Math.floor(timeLeft/60)} minutes to run this command again.`)
                    .setColor("GREEN")

                return message.reply({ embeds: [timeLeftEmbed]})
                //(`Please wait another ${Math.floor(timeLeft)} more seconds to run this command again.`)
            };
        };

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            command.execute(message, args, commandName, client, Discord)
        } catch (error) {
            console.log(error)
            return message.reply("An error occured.")
        }
    }
}