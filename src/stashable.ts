import { addSerializers } from "./index";

import { Class } from "./types/Class";
import { classSerializer, ClassSerializerOpts } from "./classSerializer";

// TODO properly type this; remove all "any"s

type StashableClassSpec = Class | [Class, string | ClassSerializerOpts<any>];

const groups: Record<string, StashableClassSpec[]> = {};

interface StashableOptions extends Partial<ClassSerializerOpts<any>> {
  group?: string;
}

function getKeyOrOpts(opts: StashableOptions) {
  if (!opts.save) return opts.key;
  return {
    key: opts.key,
    save: opts.save,
    load: opts.load,
    update: opts.update,
  };
}

function rawStashable(opts: StashableOptions = {}) {
  return function (target: any) {
    if (opts.group) {
      const group = groups[opts.group] || [];
      target = [target, getKeyOrOpts(opts)];
      groups[opts.group] = [...group, target];
    } else {
      addSerializers(classSerializer(target, getKeyOrOpts(opts)));
    }
  };
}

rawStashable.group = (groupName: string) => groups[groupName] || [];

interface StashableDecorator {
  (opts?: StashableOptions): ClassDecorator;
  group: (groupName: string) => StashableClassSpec[];
}

// TODO is there a more elegant way to jump through this typescript hoop?
//   We want ts to know stashable is a function with a .group property
//   I don't know how to accomplish that without this rename-and-cast hack
export const stashable = rawStashable as StashableDecorator;
