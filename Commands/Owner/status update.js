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
    .setDescription("Actualice las presencias del bot.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("activity")
        .setDescription("Actualice la actividad del bot (OWNER)")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Elige una actividad.")
            .setRequired(true)
            .addChoices(
              { name: "Jugando", value: "Jugando" },
              { name: "Stremeando", value: "Stremeando" },
              { name: "Escuchando", value: "Escuchando" },
              { name: "Viendo", value: "Viendo" },
              { name: "Compitiendo", value: "Compitiendo" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("activity")
            .setDescription("Establece tu actividad actual.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Actualizar el estado del bot (OWNER)")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Elige un estado.")
            .setRequired(true)
            .addChoices(
              { name: "En linea", value: "online" },
              { name: "Inactivo", value: "idle" },
              { name: "No molestar", value: "dnd" },
              { name: "Invisible", value: "invisible" }
            )
        )
    ),
  async execute(interaction, client) {
    const { options } = interaction;

    const sub = options.getSubcommand(["activity", "status"]);
    const type = options.getString("type");
    const activity = options.getString("activity");

    try {
      switch (sub) {
        case "activity":
          switch (type) {
            case "Jugando":
              client.user.setActivity(activity, { type: ActivityType.Playing });
              break;
            case "Stremeando":
              client.user.setActivity(activity, {
                type: ActivityType.Streaming,
                url: "https://www.twitch.tv/huberuwu", // De lo contrario no funcionara
              });
              break;
            case "Escuchando":
              client.user.setActivity(activity, {
                type: ActivityType.Listening,
              });
              break;
            case "Viendo":
              client.user.setActivity(activity, {
                type: ActivityType.Watching,
              });
              break;
            case "Compitiendo":
              client.user.setActivity(activity, {
                type: ActivityType.Competing,
              });
              break;
          }
        case "status":
          client.user.setPresence({ status: type });
          break;
      }
    } catch (err) {
      console.log(err);
    }

    const embed = new EmbedBuilder();

    return interaction.reply({
      embeds: [
        embed.setDescription(`_Actualizó con éxito su ${sub} a **${type}**._`),
      ],
    });
  },
};
