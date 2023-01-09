const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    let channel = c.channels.cache.find(channel => channel.name === 'bot-commands');  

    let thread = await channel.threads.create({
        name: "friday 1.13 pickups",
    })

    
});

// Log in to Discord with your client's token
client.login(token);
