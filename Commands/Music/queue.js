const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Muestra la lista de canciones en cola"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);

    if (!queue) {
      return interaction.reply({
        content: "⚠️ No hay música reproduciéndose en este servidor.",
        flags: ['Ephemeral'],
      });
    }

    try {
      const currentSong = queue.songs[0];
      const q = queue.songs
        .slice(1, 11) // Mostrar las siguientes 10 canciones
        .map((song, i) => `**${i + 1}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\` (Por: ${song.user})`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(`🎶 Cola de reproducción`)
        .setColor("#2b2d31")
        .setDescription(
          `**🔊 Reproduciendo ahora:**\n[${currentSong.name}](${currentSong.url}) - \`${currentSong.formattedDuration}\` (Solicitado por: ${currentSong.user})\n\n` +
          `**⏳ Siguientes canciones:**\n${q || "No hay más canciones en la cola."}`
        )
        .addFields(
          { name: "⏱️ Tiempo total de la cola", value: `\`${queue.formattedDuration}\``, inline: true },
          { name: "🎵 Canciones en cola", value: `\`${queue.songs.length}\``, inline: true }
        )
        .setThumbnail(currentSong.thumbnail)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Ocurrió un error al obtener la cola: ${error.message}`,
        flags: ['Ephemeral'],
      });
    }
  },
};
