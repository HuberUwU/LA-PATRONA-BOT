const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloquea el canal especificado para evitar que los miembros envíen mensajes.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('El canal de texto que deseas bloquear')
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
      // Bloquear mensajes para @everyone en el canal
      await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false });

      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🔒 Canal Bloqueado")
        .setDescription(`El canal ${channel} ha sido bloqueado con éxito.\nLos miembros sin permisos especiales ya no pueden enviar mensajes aquí.`)
        .setTimestamp()
        .setFooter({ text: `Acción realizada por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return await interaction.reply({
        content: `❌ Hubo un error al intentar bloquear el canal: \`${error.message}\``,
        flags: ['Ephemeral']
      });
    }
  }
};
