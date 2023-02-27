import Config from './lib/dotenv.ts';
import { Client, Events, GatewayIntentBits } from 'npm:discord.js';

console.log(Config);

async function main() {
    console.log('hi');
    const client = new Client({
        intents: [GatewayIntentBits.Guilds]
    });
    // Log in to Discord with your client's token
    client.login(Config.DISCORD_TOKEN);
    console.log('there');
    //const commands = await loadCommands();
    // publishCommands(commands);

    client.once(Events.ClientReady, async (c) => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
        client.on('messageCreate', async (message) => {
            if (message.channel.id === 'channel_id') {
                //For a single channel listener.
            } else {
                //You can send a message if the channel_id is not equal.
            }
        });
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        console.log('HIHI');
        // if (!interaction.isChatInputCommand()) return;
        // const command = commands.get(interaction.commandName);
        // if (!command) {
        //     console.error(
        //         `No command matching ${interaction.commandName} was found.`
        //     );
        //     return;
        // }
        // try {
        //     await command.execute(interaction);
        // } catch (error) {
        //     console.error(error);
        //     await interaction.reply({
        //         content: 'There was an error while executing this command!',
        //         ephemeral: true
        //     });
        // }
    });
}

main();
