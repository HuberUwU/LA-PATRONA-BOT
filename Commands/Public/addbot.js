const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addbot")
        .setDescription("Enlace al bot"),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setDescription(`¡Hola! Aquí tienes mi enlace de invitación.`)
            .setColor("Random"); //Puedes definir un color como tal

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Agregar")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.com/oauth2/authorize?client_id=1191953720699793512&scope=bot&permissions=2147483656"), //enlace al bot
            new ButtonBuilder()
                .setLabel("Eliminar mensaje")
                .setStyle(ButtonStyle.Danger)
                .setCustomId('deleteButton')
        );
        interaction.reply({ embeds: [embed], components: [row], ephemeral: false }); // si pones el ephemeral en true usa el codigo de abajo

        // Agregar un listener para manejar la interacción del botón
        const filter = interaction => interaction.customId === 'deleteButton' && interaction.user.id === interaction.member.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 }); // 60 segundos = 1  min // 120000 = 2  min

        collector.on('collect', async interaction => {
            // Eliminar el mensaje cuando se hace clic en el botón de eliminar
            interaction.message.delete();
        });

        collector.on('end', collected => {
            // Puedes realizar acciones adicionales cuando el colector termina (opcional)
        });
    },
};