const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steal")
    .setDescription("Agrega un emoji personalizado de otro servidor (o una URL de imagen) a este servidor.")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("El emoji a copiar (menciónalo) o la URL de la imagen")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("El nombre que le darás al emoji")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
    .setDMPermission(false),

  async execute(interaction) {

    // 2. Validar permisos del propio Bot
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return await interaction.reply({
        content: "⚠️ El bot no tiene el permiso **Gestionar Emojis y Stickers** en este servidor.",
        flags: ['Ephemeral'],
      });
    }

    let emojiInput = interaction.options.getString("emoji").trim();
    const name = interaction.options.getString("name").trim();

    let finalUrl = emojiInput;

    // 3. Procesar si el input es una mención de emoji personalizado de Discord (instantáneo sin Axios)
    const match = emojiInput.match(/^<?(a)?:?(\w+):(\d{17,20})>?$/);
    if (match) {
      const isAnimated = !!match[1];
      const emojiId = match[3];
      const ext = isAnimated ? "gif" : "png";
      finalUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}?quality=lossless`;
    }

    // 4. Validaciones de URL
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      return await interaction.reply({
        content: "⚠️ Por favor, introduce un emoji de Discord válido o un enlace de imagen (HTTP/HTTPS) directo.",
        flags: ['Ephemeral'],
      });
    }

    await interaction.deferReply();

    try {
      const createdEmoji = await interaction.guild.emojis.create({
        attachment: finalUrl,
        name: name
      });

      const embed = new EmbedBuilder()
        .setTitle("✅ ¡Emoji Agregado Exitosamente!")
        .setDescription(`El emoji ha sido añadido a la lista del servidor.\n\n**• Nombre:** \`:${createdEmoji.name}:\`\n**• ID:** \`${createdEmoji.id}\`\n**• Visualización:** ${createdEmoji}`)
        .setThumbnail(createdEmoji.url)
        .setColor("Green")
        .setTimestamp();

      return await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Error al crear el emoji")
        .setDescription(
          `No se pudo crear el emoji personalizado.\n\n` +
          `**Posibles causas:**\n` +
          `• El servidor alcanzó el límite máximo de emojis.\n` +
          `• El archivo/enlace no es una imagen válida o es demasiado pesado (máximo 256 KB).\n` +
          `• El bot carece de los permisos correspondientes.\n\n` +
          `*Detalle del error:* \`${error.message}\``
        )
        .setColor("Red")
        .setTimestamp();

      return await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
