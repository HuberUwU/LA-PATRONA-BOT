const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField, ChannelType, Embed } = require("discord.js");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription(`Desbloquea un canal`)
        .addChannelOption(option => option.setName('channel').setDescription(`Canal que quieres 
 desbloquear`).addChannelTypes(ChannelType.GuildText).setRequired(true)),
        async execute(interaction) {

            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: "Tu no tienes los permisos suficientes.", ephemeral: true})
            let channel = interaction.options.getChannel('channel');
            channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: true})

            const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`:white_check_mark: ${channel} fue **desbloqueado** `)

            await interaction.reply({ embeds: [embed]})

        }

}


