const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addbot")
        .setDescription("Obtén el enlace de invitación oficial del bot y soporte."),
    async execute(interaction, client) {
        // Embed estético premium de presentación
        const embed = new EmbedBuilder()
            .setTitle(`🤖 ¡Invítame a tu servidor!`)
            .setDescription(
                `Gracias por querer añadir a **${client.user.username}** a tu comunidad.\n\n` +
                `✨ **¿Qué ofrezco?**\n` +
                `• 🎵 Sistema de música premium (DisTube).\n` +
                `• 🎫 Sistema de soporte por tickets dinámico.\n` +
                `• ⚙️ Configuración de autoroles y sistema AFK.\n` +
                `• 🛠️ Comandos de moderación avanzados.`
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setColor("#2b2d31")
            .setFooter({ text: `${client.user.username} || Enlace oficial`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        // Botones organizados, con emojis y variables dinámicas
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Invitar Bot")
                .setStyle(ButtonStyle.Link)
                .setEmoji("🤖")
                .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2147483656`),
            new ButtonBuilder()
                .setLabel("Servidor de Soporte")
                .setStyle(ButtonStyle.Link)
                .setEmoji("🎡")
                .setURL("https://discord.gg/huberuwu"),
            new ButtonBuilder()
                .setLabel("Eliminar mensaje")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🗑️")
                .setCustomId('deleteButton')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
        const response = await interaction.fetchReply();

        // Filtro para que solo el creador del comando pueda eliminar el mensaje
        const filter = clickInteraction => clickInteraction.customId === 'deleteButton' && clickInteraction.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async clickInteraction => {
            // Agradecemos la interacción antes de borrar el mensaje para evitar fallos de interacción en color rojo
            await clickInteraction.deferUpdate().catch(() => { });
            await clickInteraction.message.delete().catch(() => { });
        });

        collector.on('end', async (collected, reason) => {
            // Si el mensaje no fue borrado, desactivamos el botón de eliminar tras 60 segundos
            if (reason !== 'messageDelete') {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Invitar Bot")
                        .setStyle(ButtonStyle.Link)
                        .setEmoji("🤖")
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2147483656`),
                    new ButtonBuilder()
                        .setLabel("Servidor de Soporte")
                        .setStyle(ButtonStyle.Link)
                        .setEmoji("🎡")
                        .setURL("https://discord.gg/huberuwu"),
                    new ButtonBuilder()
                        .setLabel("Eliminar (Expirado)")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️")
                        .setCustomId('deleteButton')
                        .setDisabled(true)
                );
                await interaction.editReply({ components: [disabledRow] }).catch(() => { });
            }
        });
    },
};