import { WaitingForConfig } from '../../src/utility';
import { NightOpsJob } from '../../src/jobs';
import { CrabappleClient } from '../crabapple-client';

run();
async function run() {
    console.log('HI');
    const {
        discordApiConfig: { appToken }
    } = await WaitingForConfig;
    await CrabappleClient.login(appToken);
    NightOpsJob(CrabappleClient)();
}
