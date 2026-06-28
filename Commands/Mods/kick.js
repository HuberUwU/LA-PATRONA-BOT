const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un miembro del servidor.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("El miembro al que deseas expulsar")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("razon")
        .setDescription("Razón de la expulsión")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser("target");
    const { guild } = interaction;
    let razon = interaction.options.getString("razon") || "No se especificó ninguna razón.";

    // 1. Obtener al miembro de forma segura
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: "⚠️ El usuario especificado no se encuentra en el servidor.",
        flags: ["Ephemeral"],
      });
    }

    // 2. Validaciones jerárquicas y lógicas
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "⚠️ No puedes expulsarte a ti mismo.",
        flags: ["Ephemeral"],
      });
    }

    if (user.id === client.user.id) {
      return interaction.reply({
        content: "⚠️ No puedes expulsarme a mí.",
        flags: ["Ephemeral"],
      });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: "⚠️ No puedes expulsar a alguien con un rol igual o superior al tuyo.",
        flags: ["Ephemeral"],
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: "⚠️ No tengo permisos suficientes para expulsar a este miembro (puede tener un rol superior al mío o ser administrador).",
        flags: ["Ephemeral"],
      });
    }

    // Defer de la respuesta para evitar tiempos de espera
    await interaction.deferReply();

    // 3. Notificar al usuario por Mensaje Privado (DM) antes de expulsarlo
    const dmEmbed = new EmbedBuilder()
      .setColor("#ff4757")
      .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
      .setTitle("📥 Has sido expulsado del servidor")
      .setDescription(`Se te ha aplicado una expulsión de **${guild.name}**.`)
      .addFields(
        { name: "📝 Razón", value: razon, inline: false },
        { name: "🛡️ Aplicado por", value: `${interaction.user.tag}`, inline: false }
      )
      .setTimestamp();

    await user.send({ embeds: [dmEmbed] }).catch(() => {
      console.log(`[DM-Failed] No se pudo enviar el DM a ${user.tag} porque tiene los mensajes privados cerrados.`);
    });

    // 4. Ejecutar la expulsión en Discord
    try {
      await member.kick(razon);

      // Embed estético premium de éxito
      const successEmbed = new EmbedBuilder()
        .setColor("#ff4757")
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setTitle("👤 Miembro Expulsado")
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription("Se ha expulsado al miembro del servidor con éxito.")
        .addFields(
          { name: "👤 Miembro", value: `${user} (\`${user.id}\`)`, inline: true },
          { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true },
          { name: "📝 Razón", value: razon, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Acción realizada por ${interaction.user.username}` });

      return await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Error al expulsar")
        .setDescription(`Ocurrió un error inesperado al intentar expulsar al usuario:\n\`\`\`js\n${error.message}\n\`\`\``);
      
      return await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};