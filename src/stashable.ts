import { classSerializer, ClassSerializerOpts } from "./classSerializer";
import { addSerializers } from "./index";
import { Class } from "./types/Class";

// @stashable takes all the `addClass` options, plus a possible `group`
interface StashableOpts extends ClassSerializerOpts<any> {
  group?: string;
}

type ClassSerializerSpec<T = any> = [Class<T>, ClassSerializerOpts<T>];

// @stashable is a class decorator factory, with a `group()` method tacked onto it
interface StashableDecorator {
  (opts?: StashableOpts): ClassDecorator;
  group: (groupName: string) => ClassSerializerSpec[];
}

// store groups of serializers
const groups: Record<string, ClassSerializerSpec[]> = {};

// "raw" because we'll have to rename it to cast as StashableDecorator before exporting
function rawStashable({ group, ...opts }: StashableOpts = {}) {
  return function (target: any) {
    // add the serializer to the group, or to the global stasher if no group is specified
    if (group) groups[group] = [...(groups[group] || []), [target, opts]];
    else addSerializers(classSerializer(target, opts));
  };
}

rawStashable.group = (groupName: string) => [...groups[groupName]] || [];

export const stashable = rawStashable as StashableDecorator;
