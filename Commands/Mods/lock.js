const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField, ChannelType, Embed } = require("discord.js");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription(`Bloquea un canal`)
        .addChannelOption(option => option.setName('channel').setDescription(`Canl que deseas bloqeuar`).addChannelTypes(ChannelType.GuildText).setRequired(true)),
        async execute(interaction) {

            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: "Tu no tienes suficientes permisos.", ephemeral: true})
            let channel = interaction.options.getChannel('channel');
            channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false})

            const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`:white_check_mark: ${channel} fue **bloqueado** `)

            await interaction.reply({ embeds: [embed]})

        }

}


