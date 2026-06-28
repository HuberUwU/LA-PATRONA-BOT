const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (client) => {
  const getButtons = () => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("music_pause")
        .setEmoji("⏯️")
        .setLabel("Pausar/Reanudar")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music_skip")
        .setEmoji("⏭️")
        .setLabel("Saltar")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("music_stop")
        .setEmoji("⏹️")
        .setLabel("Detener")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("music_loop")
        .setEmoji("🔁")
        .setLabel("Bucle")
        .setStyle(ButtonStyle.Success)
    );
  };

  client.distube
    .on("playSong", (queue, song) => {
      const embed = new EmbedBuilder()
        .setTitle(`🎵 Reproduciendo ahora`)
        .setDescription(`[${song.name}](${song.url})`)
        .addFields(
          { name: "👤 Solicitado por", value: `${song.user}`, inline: true },
          { name: "⏱️ Duración", value: `\`${song.formattedDuration}\``, inline: true },
          { name: "📶 Volumen", value: `\`${queue.volume}%\``, inline: true }
        )
        .setImage(song.thumbnail)
        .setColor("#2b2d31")
        .setFooter({ text: `Canal de voz: ${queue.voiceChannel.name}` })
        .setTimestamp();

      queue.textChannel.send({ embeds: [embed], components: [getButtons()] });
    })
    .on("addSong", (queue, song) => {
      const embed = new EmbedBuilder()
        .setDescription(`✅ Añadida a la cola: **[${song.name}](${song.url})** (\`${song.formattedDuration}\`)`)
        .setColor("Green");

      queue.textChannel.send({ embeds: [embed] });
    })
    .on("addList", (queue, playlist) => {
      const embed = new EmbedBuilder()
        .setDescription(`✅ Añadida lista: **[${playlist.name}](${playlist.url})** (\`${playlist.songs.length}\` canciones)`)
        .setColor("Green");

      queue.textChannel.send({ embeds: [embed] });
    })
    .on("error", (channel, error) => {
      console.error("DisTube Error:", error);
      const embed = new EmbedBuilder()
        .setDescription(`❌ Ocurrió un error inesperado al reproducir música.`)
        .setColor("Red");

      if (channel && typeof channel.send === "function") {
        channel.send({ embeds: [embed] }).catch(() => {});
      }
    })
    .on("empty", (queue) => {
      const embed = new EmbedBuilder()
        .setDescription(`⚠️ El canal de voz está vacío, abandonando el canal.`)
        .setColor("Orange");

      queue.textChannel.send({ embeds: [embed] }).catch(() => {});
      queue.voice.leave();
    })
    .on("finish", (queue) => {
      const embed = new EmbedBuilder()
        .setDescription(`🏁 La lista de reproducción ha finalizado.`)
        .setColor("Blue");

      queue.textChannel.send({ embeds: [embed] }).catch(() => {});
      queue.voice.leave();
    });
};
