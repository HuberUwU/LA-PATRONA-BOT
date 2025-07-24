const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: `claim`,
    },
    async execute(interaction, client) {
      const staff = interaction.guild.roles.cache.get("1207227372051369985");

        const embed = new EmbedBuilder()
        .setTitle(`Tickets | ${client.user.username}`)
        .setDescription(`Ticket claimeado por: <@${interaction.user.id}>`)
        .setColor("Aqua")

        interaction.reply({ embeds: [embed] })

    },
};