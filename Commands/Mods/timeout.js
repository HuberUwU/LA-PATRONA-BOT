const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aísla (timeout) a un usuario del servidor por un tiempo determinado.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("El usuario al que quieres dar timeout")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("tiempo")
        .setDescription("Tiempo de aislamiento en minutos")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("razon").setDescription("La razón del aislamiento")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser("target");
    const tiempo = interaction.options.getInteger("tiempo");
    let razon = interaction.options.getString("razon") || "No se especificó ninguna razón.";

    // 1. Intentar obtener el miembro de forma segura
    let member;
    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch {
      return interaction.reply({
        content: "⚠️ No se pudo encontrar a ese usuario en el servidor.",
        flags: ['Ephemeral'],
      });
    }

    // 2. Validaciones lógicas
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "⚠️ No puedes darte timeout a ti mismo.",
        flags: ['Ephemeral'],
      });
    }

    if (user.id === client.user.id) {
      return interaction.reply({
        content: "⚠️ No puedes darme timeout a mí.",
        flags: ['Ephemeral'],
      });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: "⚠️ No puedes dar timeout a alguien con un rol igual o superior al tuyo.",
        flags: ['Ephemeral'],
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: "⚠️ No puedo dar timeout a este usuario (puede tener un rol superior al mío o ser administrador).",
        flags: ['Ephemeral'],
      });
    }

    if (tiempo > 40320) { // Límite máximo de Discord: 28 días (40320 minutos)
      return interaction.reply({
        content: "⚠️ El tiempo de aislamiento no puede superar los 28 días (40,320 minutos).",
        flags: ['Ephemeral'],
      });
    }

    const untimeoutTime = Math.floor((Date.now() + (tiempo * 60 * 1000)) / 1000);

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🚫 Usuario Aislado (Timeout)")
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(`El usuario ha sido aislado temporalmente del servidor.`)
      .addFields(
        { name: "👤 Usuario", value: `${user} (\`${user.id}\`)`, inline: true },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true },
        { name: "⏱️ Duración", value: `\`${tiempo} minutos\``, inline: true },
        { name: "📅 Finaliza el", value: `<t:${untimeoutTime}:F> (<t:${untimeoutTime}:R>)`, inline: false },
        { name: "📝 Razón", value: razon, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });

    try {
      // Aplicar el timeout en la API de Discord antes de confirmar al usuario
      await member.timeout(tiempo * 60 * 1000, razon);
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Ocurrió un error al intentar aplicar el timeout: \`${error.message}\``,
        flags: ['Ephemeral']
      });
    }
  },
};
