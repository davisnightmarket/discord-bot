import Debug from 'debug';
export const GetDebug = (id: string) => Debug(`nm:${id}`);
