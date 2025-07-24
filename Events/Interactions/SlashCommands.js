const { ChatInputCommandInteraction } = require("discord.js");
const cooldown = new Set()
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()){

    const command = client.commands.get(interaction.commandName);
      const cooldowns = await command.Cooldown
    if (!command)
      return interaction.reply({
        content: "This command is outdated.",
        ephermal: true,
      });

    if (command.developer && interaction.user.id !== "457686961151410176")
      return interaction.reply({
        content: "Comando solo disponible para el desarrollador.",
        ephermal: true,
      });

      if (command.Cooldown && cooldown.has(interaction.user.id)) {
        const embed = new EmbedBuilder()
          .setDescription(`Este comando tiene cooldown tienes que esperar un poco para volver a utilizar este comando | Tienes que esperar ${cooldowns / 1000} segundos`)

        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      cooldown.add(interaction.user.id)
      try {
        setTimeout(() => {
          cooldown.delete(interaction.user.id)
        }, cooldowns)
      } catch (error) {
        return;
      }

    command.execute(interaction, client);
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return new Error(`No existe el boton`);

      try {
        await button.execute(interaction, client);
      } catch (err) {
        console.error(err);
      }
    } else {
      return;
    }
  },
};