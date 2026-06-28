const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Muestra la información de la canción que se está reproduciendo ahora"),
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
      const song = queue.songs[0];
      
      // Barra de progreso dinámica
      const totalSeconds = song.duration;
      const currentSeconds = queue.currentTime;
      const progressLength = 15;
      const progress = totalSeconds > 0 ? Math.round((currentSeconds / totalSeconds) * progressLength) : 0;
      const emptyProgress = progressLength - progress;
      const progressString = "▬".repeat(progress > 0 ? progress - 1 : 0) + "🔘" + "▬".repeat(emptyProgress > 0 ? emptyProgress : 0);

      const embed = new EmbedBuilder()
        .setTitle(`🎵 Sonando Ahora`)
        .setDescription(`**[${song.name}](${song.url})**`)
        .addFields(
          { name: "👤 Solicitado por", value: `${song.user}`, inline: true },
          { name: "📶 Volumen", value: `\`${queue.volume}%\``, inline: true },
          { name: "🔁 Bucle", value: `\`${queue.repeatMode === 0 ? "Desactivado" : queue.repeatMode === 1 ? "Canción" : "Cola"}\``, inline: true },
          { name: "⏳ Progreso", value: `\`${queue.formattedCurrentTime}\` [${progressString}] \`${song.formattedDuration}\``, inline: false }
        )
        .setThumbnail(song.thumbnail)
        .setColor("#2b2d31")
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Ocurrió un error al obtener la información: ${error.message}`,
        flags: ['Ephemeral'],
      });
    }
  },
};
