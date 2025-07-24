const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Muestra los servidores en los que está el bot y la cantidad de miembros que tienen. (OWNER)'),

  async execute(interaction = new CommandInteraction()) {

    const servers = interaction.client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).first(99);

    const serverListEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Lista de Servidores')
      .setDescription(`Estos son los ${servers.length} servidores en los que estoy:`);

    servers.forEach((server, index) => {
      serverListEmbed.addFields({ name: `${index + 1}. ${server.name}`, value: `${server.memberCount} miembros` });
    });

    await interaction.reply({ embeds: [serverListEmbed], ephemeral: true });
  }
};