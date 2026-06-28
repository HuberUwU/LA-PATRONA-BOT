const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-embed')
    .setDescription('Crea y envía un mensaje Embed personalizado en este canal.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('title')
        .setDescription('El título del embed.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('La descripción / contenido principal del embed.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Elige un color para el borde lateral.')
        .setRequired(true)
        .setChoices(
          { name: "Morado", value: "8A2BE2" },
          { name: "Verde", value: "52A666" },
          { name: "Rojo", value: "FF0000" },
          { name: "Amarillo", value: "FFF68F" },
          { name: "Azul", value: "6495ED" },
          { name: "Naranja", value: "FF8D00" },
          { name: "Negro", value: "000001" }
        )
    )
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL de la imagen grande de la parte inferior (Opcional).')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('URL de la miniatura pequeña de la parte superior derecha (Opcional).')
        .setRequired(false)
    ),

  async execute(interaction) {
    const { options } = interaction;

    // 1. Validar permisos del bot en el canal actual
    const botMember = interaction.guild.members.me;
    if (!botMember.permissionsIn(interaction.channel).has(PermissionFlagsBits.SendMessages) ||
        !botMember.permissionsIn(interaction.channel).has(PermissionFlagsBits.EmbedLinks)) {
      return interaction.reply({
        content: "⚠️ El bot no tiene los permisos necesarios (**Enviar Mensajes** y **Insertar Enlaces**) en este canal.",
        flags: ['Ephemeral']
      });
    }

    const title = options.getString('title');
    const description = options.getString('description').replace(/\\n/g, '\n'); // Permitir saltos de línea ingresando \n
    const color = options.getString('color');
    const image = options.getString('image')?.trim();
    const thumbnail = options.getString('thumbnail')?.trim();

    // 2. Validar formato de URLs opcionales
    const urlRegex = /^https?:\/\/.+\..+/i;
    if (image && !urlRegex.test(image)) {
      return interaction.reply({
        content: "⚠️ La URL de la **imagen** es inválida. Asegúrate de que empiece con `http://` o `https://`.",
        flags: ['Ephemeral']
      });
    }

    if (thumbnail && !urlRegex.test(thumbnail)) {
      return interaction.reply({
        content: "⚠️ La URL de la **miniatura (thumbnail)** es inválida. Asegúrate de que empiece con `http://` o `https://`.",
        flags: ['Ephemeral']
      });
    }

    // 3. Construir el embed de forma segura
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(`#${color}`)
      .setTimestamp()
      .setFooter({
        text: `Publicado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    try {
      await interaction.channel.send({ embeds: [embed] });
      
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setDescription("✅ **El embed ha sido creado y enviado en este canal correctamente.**");

      return interaction.reply({ embeds: [successEmbed], flags: ['Ephemeral'] });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: `❌ Hubo un error al intentar enviar el embed: \`${error.message}\``,
        flags: ['Ephemeral']
      });
    }
  },
};