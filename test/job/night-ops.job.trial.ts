import { NmSecrets } from '../../src/utility';
import { NightOpsJob } from '../../src/jobs';
import { CrabappleClient } from '../crabapple-client';

run();
async function run() {
    console.log('HI');
    const {
        discordConfig: { appToken }
    } = await NmSecrets;
    await CrabappleClient.login(appToken);
    NightOpsJob(CrabappleClient)();
}
