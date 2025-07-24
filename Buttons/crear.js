const { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: `ticket`,
    },
    async execute(interaction, client) {

      const staff = interaction.guild.roles.cache.get("1207227372051369985");

      const canal = await interaction.guild.channels.create({
        name: `ticket- ${interaction.user.tag}`,
        type: ChannelType.GuildText,
      });

      canal.permissionOverwrites.create(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
      });

      canal.permissionOverwrites.create(canal.guild.roles.everyone, {
        ViewChannel: false,
        SendMessages: false,
      });


      await interaction.reply({
        content: `✅ **El ticket fue abierto correctamente en <#${canal.id}>**`,
        ephemeral: true,
      });

        const embed = new EmbedBuilder()
        .setTitle(`Tickets | ${client.user.username}`)
        .setDescription(`Bienvenido al ticket <@${interaction.user.id}>\nEspera a un staff...`)
        .setColor("Aqua")

        const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("close")
        .setLabel("🗑Cerrar ticket")
        .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
        .setCustomId("claim")
        .setLabel("📌Claim Ticket")
        .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
        .setCustomId("transcript")
        .setLabel("📜Transcript")
        .setStyle(ButtonStyle.Danger),


      )


    canal.send({ embeds: [embed], components: [button] });
  }
    }