const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloquea el canal especificado permitiendo que los miembros vuelvan a enviar mensajes.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('El canal de texto que quieres desbloquear')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    // 1. Validar permisos del bot en el servidor
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return await interaction.reply({
        content: "⚠️ El bot no tiene el permiso **Gestionar Roles** (necesario para editar permisos de canales).",
        flags: ['Ephemeral']
      });
    }

    try {
      // Permitir mensajes para @everyone en el canal
      await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: true });

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🔓 Canal Desbloqueado")
        .setDescription(`El canal ${channel} ha sido desbloqueado con éxito.\nLos miembros ahora pueden volver a enviar mensajes en este canal.`)
        .setTimestamp()
        .setFooter({ text: `Acción realizada por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: `❌ Hubo un error al intentar desbloquear el canal: \`${error.message}\``,
        flags: ['Ephemeral']
      });
    }
  }
};
