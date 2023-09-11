import {
    roleMention,
    type Guild,
    bold,
    userMention,
    type ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    type Interaction,
} from 'discord.js';
import { type ConfigSerive, getChannelByName } from '../service';
import { DAYS_OF_WEEK } from '../nm-const';
import { type DayNameType, type GuildServiceModel } from '../model';
import { type PersonModel, type PickUp } from '../nm-service';

export const PickupsRefreshEvent = (sevicesConfig: ConfigSerive) => async (interaction: Interaction) => {
    // Is this our interaction to deal with?
    interaction = interaction as ButtonInteraction;
    const { customId } = interaction;
    if (!customId) return;
    const [name, day] = customId.split('--');
    if (name !== "pickups-refresh") return;
 
    // Get em services
    const guild = interaction.guild
    if (!guild) return
    const services = await sevicesConfig.getServicesForGuildId(guild.id)
    
    // make sure we have the most up to date info
    await services.pickupsDataService.updateCache()

    // regenerate the message
    const roleId = await getRoleByName(guild, day);
    let message = `## ${roleMention(roleId)} pickups!\n`
    const pickups = await services.pickupsDataService.getPickupsFor(day as DayNameType);
    for (const pickup of pickups) {
        message += `> ${bold(pickup.org)} at ${
                pickup.time
            }: ${await getVolunteerList(guild, services, pickup)}\n`
    }
    
    // update it
    interaction.message.edit(message)
}

export async function DailyPickupsWithoutThread(
    guild: Guild,
    services: GuildServiceModel,
    interaction?: ChatInputCommandInteraction,
) {

    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today());

    // list all the pick ups happening today
    const pickups = await services.pickupsDataService.getPickupsFor(today());

    let message = `## ${roleMention(roleId)} pickups!\n`

    for (const pickup of pickups) {
        message += `> ${bold(pickup.org)} at ${
                pickup.time
            }: ${await getVolunteerList(guild, services, pickup)}\n`
    }

    if (interaction) {
        const refreshButton = new ButtonBuilder()
			.setCustomId(`pickups-refresh--${today()}`)
			.setLabel('Refresh')
			.setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(refreshButton);

        interaction.reply({
            content: message,
            components: [row],    
        })
    } else {
        const channel = getChannelByName(guild, today());
        channel.send(message)
    }
}

async function getVolunteerList(guild: Guild, services: GuildServiceModel, pickup: PickUp) {
    const people = await Promise.all(
        [pickup.volunteer1, pickup.volunteer2, pickup.volunteer3]
            .filter((name) => name !== undefined && name !== '' && name !== "NEEDED")
            .map(
                async (name) =>
                    (await services.personCoreService.getPerson({ name })) ?? {
                        name
                    }
            )
    );

    if (people.length === 0) return roleMention(await getRoleByName(guild, "NEEDED"));

    return people
        .filter((person): person is PersonModel => !!person)
        .map((person) =>
            person.discordId ? userMention(person.discordId) : person.name
        )
        .join(', ');
}

async function createTodaysPickupThread(guild: Guild) {
    const channel = getChannelByName(guild, today());
    const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
    return await channel.threads.create({ name });
}

async function getRoleByName(guild: Guild, name: string) {
    const role = guild.roles.cache.find((role) => role.name === name);
    if (!role) return await guild.roles.create({ name }).then((role) => role.id);
    return role.id;
}

function today() {
    return DAYS_OF_WEEK[new Date().getDay()];
}
