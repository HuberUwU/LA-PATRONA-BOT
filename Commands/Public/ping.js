const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia del bot y de la API de Discord."),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.reply({ content: "Calculando latencia..." });
    const sent = await interaction.fetchReply();
    const msgLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🏓 ¡Pong!")
      .setDescription(
        `📬 **Mensajes:** \`${msgLatency}ms\`\n` +
        `🌐 **Websocket Discord:** \`${apiLatency}ms\``
      )
      .setTimestamp();

    await interaction.editReply({ content: " ", embeds: [embed] });
  },
};