const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../Schemas/afkSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Cambia a estado **AFK** en el servidor')
        .addSubcommand(command => command.setName('set').setDescription('Establecer estado AFK').addStringOption(option => option.setName('motivo').setDescription('Mensaje al estar en AFK').setRequired(true)))
        .addSubcommand(command => command.setName('remove').setDescription('Quitar el estado de AFK')),
    async execute(interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        const Data = await afkSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        switch (sub) {
            case 'set':

                if (Data) return await interaction.reply({ content: `Ya estas en estado **AFK** en el servidor.`, flags: ['Ephemeral'] });
                else {
                    const message = options.getString('motivo');
                    const nickname = interaction.member.nickname; // Guardar el apodo original (puede ser null)
                    await afkSchema.create({
                        Guild: interaction.guild.id,
                        User: interaction.user.id,
                        Message: message,
                        Nickname: nickname
                    })

                    // Cambiar nickname agregando [AFK] controlando el límite de 32 caracteres de Discord
                    const currentName = nickname || interaction.user.username;
                    let afkName = `[AFK] ${currentName}`;
                    if (afkName.length > 32) {
                        afkName = afkName.substring(0, 29) + "...";
                    }

                    await interaction.member.setNickname(afkName).catch(err => {});

                    const embed = new EmbedBuilder()
                        .setColor("#3d0924")
                        .setDescription(`
**✅•Ahora estas en AFK**
**❗•Envia un mensaje o usa /afk remove para salir de el modo AFK**`)

                    await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
                }

                break;

            case 'remove':

                if (!Data) return await interaction.reply({ content: `Ya **No** estas **AFK** en este servidor`, flags: ['Ephemeral'] });
                else {
                    const nick = Data.Nickname || null; // Si es null, Discord limpia el apodo y restaura el nombre por defecto
                    await afkSchema.deleteMany({ Guild: interaction.guild.id, User: interaction.user.id });

                    await interaction.member.setNickname(nick).catch(err => {});

                    const embed = new EmbedBuilder()
                        .setColor("#3d0924")
                        .setDescription(`**✅•Tu estado de AFK ha sido removido**`)

                    await interaction.reply({ embeds: [embed], flags: ['Ephemeral'] });
                }
        }
    }
}