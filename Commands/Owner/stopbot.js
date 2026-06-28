const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("stopbot")
    .setDescription("Apaga el proceso del bot de forma controlada (Solo Desarrollador).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🛑 Apagado del Sistema")
      .setDescription(
        `El bot ha iniciado el proceso de apagado solicitado por el desarrollador.\n\n` +
        `**• Solicitado por:** ${interaction.user}\n` +
        `**• Estado:** Desconectando servicios...`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });

    // Esperar 1.5 segundos para asegurar que Discord registre y renderice la respuesta antes de terminar el proceso
    setTimeout(() => {
      console.log(`[Shutdown] Proceso terminado a petición de ${interaction.user.tag}`);
      process.exit(0); // Cierre exitoso controlado (código 0)
    }, 1500);
  },
};