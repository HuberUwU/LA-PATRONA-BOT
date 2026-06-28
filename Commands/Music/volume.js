const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Ajusta el volumen de la música")
    .addIntegerOption((option) =>
      option
        .setName("cantidad")
        .setDescription("Porcentaje de volumen (1 - 100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    const voiceChannel = interaction.member.voice.channel;
    const volume = interaction.options.getInteger("cantidad");

    if (!voiceChannel) {
      return interaction.reply({
        content: "⚠️ Debes estar en un canal de voz para usar este comando.",
        flags: ['Ephemeral'],
      });
    }

    if (!queue) {
      return interaction.reply({
        content: "⚠️ No hay música reproduciéndose en este servidor.",
        flags: ['Ephemeral'],
      });
    }

    try {
      queue.setVolume(volume);
      return interaction.reply({ content: `🔊 Volumen ajustado a: **${volume}%**` });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Ocurrió un error al ajustar el volumen: ${error.message}`,
        flags: ['Ephemeral'],
      });
    }
  },
};
