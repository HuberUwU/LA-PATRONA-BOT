const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} = require("discord.js");
const ticketSchema = require("../../Schemas/ticketSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Configura el sistema de tickets en el servidor.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("Canal al que será enviado el embed de creación de tickets")
        .setRequired(true)
        .addChannelTypes(0) // Canal de texto
    )
    .addStringOption((option) =>
      option
        .setName("titulo")
        .setDescription("Título del embed del panel de tickets")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descripcion")
        .setDescription("Descripción del embed (puedes usar \\n para saltos de línea)")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("soporte-rol")
        .setDescription("El rol de soporte/administrador que atenderá los tickets")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option.setName("thumbnail").setDescription("Miniatura del embed (imagen)")
    )
    .addAttachmentOption((option) =>
      option.setName("imagen").setDescription("Imagen grande del embed")
    )
    .addStringOption((option) =>
      option.setName("footer").setDescription("Texto del pie de página del embed")
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Color del embed")
        .setChoices(
          { name: "Gris Discord", value: "greyple" },
          { name: "Verde", value: "green" },
          { name: "Rojo", value: "red" },
          { name: "Amarillo", value: "yellow" },
          { name: "Celeste", value: "aqua" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("timestamp")
        .setDescription("Elige si añadir marca de tiempo (timestamp)")
        .setChoices({ name: "Sí", value: "si" }, { name: "No", value: "no" })
    )
    .addStringOption((option) =>
      option.setName("autor").setDescription("Nombre del autor del embed")
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;

    const channel = options.getChannel("canal");
    const titulo = options.getString("titulo");
    const descripcion = options.getString("descripcion").replace(/\\n/g, "\n");
    const soporteRol = options.getRole("soporte-rol");
    const thumbnail = options.getAttachment("thumbnail");
    const imagen = options.getAttachment("imagen");
    const timestamp = options.getString("timestamp");
    const footer = options.getString("footer");
    const color = options.getString("color");
    const autor = options.getString("autor");

    // 1. Validar permisos del bot en el canal de tickets
    const botMember = interaction.guild.members.me;
    if (!botMember.permissionsIn(channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
      return interaction.reply({
        content: `⚠️ El bot no tiene los permisos suficientes en ${channel}. Asegúrate de que pueda **Ver el canal**, **Enviar mensajes** e **Insertar enlaces**.`,
        flags: ['Ephemeral']
      });
    }

    // 2. Validar que los adjuntos sean de tipo imagen
    if (thumbnail && !thumbnail.contentType.startsWith("image/")) {
      return interaction.reply({
        content: "⚠️ El archivo adjunto para la **miniatura (thumbnail)** debe ser una imagen válida.",
        flags: ['Ephemeral']
      });
    }

    if (imagen && !imagen.contentType.startsWith("image/")) {
      return interaction.reply({
        content: "⚠️ El archivo adjunto para la **imagen** debe ser una imagen válida.",
        flags: ['Ephemeral']
      });
    }

    // 3. Crear el embed de soporte
    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(description);

    if (thumbnail) embed.setThumbnail(thumbnail.url);
    if (imagen) embed.setImage(imagen.url);
    if (autor) embed.setAuthor({ name: autor });
    if (footer) embed.setFooter({ text: footer });
    if (timestamp === "si") embed.setTimestamp();

    // Mapear colores de forma limpia
    const colors = {
      greyple: "Greyple",
      green: "Green",
      red: "Red",
      yellow: "Yellow",
      aqua: "Aqua"
    };
    if (color && colors[color]) {
      embed.setColor(colors[color]);
    } else {
      embed.setColor("#2b2d31"); // Color por defecto estético y oscuro
    }

    // 4. Configurar el botón de creación de tickets
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket")
        .setLabel("📨 Crear Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    // 5. Guardar la configuración en la base de datos de forma persistente
    await ticketSchema.findOneAndUpdate(
      { Guild: interaction.guild.id },
      { StaffRole: soporteRol.id },
      { upsert: true, new: true }
    );

    // 6. Enviar panel al canal y responder con confirmación
    await channel.send({ embeds: [embed], components: [button] });

    const successEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ **El sistema de tickets se configuró correctamente en ${channel} con el rol de soporte ${soporteRol}.**`);

    return interaction.reply({
      embeds: [successEmbed],
      flags: ['Ephemeral']
    });
  },
};