const { Client, GatewayIntentBits, Partials, Collection, Events, AuditLogEvent, EmbedBuilder, Discord, Colors } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildVoiceStats } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;
const { ActivityType } = require("discord.js");
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const afkSchema = require('./Schemas/afkSchema');

const client = new Client({ 
  intents: 3276799,
  partials: [User, Message, GuildMember, ThreadMember]
});

const { loadEvents } = require("./Handlers/eventHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();
client.buttons = new Collection();

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

  const check = await afkSchema.findOne({ Guild: message.guild.id, User: message.author.id});
  if (check) {
    const nick = check.Nickname;
    await afkSchema.deleteMany({ Guild: message.guild.id, User: message.author.id});

    await message.member.setNickname(`${nick}`).catch(err => {
      return;
    })

    const m1 = await message.reply({ content: `Bienvenido de nuevo, **${message.author}**! He **removido** tu estado **AFK**`, ephemeral: true });
   setTimeout(() => {
      m1.delete();
   }, 4000);
  } else {

    const members = message.mentions.users.first();
    if (!members) return;
    const Data = await afkSchema.findOne({ Guild: message.guild.id, User: members.id});
    if (!Data) return;

    const member = message.guild.members.cache.get(members.id);
    const msg = Data.Message || 'Ninguna razón dada';

    if (message.content.includes(members)) {
      const m = await message.reply({ content: `**${member.user.tag}** esta **AFK** | **Motivo:** ${msg}`});
    }
  }
})