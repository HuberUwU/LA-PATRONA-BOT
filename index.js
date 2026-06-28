const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;
const { ActivityType } = require("discord.js");
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');

const mongoose = require("mongoose");
const afkSchema = require('./Schemas/afkSchema');

const client = new Client({ 
  intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates, MessageContent],
  partials: [User, Message, GuildMember, ThreadMember]
});

const { loadEvents } = require("./Handlers/eventHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();
client.buttons = new Collection();
client.cooldowns = new Collection();

const ffmpeg = require('ffmpeg-static');

// Inicializar DisTube con soporte Premium y Binario de FFmpeg Estático
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  ffmpeg: {
    path: ffmpeg
  },
  plugins: [
    new SpotifyPlugin(),
    new SoundCloudPlugin()
  ]
});

// Vincular los eventos de música
require("./Handlers/distubeEvents")(client);

loadEvents(client);
loadButtons(client);

require(`./Handlers/anti-crash`)(client);

client.login(client.config.token).then(() => {
    client.user.setPresence({
        activities: [{
            name: `UPDATE 0.12🎡`,
            type: ActivityType[`Playing`]
        }]
    });
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  try {
    // Si Mongoose no está conectado (1 = connected), ignorar las consultas de AFK
    if (mongoose.connection.readyState !== 1) return;

    const check = await afkSchema.findOne({ Guild: message.guild.id, User: message.author.id});
    if (check) {
      const nick = check.Nickname || null;
      await afkSchema.deleteMany({ Guild: message.guild.id, User: message.author.id});

      await message.member.setNickname(nick).catch(() => {});

      const m1 = await message.reply({ content: `Bienvenido de nuevo, **${message.author}**! He **removido** tu estado **AFK**` });
      setTimeout(() => {
        m1.delete().catch(() => {});
      }, 4000);
    } else {
      const members = message.mentions.users.first();
      if (!members) return;
      
      const Data = await afkSchema.findOne({ Guild: message.guild.id, User: members.id});
      if (!Data) return;

      const member = message.guild.members.cache.get(members.id);
      const msg = Data.Message || 'Ninguna razón dada';

      if (message.content.includes(members)) {
        await message.reply({ content: `**${member?.user?.tag || members.tag}** está **AFK** | **Motivo:** ${msg}`}).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Error en base de datos en MessageCreate:", err);
  }
})