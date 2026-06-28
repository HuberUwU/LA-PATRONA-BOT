const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene la música, vacía la cola y desconecta el bot"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    const voiceChannel = interaction.member.voice.channel;

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
      await queue.stop();
      return interaction.reply({ content: "⏹️ Reproducción detenida, cola limpia y bot desconectado." });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Ocurrió un error al intentar detener el reproductor: ${error.message}`,
        flags: ['Ephemeral'],
      });
    }
  },
};
