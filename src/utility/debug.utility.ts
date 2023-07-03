import Debug from 'debug';
export const DebugUtility = (id: string) => Debug(`nm:${id}`);
// smaller util!
export const Dbg = DebugUtility;
