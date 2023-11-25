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

proto();
async function proto() {
    const { markdownService, nightDataService } = await WaitForGuildServices;
    const nightMap = await nightDataService.getNightMapByDay('friday');
    console.log(JSON.stringify(nightMap, null, 2));
    const a = markdownService.getNightMapAnnounce('friday', nightMap);
    if (singleMessage !== a) {
        console.log(a);
    } else console.log('SUUCEESS');
}
