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

export const stashable = (({ group, ...opts }: StashableOpts = {}) =>
  (target: any) => {
    // add the serializer to the group, or to the global stasher if no group is specified
    if (group) groups[group] = [...(groups[group] || []), [target, opts]];
    else addSerializers(classSerializer(target, opts));
  }) as StashableDecorator;

stashable.group = (groupName: string) => [...(groups[groupName] || [])];
