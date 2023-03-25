export { getStasher } from "./stasher";
export type { Serializer } from "./serializers";

import { getStasher } from "./stasher";

// initialize a global default stasher and export its member functions
const stasher = getStasher();

export const stash = stasher.stash;
export const unstash = stasher.unstash;
export const addSerializers = stasher.addSerializers;
export const removeSerializers = stasher.removeSerializers;
export const clearSerializers = stasher.clearSerializers;
