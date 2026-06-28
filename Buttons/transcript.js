const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Transcript = require('discord-html-transcripts')
const ticketSchema = require("../Schemas/ticketSchema");

module.exports = {
    data: {
        name: `transcript`,
    },
    async execute(interaction, client) {
        const ticketData = await ticketSchema.findOne({ Guild: interaction.guild.id });
        const staffRoleId = ticketData ? ticketData.StaffRole : "1207227372051369985";
        const hasStaffRole = interaction.member.roles.cache.has(staffRoleId) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if(!hasStaffRole) return interaction.reply({ content: `🚫 **No tienes permitido usar este boton**`, flags: ['Ephemeral'] })

        const safeUsername = interaction.user.username.replace(/[^a-z0-9-]/gi, "");
        await interaction.channel.edit({
            name: `ticket-transcribido-por-${safeUsername}`.toLowerCase().substring(0, 32),
        }).catch(err => console.error("Error al renombrar el canal de ticket:", err));

        return interaction.reply({ files: [await Transcript.createTranscript(interaction.channel)] });
    },
};