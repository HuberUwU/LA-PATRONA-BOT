const { ChatInputCommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ticketSchema = require("../Schemas/ticketSchema");

module.exports = {
  data: {
    name: 'claim',
  },
  async execute(interaction, client) {
    const ticketData = await ticketSchema.findOne({ Guild: interaction.guild.id });
    const staffRoleId = ticketData ? ticketData.StaffRole : "1207227372051369985";
    const hasStaffRole = interaction.member.roles.cache.has(staffRoleId);
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    // 1. Validar si el usuario es staff o administrador
    if (!hasStaffRole && !isAdmin) {
      return interaction.reply({
        content: "⚠️ No tienes permiso para reclamar este ticket.",
        flags: ['Ephemeral']
      });
    }

    // 2. Extraer la información del ticket del embed original
    const embedFields = interaction.message.embeds[0]?.fields;
    if (!embedFields) {
      return interaction.reply({
        content: "⚠️ No se pudo obtener la información original del ticket.",
        flags: ['Ephemeral']
      });
    }

    const creatorMention = embedFields[0].value;
    const creatorId = creatorMention.replace(/[<@!>]/g, "");

    // 3. Modificar los permisos del canal de forma segura
    // Mantener al creador del ticket con acceso completo
    await interaction.channel.permissionOverwrites.create(creatorId, {
      ViewChannel: true,
      SendMessages: true,
      AttachFiles: true,
      ReadMessageHistory: true,
    });

    // Dar acceso completo al staff específico que reclama el ticket
    await interaction.channel.permissionOverwrites.create(interaction.user.id, {
      ViewChannel: true,
      SendMessages: true,
      AttachFiles: true,
      ReadMessageHistory: true,
    });

    // Quitar acceso al rol general del staff para asegurar privacidad del ticket
    const staffRole = interaction.guild.roles.cache.get(staffRoleId);
    if (staffRole) {
      await interaction.channel.permissionOverwrites.create(staffRoleId, {
        ViewChannel: false,
        SendMessages: false,
      });
    }

    // 4. Actualizar la botonera y el embed original
    const oldEmbed = interaction.message.embeds[0];
    const updatedEmbed = EmbedBuilder.from(oldEmbed)
      .setFields([
        oldEmbed.fields[0], // Creador por
        { name: "🏷️ Estado", value: "`En atención 🛠️`", inline: true },
        { name: "📌 Asignado a", value: `${interaction.user}`, inline: true }
      ]);

    const originalComponents = interaction.message.components[0].components;
    const updatedComponents = originalComponents.map(component => {
      const newButton = ButtonBuilder.from(component);
      if (component.customId === 'claim') {
        newButton.setDisabled(true).setLabel('Reclamado').setStyle(ButtonStyle.Success);
      }
      return newButton;
    });
    const row = new ActionRowBuilder().addComponents(updatedComponents);

    // Actualizar la interfaz del mensaje de bienvenida
    await interaction.update({ embeds: [updatedEmbed], components: [row] });

    // Enviar mensaje de notificación al chat
    const claimNotifier = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`📌 **Este ticket ha sido reclamado por ${interaction.user} y ahora se gestionará en privado.**`);
    
    await interaction.channel.send({ embeds: [claimNotifier] });
  }
};