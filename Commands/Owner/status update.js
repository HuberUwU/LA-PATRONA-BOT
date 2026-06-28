const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Actualiza la presencia y estado del bot (Solo Desarrollador).")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("activity")
        .setDescription("Actualiza la actividad de visualización del bot.")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("El tipo de actividad")
            .setRequired(true)
            .addChoices(
              { name: "Jugando", value: "Playing" },
              { name: "Stremeando", value: "Streaming" },
              { name: "Escuchando", value: "Listening" },
              { name: "Viendo", value: "Watching" },
              { name: "Compitiendo", value: "Competing" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("activity")
            .setDescription("El texto de la actividad")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Actualiza el estado de conexión del bot.")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Elige el estado de conexión")
            .setRequired(true)
            .addChoices(
              { name: "En línea", value: "online" },
              { name: "Inactivo", value: "idle" },
              { name: "No molestar", value: "dnd" },
              { name: "Invisible", value: "invisible" }
            )
        )
    ),

  async execute(interaction, client) {
    const { options } = interaction;

    const sub = options.getSubcommand();
    const type = options.getString("type");
    const activityText = options.getString("activity");

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("⚙️ Presencia Actualizada")
      .setTimestamp();

    try {
      if (sub === "activity") {
        let typeLabel = "";
        let activityType;

        switch (type) {
          case "Playing":
            activityType = ActivityType.Playing;
            typeLabel = "Jugando a";
            break;
          case "Streaming":
            activityType = ActivityType.Streaming;
            typeLabel = "Transmitiendo";
            break;
          case "Listening":
            activityType = ActivityType.Listening;
            typeLabel = "Escuchando";
            break;
          case "Watching":
            activityType = ActivityType.Watching;
            typeLabel = "Viendo";
            break;
          case "Competing":
            activityType = ActivityType.Competing;
            typeLabel = "Compitiendo en";
            break;
        }

        if (type === "Streaming") {
          client.user.setActivity(activityText, {
            type: activityType,
            url: "https://www.twitch.tv/huberuwu",
          });
        } else {
          client.user.setActivity(activityText, {
            type: activityType,
          });
        }

        embed.setDescription(`La actividad del bot se ha actualizado exitosamente.\n\n**• Tipo:** \`${typeLabel}\`\n**• Texto:** \`${activityText}\``);
      } else if (sub === "status") {
        client.user.setPresence({ status: type });

        const statusLabels = {
          online: "En línea 🟢",
          idle: "Inactivo 🟡",
          dnd: "No molestar 🔴",
          invisible: "Invisible ⚫",
        };

        embed.setDescription(`El estado de conexión del bot se ha actualizado exitosamente.\n\n**• Nuevo Estado:** \`${statusLabels[type] || type}\``);
      }

      return interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Error al actualizar presencia")
        .setDescription(`Ocurrió un error inesperado al intentar actualizar la presencia:\n\`\`\`js\n${err.message}\n\`\`\``);
      return interaction.reply({ embeds: [errorEmbed], flags: ["Ephemeral"] });
    }
  },
};
