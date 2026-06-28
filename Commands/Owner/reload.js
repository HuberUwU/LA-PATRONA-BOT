const { ChatInputCommandInteraction, SlashCommandBuilder, Client, EmbedBuilder } = require("discord.js");
const { loadCommands } = require("../../Handlers/commandHandler");
const { loadEvents } = require("../../Handlers/eventHandler");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Recarga los comandos o eventos del bot (Solo Desarrollador).")
    .addSubcommand((options) => options.setName("events").setDescription("Recarga todos los manejadores de eventos."))
    .addSubcommand((options) => options.setName("commands").setDescription("Recarga todos los comandos de barra.")),

  /** 
  * @param {ChatInputCommandInteraction} interaction
  * @param {Client} client
  */
  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🔄 Sistema Recargado")
      .setTimestamp();

    try {
      switch (subCommand) {
        case "events": {
          await loadEvents(client);
          embed.setDescription("✅ Todos los **manejadores de eventos** han sido recargados y cargados exitosamente.");
          break;
        }
        case "commands": {
          await loadCommands(client);
          embed.setDescription("✅ Todos los **comandos de barra** han sido reconstruidos y cargados exitosamente.");
          break;
        }
      }
      return interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Error al recargar")
        .setDescription(`Ocurrió un error al intentar recargar **${subCommand}**:\n\`\`\`js\n${error.message}\n\`\`\``);
      return interaction.reply({ embeds: [errorEmbed], flags: ["Ephemeral"] });
    }
  }
};