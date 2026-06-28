const { ChatInputCommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const ticketSchema = require("../Schemas/ticketSchema");

module.exports = {
  data: {
    name: 'ticket',
  },
  async execute(interaction, client) {
    const ticketData = await ticketSchema.findOne({ Guild: interaction.guild.id });
    const staffRoleId = ticketData ? ticketData.StaffRole : "1207227372051369985";
    const staffRole = interaction.guild.roles.cache.get(staffRoleId);

    // Definir los permisos iniciales del canal de forma masiva
    const permissionOverwrites = [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];

    if (staffRole) {
      permissionOverwrites.push({
        id: staffRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      });
    }

    // Normalizar el nombre del canal de texto para evitar problemas con caracteres especiales o espacios
    const canalName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "");

    const canal = await interaction.guild.channels.create({
      name: canalName || `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,
      permissionOverwrites: permissionOverwrites,
    });

    await interaction.reply({
      content: `✅ **El ticket fue abierto correctamente en <#${canal.id}>**`,
      flags: ['Ephemeral'],
    });

    const welcomeEmbed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle(`📩 Soporte Técnico | ${interaction.guild.name}`)
      .setDescription(
        `Bienvenido al sistema de soporte, ${interaction.user}.\n` +
        `Por favor, describe detalladamente tu consulta, duda o reporte en este canal. Un miembro del equipo de soporte te atenderá lo antes posible.`
      )
      .addFields(
        { name: "👤 Creado por", value: `${interaction.user}`, inline: true },
        { name: "🏷️ Estado", value: "`Esperando soporte...`", inline: true },
        { name: "📌 Asignado a", value: "Ninguno", inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("claim")
        .setLabel("📌 Reclamar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("close")
        .setLabel("🔒 Cerrar")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("transcript")
        .setLabel("📜 Transcribir")
        .setStyle(ButtonStyle.Secondary)
    );

    await canal.send({ content: `${interaction.user} | <@&${staffRoleId}>`, embeds: [welcomeEmbed], components: [row] });
  }
};