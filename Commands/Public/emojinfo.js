const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoji-info")
    .setDescription("Obtiene información detallada y el enlace de descarga de un emoji personalizado.")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("Menciona o pega el emoji personalizado del cual quieres ver la información")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const emojiInput = interaction.options.getString("emoji").trim();

    // Expresión regular para validar emojis personalizados de Discord (estáticos y animados)
    const match = emojiInput.match(/^<?(a)?:?(\w+):(\d{17,20})>?$/);
    if (!match) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Emoji Inválido")
        .setDescription(
          "El emoji ingresado no es un emoji personalizado válido de Discord.\n\n" +
          "**Instrucciones:**\n" +
          "• Asegúrate de introducir un emoji personalizado (ej. `<:nombre:id>`).\n" +
          "• Los emojis estándar de Discord (emojis Unicode como 😀, 🚀, etc.) no tienen ID ni enlace de imagen."
        );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: ['Ephemeral'],
      });
    }

    const isAnimated = !!match[1];
    const emojiName = match[2];
    const emojiId = match[3];

    const ext = isAnimated ? "gif" : "png";
    const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}?size=4096&quality=lossless`;
    const formatType = isAnimated ? "Animado (GIF)" : "Estático (PNG)";
    const copyPasteCode = isAnimated ? `\`<a:${emojiName}:${emojiId}>\`` : `\`<:${emojiName}:${emojiId}>\``;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("✨ Información de Emoji")
      .setThumbnail(emojiUrl)
      .setDescription("Detalles del emoji personalizado seleccionado:")
      .addFields(
        {
          name: "🏷️ Nombre",
          value: `\`:${emojiName}:\``,
          inline: true
        },
        {
          name: "🆔 ID",
          value: `\`${emojiId}\``,
          inline: true
        },
        {
          name: "🎥 Tipo",
          value: formatType,
          inline: true
        },
        {
          name: "🛠️ Código de uso",
          value: copyPasteCode,
          inline: false
        },
        {
          name: "🔗 Enlace de descarga",
          value: `[Haga clic aquí para descargar](${emojiUrl})`,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: `Pedido por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    return interaction.reply({ embeds: [embed] });
  },
};