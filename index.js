// Discord user api endpoint

const express = require('express');
const app = express();
const port = 3000;
const { Client, GatewayIntentBits} = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildBans
    ],
});
const config = require('./config.json');

client.on('ready', () => {
  console.log(`Giriş Yapıldı: ${client.user.tag}`);
});

app.get('/', async (req, res) => {
  res.sendStatus(200);
});

app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.query;


    if (password !== config.password) {
        return res.status(401).json({ error: 'Geçersiz şifre.' });
        }
  try {

    const user = await client.users.fetch(id);

    if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        const username = user.username;
        const userId = user.id;
        const createdDate = `${user.createdAt.getDate()}/${user.createdAt.getMonth() + 1}/${user.createdAt.getFullYear()}`;
        const badges = user.flags ? user.flags.toArray() : [];
    
    
        const avatarUrl = user.displayAvatarURL({ format: 'png', size: 256 });
        const tag = user.discriminator;
    
        const response = {
          username,
          userId,
          tag,
          createdDate,
          badges,
          avatarUrl,
        };
    
        res.json(response);


  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Kullanıcı verileri alınamadı.' });
    }

    });

    app.get('/api/server/:id', async (req, res) => {

        const { id } = req.params;
        const { password } = req.query;

        if (password !== config.password) {
            return res.status(401).json({ error: 'Geçersiz şifre.' });
            }

        try {
            const guild = client.guilds.cache.get(id);

            if (!guild) {
              return res.status(404).json({ error: 'Sunucu bulunamadı.' });
            }
        
            const members = await guild.members.fetch();
        
            const voiceChannels = guild.channels.cache.filter(
              (channel) => channel.type === 'GUILD_VOICE'
            );
        
            const totalMembers = members.size;
            const onlineMembers = members.filter(
              (member) => member.presence?.status === 'online' || member.presence?.status === 'idle' || member.presence?.status === 'dnd'
            ).size;
            const offlineMembers = members.filter(
              (member) => member.presence?.status === 'offline' || !member.presence?.status
            ).size;
            const voiceMembers = voiceChannels.reduce((acc, channel) => acc + channel.members.size, 0);
        const banner = guild.bannerURL({ format: 'png', size: 4096 });
        const icon = guild.iconURL({ format: 'png', size: 4096 });
        const ownerID = guild.ownerId;    const response = {
              guildName: guild.name,
              guildId: guild.id,
              ownerId: guild.ownerId,
              totalMembers,
              onlineMembers,
              offlineMembers,
              voiceChannels: voiceChannels.size,
              voiceMembers,
              icon,
              banner,
            };
        
            res.json(response);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Sunucu verileri alınamadı.' });
          }

    });

    app.get('/api/servers', async (req, res) => {
        const { password } = req.query;


        if (password !== config.password) {
            return res.status(401).json({ error: 'Geçersiz şifre.' });
            }

            try {
                const guilds = client.guilds.cache;
                const guildData = [];
            
                for (const guild of guilds.values()) {
                  await guild.members.fetch();
                  const voiceChannels = guild.channels.cache.filter(
                    (channel) => channel.type === 'GUILD_VOICE'
                  );
            
                  const totalMembers = guild.members.cache.size;
                  const onlineMembers = guild.members.cache.filter(
                    (member) => member.presence?.status === 'online' || member.presence?.status === 'idle' || member.presence?.status === 'dnd'
                  ).size;
                  const offlineMembers = guild.members.cache.filter(
                    (member) => member.presence?.status === 'offline' || !member.presence?.status
                  ).size;
                  const voiceMembers = voiceChannels.reduce((acc, channel) => acc + channel.members.size, 0);
                  const banner = guild.bannerURL({ format: 'png', size: 4096 });
                  const icon = guild.iconURL({ format: 'png', size: 4096 });
                  guildData.push({
                    guildName: guild.name,
                    guildId: guild.id,
                    ownerId: guild.ownerId,
                    totalMembers,
                    onlineMembers,
                    offlineMembers,
                    voiceChannels: voiceChannels.size,
                    voiceMembers,
                    icon,
                    banner,
                  });
                }
            
                res.json(guildData);
              } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Sunucu verileri alınamadı.' });
              }
    });

    app.listen(port, () => {
        console.log(`Sunucu ${port} portunda başlatıldı.`);
      });


client.login(config.token);