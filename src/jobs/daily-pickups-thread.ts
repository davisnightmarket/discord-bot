import { roleMention, type Guild, bold } from "discord.js";
import { getChannelByName } from "../service";
import { DAYS_OF_WEEK } from "../nm-const";
import { type GuildServiceModel } from "../model";

function today() {
    return DAYS_OF_WEEK[new Date().getDay()]
}

async function createTodaysPickupThread(guild: Guild) {
    const channel = getChannelByName(guild, today())
    const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`
    return await channel.threads.create({ name }); 
}

async function getRoleByName(guild: Guild, name: string) {
    const role = guild.roles.cache.find((role) => role.name === name)
    if (!role) return await guild.roles.create({ name })
    return role
}

export async function DailyPickupsThread(guild: Guild, services: GuildServiceModel) {
    const thread = await createTodaysPickupThread(guild);
    const roleId = await getRoleByName(guild, today()).then((role) => role.id)
    const pickups = await services.pickupsDataService.getPickupsFor(today())

    thread.send(roleMention(roleId))

    for (const pickup of pickups) {
        thread.send([
            `${bold(pickup.org)} at ${pickup.time}. ${pickup.comments ?? ''}`,
            ``
        ].join("\n"))
    }
}
