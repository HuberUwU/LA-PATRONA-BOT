const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, UserFlags, version } = require("discord.js");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botstats")
    .setDescription("Muestra las estadísticas detalladas y del sistema del bot."),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await client.user.fetch();
    await client.application.fetch();

    // Estado de la Base de datos
    const dbStatus = ["Desconectado", "Conectado", "Conectando", "Desconectando"];
    const databaseState = dbStatus[connection.readyState] || "Desconocido";

    // Manejo robusto del Owner/Equipo de la aplicación
    const owner = client.application.owner;
    let ownerName = "Ninguno";
    if (owner) {
      if (owner.tag) {
        ownerName = owner.tag;
      } else if (owner.name) {
        ownerName = owner.name; // Nombre del equipo
      } else if (owner.ownerId) {
        const ownerUser = await client.users.fetch(owner.ownerId).catch(() => null);
        if (ownerUser) ownerName = ownerUser.tag;
      }
    }

    // Datos del Sistema Operativo y Hardware
    const systemPlatform = os.type().replace("Windows_NT", "Windows").replace("Darwin", "macOS");
    const cpuModel = os.cpus()[0] ? os.cpus()[0].model.trim() : "Desconocido";
    const cpuCores = os.cpus().length;

    // Uso de Memoria
    const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

    // Contadores del Bot
    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalChannels = client.channels.cache.size;
    const isVerified = client.user.flags & UserFlags.VerifiedBot ? "Sí" : "No";

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle(`📊 Estadísticas de ${client.user.username}`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(client.application.description || "Información técnica y estadísticas en tiempo real sobre el rendimiento del bot.")
      .addFields(
        {
          name: "🤖 Información del Bot",
          value: `**• Cliente:** ${client.user.tag}\n` +
                 `**• ID del Bot:** \`${client.user.id}\`\n` +
                 `**• Verificado:** ${isVerified}\n` +
                 `**• Creado:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:R>\n` +
                 `**• Creador:** \`${ownerName}\` (ID: \`${client.application.owner?.id || "N/A"}\`)\n` +
                 `**• Base de Datos:** \`${databaseState}\``,
          inline: false
        },
        {
          name: "📈 Actividad y Estadísticas",
          value: `**• Servidores:** \`${totalGuilds}\`\n` +
                 `**• Usuarios:** \`${totalUsers}\`\n` +
                 `**• Canales:** \`${totalChannels}\`\n` +
                 `**• Comandos de Barra:** \`${client.commands.size}\`\n` +
                 `**• Ping WebSocket:** \`${client.ws.ping}ms\`\n` +
                 `**• Activo desde:** <t:${Math.floor(client.readyTimestamp / 1000)}:F> (<t:${Math.floor(client.readyTimestamp / 1000)}:R>)`,
          inline: false
        },
        {
          name: "💻 Sistema y Servidor",
          value: `**• SO:** \`${systemPlatform}\` (${os.arch()})\n` +
                 `**• CPU:** \`${cpuModel} (${cpuCores} núcleos)\`\n` +
                 `**• RAM en uso:** \`${memoryUsed} MB\` / \`${totalMemory} GB\`\n` +
                 `**• Node.js:** \`${process.version}\`\n` +
                 `**• Discord.js:** \`v${version}\``,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: `Pedido por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    return interaction.reply({ embeds: [embed] });
  }
};
