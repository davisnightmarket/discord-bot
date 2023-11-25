import { describe, expect, test } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

const singleMessage = `## <@&friday> 

Night Captain: max
Host: <@257574610004869120> 
Pick-ups:
> Coffee House :undefined AM **ellyn** 
> 3rd & U Café 8:00 PM **felix** 
> Crepeville 8:00 PM **sai ** 
> Davis Food Co-op 9:00 PM **max** 

 Love, Crabapple`;

describe('MessageService', () => {
    test('gets a single message', async () => {
        const { markdownService } = await WaitForGuildServices;

        const a = markdownService.getNightMapAnnounce('friday', {
            day: 'friday',
            marketList: [
                {
                    day: 'friday',
                    statusList: [],
                    orgPickup: '',
                    orgMarket: 'Davis Night Market',
                    timeStart: '21:00',
                    timeEnd: '',
                    hostList: [
                        {
                            day: 'friday',
                            role: 'night-captain',
                            orgPickup: '',
                            orgMarket: 'Davis Night Market',
                            discordIdOrEmail: 'maxemorgan88@gmail.com',
                            periodStatus: 'ALWAYS',
                            timeStart: '21:00',
                            timeEnd: '',
                            status: 'active',
                            name: 'max',
                            email: 'maxemorgan88@gmail.com',
                            phone: '',
                            location: '',
                            bike: '',
                            bikeCart: '',
                            bikeCartAtNight: '',
                            skills: '',
                            bio: '',
                            pronouns: '',
                            interest: '',
                            reference: '',
                            discordId: '',
                            availabilityHostList: '',
                            availabilityPickupList: '',
                            teamInterestList: '',
                            permissionList: '',
                            stampCreate: ''
                        },
                        {
                            day: 'friday',
                            role: 'night-distro',
                            orgPickup: '',
                            orgMarket: 'Davis Night Market',
                            discordIdOrEmail: '257574610004869120',
                            periodStatus: 'ALWAYS',
                            timeStart: '',
                            timeEnd: '',
                            status: 'active',
                            name: 'ashville',
                            email: 'dreyerash@gmail.com',
                            phone: '',
                            location: '',
                            bike: '',
                            bikeCart: '',
                            bikeCartAtNight: '',
                            skills: '',
                            bio: '',
                            pronouns: '',
                            interest: '',
                            reference: '',
                            discordId: '257574610004869120',
                            availabilityHostList: '',
                            availabilityPickupList: '',
                            teamInterestList: '',
                            permissionList: '',
                            stampCreate: ''
                        }
                    ],
                    pickupList: [
                        {
                            day: 'friday',
                            role: 'night-pickup',
                            orgPickup: 'Coffee House',
                            orgMarket: 'Davis Night Market',
                            discordIdOrEmail: 'ellyndaly@me.com',
                            periodStatus: 'ALWAYS',
                            timeStart: '',
                            timeEnd: '',
                            personList: [
                                {
                                    day: 'friday',
                                    role: 'night-pickup',
                                    orgPickup: 'Coffee House',
                                    orgMarket: 'Davis Night Market',
                                    discordIdOrEmail: 'ellyndaly@me.com',
                                    periodStatus: 'ALWAYS',
                                    timeStart: '',
                                    timeEnd: '',
                                    status: 'active',
                                    name: 'ellyn',
                                    email: 'ellyndaly@me.com',
                                    phone: '6509540174',
                                    location: '',
                                    bike: '',
                                    bikeCart: '',
                                    bikeCartAtNight: '',
                                    skills: '',
                                    bio: '',
                                    pronouns: '',
                                    interest: '',
                                    reference: '',
                                    discordId: '',
                                    availabilityHostList: '',
                                    availabilityPickupList: '',
                                    teamInterestList: '',
                                    permissionList: '',
                                    stampCreate: ''
                                }
                            ],
                            noteList: []
                        },
                        {
                            day: 'friday',
                            role: 'night-pickup',
                            orgPickup: '3rd & U Café',
                            orgMarket: 'Davis Night Market',
                            discordIdOrEmail: 'felix@tacocat.com',
                            periodStatus: 'ALWAYS',
                            timeStart: '20:00',
                            timeEnd: '',
                            personList: [
                                {
                                    day: 'friday',
                                    role: 'night-pickup',
                                    orgPickup: '3rd & U Café',
                                    orgMarket: 'Davis Night Market',
                                    discordIdOrEmail: 'felix@tacocat.com',
                                    periodStatus: 'ALWAYS',
                                    timeStart: '20:00',
                                    timeEnd: '',
                                    status: 'active',
                                    name: 'felix',
                                    email: 'felix@tacocat.com',
                                    phone: '',
                                    location: '',
                                    bike: '',
                                    bikeCart: '',
                                    bikeCartAtNight: '',
                                    skills: '',
                                    bio: '',
                                    pronouns: '',
                                    interest: '',
                                    reference: '',
                                    discordId: '',
                                    availabilityHostList: '',
                                    availabilityPickupList: '',
                                    teamInterestList: '',
                                    permissionList: '',
                                    stampCreate: ''
                                }
                            ],
                            noteList: []
                        },
                        {
                            day: 'friday',
                            role: 'night-pickup',
                            orgPickup: 'Crepeville',
                            orgMarket: 'Davis Night Market',
                            discordIdOrEmail: 'fingerhoods@gmail.com',
                            periodStatus: 'SHADOW',
                            timeStart: '20:00',
                            timeEnd: '',
                            personList: [
                                {
                                    day: 'friday',
                                    role: 'night-pickup',
                                    orgPickup: 'Crepeville',
                                    orgMarket: 'Davis Night Market',
                                    discordIdOrEmail: 'fingerhoods@gmail.com',
                                    periodStatus: 'SHADOW',
                                    timeStart: '20:00',
                                    timeEnd: '',
                                    status: 'active',
                                    name: 'sai ',
                                    email: 'fingerhoods@gmail.com',
                                    phone: '',
                                    location: '',
                                    bike: '',
                                    bikeCart: '',
                                    bikeCartAtNight: '',
                                    skills: '',
                                    bio: '',
                                    pronouns: '',
                                    interest: '',
                                    reference: '',
                                    discordId: '',
                                    availabilityHostList: '',
                                    availabilityPickupList: '',
                                    teamInterestList: '',
                                    permissionList: '',
                                    stampCreate: ''
                                }
                            ],
                            noteList: []
                        },
                        {
                            day: 'friday',
                            role: 'night-pickup',
                            orgPickup: 'Davis Food Co-op',
                            orgMarket: 'Davis Night Market',
                            discordIdOrEmail: 'maxemorgan88@gmail.com',
                            periodStatus: 'ALWAYS',
                            timeStart: '21:00',
                            timeEnd: '',
                            personList: [
                                {
                                    day: 'friday',
                                    role: 'night-pickup',
                                    orgPickup: 'Davis Food Co-op',
                                    orgMarket: 'Davis Night Market',
                                    discordIdOrEmail: 'maxemorgan88@gmail.com',
                                    periodStatus: 'ALWAYS',
                                    timeStart: '21:00',
                                    timeEnd: '',
                                    status: 'active',
                                    name: 'max',
                                    email: 'maxemorgan88@gmail.com',
                                    phone: '',
                                    location: '',
                                    bike: '',
                                    bikeCart: '',
                                    bikeCartAtNight: '',
                                    skills: '',
                                    bio: '',
                                    pronouns: '',
                                    interest: '',
                                    reference: '',
                                    discordId: '',
                                    availabilityHostList: '',
                                    availabilityPickupList: '',
                                    teamInterestList: '',
                                    permissionList: '',
                                    stampCreate: ''
                                }
                            ],
                            noteList: []
                        }
                    ]
                }
            ]
        });
        expect(a.trim()).toBe(singleMessage);
    }, 15000);
});
