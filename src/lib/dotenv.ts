const { config } = require('dotenv');

config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? '';
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '';
