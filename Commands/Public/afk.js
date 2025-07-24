const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../Schemas/afkSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Cambia a estado **AFK** en el servidor')
    .addSubcommand(command => command.setName('set').setDescription('Establecer estado AFK').addStringOption(option => option.setName('motivo').setDescription('Mensaje al estar en AFK').setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Quitar el estado de AFK')),
    async execute (interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        const Data = await afkSchema.findOne({ Guild: interaction.guild.id, User: interaction.id});

        switch (sub) {
            case 'set':

            if (Data) return await interaction.reply({content: `Ya estas en estado **AFK** en el servidor.`, ephemeral: true});
            else {
                const message = options.getString('motivo');
                const nickname = interaction.member.nickname || interaction.user.username;
                await afkSchema.create({
                    Guild: interaction.guild.id,
                    User: interaction.user.id,
                    Message: message,
                    Nickname: nickname
                })

                const name = `[AFK] ${nickname}`;
                await interaction.member.setNickname(`${name}`).catch(err => {
                    return;
                })

                const embed = new EmbedBuilder()
                .setColor("#3d0924")
                .setDescription(`
**✅•Ahora estas en AFK**
**❗•Envia un mensaje o usa /afk delete para salir de el modo AFK**`)

                await interaction.reply({ embeds: [embed]});
            }

            break;

            case 'remove':

            if (!Data) return await interaction.reply({ content: `Ya **No** estas **AFK** en este servidor`, ephemeral: true});
            else {
                const nick = Data.Nickname;
                await afkSchema.deleteMany({ Guild: interaction.guild.id, User: interaction.user.id});

                await interaction.member.setNickname(`${nick}`).catch(err => {
                    return;
                })

                const embed = new EmbedBuilder()
                .setColor("#3d0924")
                .setDescription(`**✅•Tu estado de AFK ha sido removido**`)

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }
}