export { getStasher } from "./stasher";
export { stashable } from "json-stash/src/stashable";
export { Serializer } from "json-stash/src/types/Serializer";

import { getStasher } from "./stasher";

// initialize a global default stasher and export its member functions
const stasher = getStasher();

export const stash = stasher.stash;
export const stashAsync = stasher.stashAsync;
export const unstash = stasher.unstash;
export const unstashAsync = stasher.unstashAsync;
export const addSerializers = stasher.addSerializers;
export const addSerializer = stasher.addSerializer;
export const removeSerializers = stasher.removeSerializers;
export const clearSerializers = stasher.clearSerializers;
export const addClasses = stasher.addClasses;
export const addClass = stasher.addClass;
