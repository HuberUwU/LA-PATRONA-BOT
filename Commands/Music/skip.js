const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Salta la canción actual en reproducción"),
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
      if (queue.songs.length <= 1) {
        await queue.stop();
        return interaction.reply({ content: "⏹️ Cola finalizada. Saliendo del canal." });
      } else {
        await queue.skip();
        return interaction.reply({ content: "⏭️ Canción saltada con éxito." });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Ocurrió un error al intentar saltar la canción: ${error.message}`,
        flags: ['Ephemeral'],
      });
    }
  },
};
