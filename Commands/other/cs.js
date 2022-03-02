const { MessageEmbed } = require('discord.js');
const roplyCustomerRepSchema = require('../../Models/roplyCustomerRep');
const roplyShiftSchema = require('../../Models/roplyShift');

module.exports = {
    name: 'cs',
    async execute(message, args) {

        const fetchCustomerRep = await roplyCustomerRepSchema.findOne({ customerRepId: message.author.id });
        
        if (!fetchCustomerRep) return;

        if (args[0].toLowerCase() === 'shift' && args[1].toLowerCase() === "start" && fetchCustomerRep.onShift === false) {

            const roplyShiftSchemaDoc = await new roplyShiftSchema({ userId: message.author.id, startTime: parseInt(Date.now()/1000), endTime: "Shift not finished yet!", ticketsCompleted: 0 })
            await roplyShiftSchemaDoc.save();

            await roplyCustomerRepSchema.findOneAndUpdate({ customerRepId: message.author.id }, { onShift: true });

            const shiftStartedEmbed = new MessageEmbed()
                .setTitle("🕒 | Shift Successfully Started")
                .setDescription("You have successfully begun your Customer Representative shift at RoPly.")
                .setColor("#2F3136")

            return message.reply({ embeds: [shiftStartedEmbed], allowedMentions: { repliedUser: false }  });

        }

        if (args[0].toLowerCase() === 'shift' && args[1].toLowerCase() === "end" && fetchCustomerRep.onShift === true) {

            await roplyShiftSchema.findOneAndUpdate({ userId: message.author.id }, { endTime: parseInt(Date.now()/1000) });

            const fetchShiftInfo = await roplyShiftSchema.findOne({ userId: message.author.id });

            const shiftStartTime = fetchShiftInfo.startTime;
            const shiftEndTime = fetchShiftInfo.endTime;

            await roplyCustomerRepSchema.findOneAndUpdate({ customerRepId: message.author.id }, { onShift: false });

            const shiftEndedEmbed = new MessageEmbed()
                .setTitle("🕗 | Shift Successfully Ended")
                .setDescription(`You have successfully ended your Customer Representative shift at RoPly.\n\nShift start time: <t:${shiftStartTime}>\nShift end time: <t:${shiftEndTime}>`)
                .setColor("#2F3136")

            await roplyShiftSchema.findOneAndDelete({ userId: message.author.id });

            return message.reply({ embeds: [shiftEndedEmbed], allowedMentions: { repliedUser: false } });

        }

    }
}