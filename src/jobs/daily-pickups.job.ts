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
    type Interaction
} from 'discord.js';
import { type ConfigService } from '../service';
import { GetChannelByName } from '../utility';
import { DAYS_OF_WEEK } from '../nm-const';
import { type NmDayNameType, type GuildServiceModel } from '../model';
import { type PersonModel, type PickUp } from '../nm-service';

export const PickupsRefreshEvent =
    (sevicesConfig: ConfigService) => async (interaction: Interaction) => {
        // Is this our interaction to deal with?
        interaction = interaction as ButtonInteraction;
        const { customId } = interaction;
        if (!customId) return;
        const [name, day] = customId.split('--');
        if (name !== 'pickups-refresh') return;

        // Get em services
        const guild = interaction.guild;
        if (!guild) return;
        const services = await sevicesConfig.getServicesForGuildId(guild.id);

        // regenerate the message
        const roleId = await getRoleByName(guild, day);
        let message = `## ${roleMention(roleId)} pickups!\n`;

        const pickups = await services.opsDataService.getOpsByDay(
            day as NmDayNameType
        );
        for (const pickup of pickups) {
            message += `> ${bold(pickup.org)} at ${
                pickup.time
            }: ${await getVolunteerList(guild, services, pickup)}\n`;
        }

        // update it
        interaction.message.edit(message);
    };

export async function PickupsWithoutThread(
    guild: Guild,
    services: GuildServiceModel,
    interaction?: ChatInputCommandInteraction
) {
    // ping everyone signed up to help with today
    const roleId = await getRoleByName(guild, today());

    // list all the pick ups happening today
    const pickups = await services.opsDataService.getOpsByDay(today());

    let message = `## ${roleMention(roleId)} pickups!\n`;

    for (const pickup of pickups) {
        message += `> ${bold(pickup.org)} at ${
            pickup.time
        }: ${await getVolunteerList(guild, services, pickup)}\n`;
    }

    if (interaction) {
        const refreshButton = new ButtonBuilder()
            .setCustomId(`pickups-refresh--${today()}`)
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            refreshButton
        );

        interaction.reply({
            content: message,
            components: [row]
        });
    } else {
        const channel = GetChannelByName(guild, today());
        channel.send(message);
    }
}

function createPickupsMessage(
    roleId: string,
    pickup: PickUp,
    volunteers: []
): string {
    let message = `## ${roleMention(roleId)} pickups!\n`;
    message += `> ${bold(pickup.org)} at ${
        pickup.time
    }: ${await getVolunteerList(guild, services, pickup)}\n`;
    return message;
}

async function getVolunteerList(
    guild: Guild,
    services: GuildServiceModel,
    pickup: PickUp
) {
    const people = await Promise.all(
        pickup.volunteerIdList
            .filter((discorId) => discorId && discorId !== 'NEEDED')
            .map(
                services.personCoreService.getPersonByEmailOrDiscordId(discorId)
            )
    );

    if (people.length === 0)
        return roleMention(await getRoleByName(guild, 'NEEDED'));

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
    if (!role)
        return await guild.roles.create({ name }).then((role) => role.id);
    return role.id;
}

function today() {
    return DAYS_OF_WEEK[new Date().getDay()];
}
