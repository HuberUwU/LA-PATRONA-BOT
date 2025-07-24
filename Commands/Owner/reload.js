const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsßits, Client} = require(`discord.js`);

const { loadCommands } = require(`../../Handlers/commandHandler`)
const { loadEvents } = require(`../../Handlers/eventHandler`)

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName(`reload`)
    .setDescription (`Recarga tus comandos/eventos`)
    .addSubcommand((options) => options.setName(`events`).setDescription(`Recarga los eventos (Owner)`))
    .addSubcommand((options) => options.setName(`commands`).setDescription(`Recarga los comandos (Owner)`)),

  /** 
  *
  * @param {ChatInputCommandInteraction} interaction
  * @param {Client} client
  */
  
  execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case "events": {
        for (const [key, value] of client.events)
          client.removeListener(`${key}`, value, true);
        loadEvents(client);
        interaction.reply({content: `Tus eventos fueron recargados`, ephemeral: true});
      } 
      break;
      case "commands": {
        loadCommands(client);
        interaction.reply({content: `Tus comandos fueron recargados`, ephemeral: true});
      }
      break;
    }
  }
};