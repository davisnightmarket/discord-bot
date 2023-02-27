import { config } from 'https://deno.land/x/dotenv/mod.ts';
import { EnvModel } from './model/mod.ts';

export default config() as EnvModel;
