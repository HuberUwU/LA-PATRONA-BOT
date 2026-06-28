const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce una canción o playlist (YouTube, Spotify, SoundCloud o búsquedas)")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Nombre o enlace de la canción/lista")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const query = interaction.options.getString("query");
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

    try {
      await client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
        metadata: { interaction }
      });
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: `❌ Ocurrió un error al intentar reproducir la canción: ${error.message}`,
        flags: ['Ephemeral'],
      }).catch(() => {});
    }
  },
};
