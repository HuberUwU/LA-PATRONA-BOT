const { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits,

     EmbedBuilder,

    ChatInputCommandInteraction,

    Client,

    ChannelType,

    UserFlags,

    version } = require("discord.js");

const { connection } = require("mongoose");
const os = require("os");

module.exports = {

  data : new SlashCommandBuilder()

  .setName("botstats")

  .setDescription("Te dara las estadisticas del bot"),

  /**

     * @param {ChatInputCommandInteraction} interaction 

     * @param {Client} client 

     */

  async execute(interaction, client) {

        const status = [

            "Desconectado",

            "Conectado",

            "Conectando",

            "Desconectado"

        ];

    await client.user.fetch();

        await client.application.fetch();



        const getChannelTypeSize = type => client.channels.cache.filter(channel => type.includes(channel.type)).size;



  interaction.reply({embeds: [

            new EmbedBuilder()

                .setColor("Random")

                .setTitle(`**❱ BOT STATS**`)

                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))

                .setDescription(client.application.description || null)

                .addFields(

                    { name: "🙍‍♂️ Cliente", value: client.user.tag, inline: true },

                    { name: "📎 Creado", value: `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`, inline: true },

                    { name: "✅ Verificado", value: client.user.flags & UserFlags.VerifiedBot ? "Yes" : "No", inline: true },

                    { name: "🚧 Owner", value: `${client.application.owner.tag || "None"}`, inline: true },

                    { name:"📔 Database", value: status[connection.readyState], inline: true },
                  
                    { name: "💻 Sistema", value: os.type().replace("Windows_NT", "Windows").replace("Darwin", "macOS"), inline: true },

                    { name: "🖥 Modelo del CPU", value: `${os.cpus()[0].model}`, inline: true },

                    { name: "⛔ Uso del CPU", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}%`, inline: true },

                    { name: "📤 Activo", value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`, inline: true },

                    { name:"💾 Node.js", value: process.version, inline: true },

                    { name: "📱  Discord.js", value: version, inline: true },

                    { name: " 📡 Ping", value: `${client.ws.ping}ms`, inline: true },

                    { name: "⚒️ Comandos", value: `${client.commands.size}`, inline: true },

                    { name: "🎉 Servidores", value: `${client.guilds.cache.size}`, inline: true },

                    { name: "✨ Usuarios", value: `${client.guilds.cache.reduce((acc, guild) => acc+guild.memberCount, 0)}`, inline: true }

                )

        ], ephemeral: false });

    }

};



