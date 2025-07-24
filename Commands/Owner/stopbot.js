const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, } = require("discord.js");

module.exports = {


    developer: true,
    data: new SlashCommandBuilder()
    .setName(`stopbot`)
    .setDescription(`Apaga el bot (OWNER)`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

     /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */

     async execute(interaction) {

        const embed = new EmbedBuilder()
        .setTitle(`Deteniendo el bot...`)
        .setDescription(`El bot dejará de funcionar hasta que lo vuelvas a encender!`)
        .setTimestamp()
        .setColor("Red")

        const channel = interaction.channel;
        interaction.reply({content: `Success.`, embeds: [embed]}).then(() => {
            return process.exit(1);
        });

     }

}