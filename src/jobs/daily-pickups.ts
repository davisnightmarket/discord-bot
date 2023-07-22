import {
    roleMention,
    type Guild,
    bold,
    userMention,
    EmbedBuilder,
} from 'discord.js';
import { getChannelByName } from '../service';
import { DAYS_OF_WEEK } from '../nm-const';
import { type GuildServiceModel } from '../model';
import { type PersonModel, type PickUp } from '../nm-service';

export async function DailyPickupsUsingEmbed(
    guild: Guild,
    services: GuildServiceModel
) {
    const channel = getChannelByName(guild, today());

    const pickups = await services.pickupsDataService.getPickupsFor(today());
    const pickupDescriptions = await Promise.all(
        pickups.map(
            async (pickup) =>
                `* [${pickup.org}](https://www.example.com) at ${
                    pickup.time
                }: ${await getVolunteerList(services, pickup)}`
        )
    );

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`pickups`)
        .setDescription(pickupDescriptions.join('\n'));

    channel.send({ embeds: [embed] });
}

export async function DailyPickupsWithoutThread(
    guild: Guild,
    services: GuildServiceModel
) {
    const channel = getChannelByName(guild, today());

    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today()).then((role) => role.id);
    channel.send(`Lets go ${roleMention(roleId)}!`);

    const link = 'https://davisnightmarket.github.io/';

    // list all the pick ups happening today
    const pickups = await services.pickupsDataService.getPickupsFor(today());
    for (const pickup of pickups) {
        channel.send(
            [
                `${bold(pickup.org)} at ${
                    pickup.time
                }: ${await getVolunteerList(services, pickup)}`
            ].join('\n')
        );
    }
}

export async function DailyPickupsThread(
    guild: Guild,
    services: GuildServiceModel
) {
    const thread = await createTodaysPickupThread(guild);

    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today()).then((role) => role.id);
    thread.send(`Lets go ${roleMention(roleId)}!`);

    // list all the pick ups happening today
    const pickups = await services.pickupsDataService.getPickupsFor(today());
    for (const pickup of pickups) {
        thread.send(
            [
                `${bold(pickup.org)} at ${pickup.time}. ${
                    pickup.comments ?? ''
                }`,
                ``,
                `people helping: ${await getVolunteerList(services, pickup)}`,
                ``
            ].join('\n')
        );
    }
}

async function getVolunteerList(services: GuildServiceModel, pickup: PickUp) {
    const people = await Promise.all(
        [pickup.volunteer1, pickup.volunteer2, pickup.volunteer3]
            .filter((name) => name !== undefined && name !== '')
            .map(
                async (name) =>
                    (await services.personCoreService.getPerson({ name })) ?? {
                        name
                    }
            )
    );

    if (people.length === 0) return bold('NEEDED');

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
    if (!role) return await guild.roles.create({ name });
    return role;
}

function today() {
    return DAYS_OF_WEEK[new Date().getDay()];
}
