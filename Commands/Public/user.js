const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Mira la información, avatar o banner de un miembro.")
    .addSubcommand(subcommand =>
      subcommand
        .setName("info")
        .setDescription("Muestra información detallada sobre un miembro del servidor.")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("El miembro del cual quieres ver la información")
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("avatar")
        .setDescription("Muestra tu avatar o el del miembro que indiques.")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("El miembro cuyo avatar quieres ver")
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("banner")
        .setDescription("Muestra tu banner o el del miembro que indiques.")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("El miembro cuyo banner quieres ver")
            .setRequired(false)
        )
    )
    .setDMPermission(false),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user") || interaction.user;

    // Badges / Insignias de Discord con formato Emoji
    const badges = {
      Staff: "<:staff:1196737465323622450>",
      Partner: "<:new_discord_partner:1196722483387174913>",
      Hypesquad: "<:HypeSquad_Events:1196738139612524556>",
      BugHunterLevel1: "<:BugHunter:1196736075696189490>",
      HypeSquadOnlineHouse1: "<:HypeSquad_Bravery:1196738483478331404>",
      HypeSquadOnlineHouse2: "<:hypesquad_brilliance:1196739316072853564>",
      HypeSquadOnlineHouse3: "<:hypesquad_balance:1196739597162516581>",
      PremiumEarlySupporter: "<:emoji_13:1069621437792530482>",
      BugHunterLevel2: "<:Bughunter_Yellow:1196735969420906626>",
      VerifiedDeveloper: "<:emoji_121:1196735452397453312>",
      ActiveDeveloper: "<:emoji_120:1196734762908401784>",
    };

    const formatter = new Intl.ListFormat("es-ES", { style: "narrow", type: "conjunction" });

    // Intentar obtener los datos del miembro dentro de la guild
    let member;
    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch {
      // El usuario puede no estar en el servidor actual
    }

    switch (sub) {
      case "info": {
        if (!member) {
          const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription("El usuario especificado no se encuentra en este servidor.")
            .setColor("Red");
          return interaction.reply({ embeds: [errorEmbed], flags: ["Ephemeral"] });
        }

        const userFlags = user.flags?.toArray() || [];
        const badgesList = userFlags.map(flag => badges[flag]).filter(Boolean);
        const badgesText = badgesList.length ? ` ${formatter.format(badgesList)}` : "";

        // Obtener banner mediante API fetch forzado
        const fetchedUser = await client.users.fetch(user.id, { force: true });
        const banner = fetchedUser.bannerURL({ size: 4096 });



        // Determinar posición de ingreso en el servidor
        const joinPosition = await interaction.guild.members.fetch().then(members => 
          members.sort((a, b) => a.joinedAt - b.joinedAt).map(m => m.id).indexOf(member.id) + 1
        );

        // Filtrar y ordenar roles
        const roles = member.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position);

        const rolesList = roles.size > 0 
          ? roles.map(role => role.toString()).slice(0, 5).join(", ") + (roles.size > 5 ? ` y ${roles.size - 5} más...` : "")
          : "Ninguno";

        const isOwner = member.id === interaction.guild.ownerId;
        const ownerEmoji = isOwner ? "👑 " : "";

        const embed = new EmbedBuilder()
          .setAuthor({ name: `Información de la Cuenta`, iconURL: member.displayAvatarURL() })
          .setTitle(`${ownerEmoji}${user.tag}${badgesText}`)
          .setColor(member.displayHexColor || "#2b2d31")
          .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 512 }))
          .setDescription(`Estadísticas y datos del usuario en Discord.`)
          .addFields(
            {
              name: "👤 Cuenta de Discord",
              value: `**• Nombre:** ${user.username}\n**• ID:** \`${user.id}\`\n**• Creado:** <t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
              inline: false
            },
            {
              name: "🛡️ Miembro del Servidor",
              value: `**• Apodo:** ${member.nickname || "Ninguno"}\n**• Unido:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)\n**• Número de ingreso:** \`#${joinPosition}\`\n**• Boosteando:** ${member.premiumSince ? `Sí, desde <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : "No"}`,
              inline: false
            },
            {
              name: `🎭 Roles (${roles.size})`,
              value: rolesList,
              inline: false
            }
          )
          .setTimestamp();

        if (banner) {
          embed.setImage(banner);
        }

        return interaction.reply({ embeds: [embed] });
      }

      case "avatar": {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL() })
          .setTitle(`🖼️ Avatar de ${user.username}`)
          .setColor("#2b2d31")
          .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
          .setTimestamp()
          .setFooter({ text: `Pedido por ${interaction.user.tag}` });

        return interaction.reply({ embeds: [embed] });
      }

      case "banner": {
        const fetchedUser = await client.users.fetch(user.id, { force: true });
        const banner = fetchedUser.bannerURL({ size: 4096 });

        if (!banner) {
          const errorEmbed = new EmbedBuilder()
            .setDescription(`⚠️ **${user.username}** no tiene un banner configurado en su cuenta de Discord.`)
            .setColor("Orange");
          return interaction.reply({ embeds: [errorEmbed], flags: ["Ephemeral"] });
        }

        const embed = new EmbedBuilder()
          .setAuthor({ name: `${user.tag}`, iconURL: user.displayAvatarURL() })
          .setTitle(`✨ Banner de ${user.username}`)
          .setColor("#2b2d31")
          .setImage(banner)
          .setTimestamp()
          .setFooter({ text: `Pedido por ${interaction.user.tag}` });

        return interaction.reply({ embeds: [embed] });
      }
    }
  }
};