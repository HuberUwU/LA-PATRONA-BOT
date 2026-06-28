const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("servers")
    .setDescription("Muestra la lista de servidores en los que está el bot. (Solo Desarrollador)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    const client = interaction.client;
    const guilds = client.guilds.cache;

    // Calcular estadísticas globales
    const totalServers = guilds.size;
    const totalMembers = guilds.reduce((acc, g) => acc + g.memberCount, 0);
    const avgMembers = totalServers > 0 ? Math.round(totalMembers / totalServers) : 0;

    // Obtener los servidores top (hasta 25 para mantenerlo legible y estético en la descripción)
    const sortedGuilds = guilds.sort((a, b) => b.memberCount - a.memberCount).first(25);

    let serverList = sortedGuilds
      .map((guild, index) => {
        return `\`${String(index + 1).padStart(2, "0")}.\` **${guild.name}**\n` +
               `  ↳ 👥 Miembros: \`${guild.memberCount.toLocaleString()}\` | ID: \`${guild.id}\``;
      })
      .join("\n\n");

    if (totalServers > 25) {
      serverList += `\n\n*y ${totalServers - 25} servidores más...*`;
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌐 Servidores de la Red")
      .setDescription(
        `### 📊 Estadísticas Globales\n` +
        `• **Total de Servidores:** \`${totalServers}\`\n` +
        `• **Total de Miembros:** \`${totalMembers.toLocaleString()}\`\n` +
        `• **Promedio de Miembros:** \`${avgMembers.toLocaleString()}\` por servidor\n\n` +
        `### 🏆 Top 25 Servidores por Miembros\n` +
        (serverList || "*No hay servidores registrados.*")
      )
      .setTimestamp()
      .setFooter({
        text: `Consultado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    await interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
  }
};