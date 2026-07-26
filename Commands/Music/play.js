const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce una canción o playlist (YouTube, Spotify, SoundCloud o búsquedas)")
    .addStringOption((option) =>
      option
        .setName("cancion")
        .setDescription("Link o título de la canción.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const query = interaction.options.getString("cancion");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "⚠️ Debes estar en un canal de voz para reproducir música.",
        flags: ['Ephemeral'],
      });
    }

    // Comprobar si el bot ya está en otro canal
    const botVoice = interaction.guild.members.me.voice.channel;
    if (botVoice && botVoice.id !== voiceChannel.id) {
      return interaction.reply({
        content: `⚠️ Ya estoy reproduciendo música en el canal **${botVoice.name}**. ¡Únete a ese canal!`,
        flags: ['Ephemeral'],
      });
    }

    await interaction.reply({ content: "🔍 Buscando tu música...", flags: ['Ephemeral'] });

    let playUrl = query;
    const isUrl = query.startsWith("http://") || query.startsWith("https://");

    if (!isUrl) {
      try {
        const axios = require("axios");
        const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          timeout: 4000
        });
        const match = res.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
        if (match) {
          playUrl = `https://www.youtube.com/watch?v=${match[1]}`;
        }
      } catch (err) {
        console.error("Fallo en la búsqueda manual de YouTube:", err.message);
      }
    }

    try {
      await client.distube.play(voiceChannel, playUrl, {
        member: interaction.member,
        textChannel: interaction.channel,
        metadata: { interaction }
      });
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: `❌ Ocurrió un error al intentar reproducir la canción: ${error.message}`,
        flags: ['Ephemeral'],
      }).catch(() => { });
    }
  },

  /**
   * @param {import("discord.js").AutocompleteInteraction} interaction
   * @param {Client} client
   */
  async autocomplete(interaction, client) {
    const focusedValue = interaction.options.getFocused();
    if (!focusedValue) {
      return interaction.respond([]);
    }

    if (focusedValue.startsWith("http://") || focusedValue.startsWith("https://")) {
      return interaction.respond([{ name: focusedValue.slice(0, 100), value: focusedValue }]);
    }

    const choices = [];
    const axios = require("axios");

    // 1. Obtener canciones de Spotify (resultados oficiales y ordenados primero)
    try {
      let token = client.spotifyToken;
      let expires = client.spotifyTokenExpires;

      if (!token || !expires || Date.now() >= expires) {
        const id = client.config.SpotifyID;
        const secret = client.config.SpotifySecret;
        if (id && secret) {
          const auth = Buffer.from(`${id}:${secret}`).toString("base64");
          const tokenRes = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 2000
          });
          token = tokenRes.data.access_token;
          client.spotifyToken = token;
          client.spotifyTokenExpires = Date.now() + tokenRes.data.expires_in * 1000 - 60000;
        }
      }

      if (token) {
        const spotifySearch = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(focusedValue)}&type=track&limit=10`, {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          timeout: 2000
        });
        if (spotifySearch.data && spotifySearch.data.tracks && Array.isArray(spotifySearch.data.tracks.items)) {
          spotifySearch.data.tracks.items.forEach(track => {
            const artists = track.artists.map(a => a.name).join(", ");
            const durationMs = track.duration_ms;
            const minutes = Math.floor(durationMs / 60000);
            const seconds = ((durationMs % 60000) / 1000).toFixed(0);
            const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            choices.push({
              name: `🟢 [Spotify] ${track.name} - ${artists} [${durationStr}]`.slice(0, 100),
              value: track.external_urls.spotify
            });
          });
        }
      }
    } catch (err) {
      console.error("Error al buscar en Spotify en autocomplete:", err.message);
    }

    // 2. Obtener canciones de SoundCloud (resultados reales de audio)
    try {
      const scPlugin = client.distube.plugins.find(p => p.constructor.name === "SoundCloudPlugin");
      if (scPlugin) {
        const scResults = await scPlugin.search(focusedValue, "track", 8);
        scResults.forEach(song => {
          choices.push({
            name: `🎵 [SC] ${song.name} - ${song.uploader.name} [${song.formattedDuration}]`.slice(0, 100),
            value: song.url
          });
        });
      }
    } catch (err) {
      // Ignorar errores silenciosamente
    }

    // 3. Obtener sugerencias de búsqueda de YouTube (búsquedas recomendadas rápidas)
    try {
      const ytSuggest = await axios.get(`http://suggestqueries.google.com/complete/search?client=chrome&ds=yt&hl=es&q=${encodeURIComponent(focusedValue)}`, { timeout: 1500 });
      if (ytSuggest.data && Array.isArray(ytSuggest.data[1])) {
        ytSuggest.data[1].slice(0, 8).forEach(query => {
          if (!choices.some(c => c.name.toLowerCase().includes(query.toLowerCase()))) {
            choices.push({
              name: `🔍 ${query}`.slice(0, 100),
              value: query
            });
          }
        });
      }
    } catch (err) {
      // Ignorar
    }

    await interaction.respond(choices.slice(0, 25)).catch(() => { });
  },
};
