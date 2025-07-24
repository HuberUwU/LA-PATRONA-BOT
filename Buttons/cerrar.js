const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: `close`,
    },
    async execute(interaction, client) {

      const embed = new EmbedBuilder()
          .setTitle(`📩 | Tickets | ${client.user.username}`)
          .setDescription(`🗑️ **El ticket fue cerrado, sera eliminado en 5 segundos**`)
          .setTimestamp()
          .setColor(`#2b2d31`)


      return interaction.reply({ embeds: [embed] })


        && setTimeout(() => {
      interaction.channel.delete(`${interaction.channels}`)
        }, 5000)

    },
};