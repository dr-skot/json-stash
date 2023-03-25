import { getStasher as _getStasher } from "./stasher";
export type { Serializer } from "./serializers";

export const getStasher = _getStasher;

// TODO there must be a more efficient way to do this
// initialize a global default stasher and export its member functions
const stasher = getStasher();

export const stash = stasher.stash;
export const unstash = stasher.unstash;
export const addSerializers = stasher.addSerializers;
export const removeSerializers = stasher.removeSerializers;
export const clearSerializers = stasher.clearSerializers;
