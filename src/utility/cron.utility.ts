import cron from 'node-cron';

export const AddCron = (exp: string, f: () => void) => {
    cron.schedule(exp, f);
};

// cron.schedule('* * * * *', () => {
//     console.log('running a task every minute');
//     console.log(new Date().getDay());
// });
