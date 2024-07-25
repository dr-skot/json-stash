import { classSerializer, ClassSerializerOpts } from "./classSerializer";
import { Serializer } from "./types/Serializer";
import { addSerializers } from "./index";

// @stashable takes all the `addClass` options, plus a possible `group`
interface StashableOpts extends ClassSerializerOpts<any> {
  group?: string;
}

// @stashable is a class decorator factory, with a `group()` method tacked onto it
interface StashableDecorator {
  (opts?: StashableOpts): ClassDecorator;
  group: (groupName: string) => Serializer[];
}

// store groups of serializers
const groups: Record<string, Serializer[]> = {};

// "raw" because we'll have to rename it to cast as StashableDecorator before exporting
function rawStashable({ group, ...opts }: StashableOpts = {}) {
  return function (target: any) {
    const serializer = classSerializer(target, opts);
    // add the serializer to the group, or to the global stasher if no group is specified
    if (group) groups[group] = [...(groups[group] || []), serializer];
    else addSerializers(serializer);
  };
}

rawStashable.group = (groupName: string) => [...groups[groupName]] || [];

export const stashable = rawStashable as StashableDecorator;
