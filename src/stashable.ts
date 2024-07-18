import { addSerializers } from "./index";
import { classSerializer, ClassSerializerOpts } from "./serializers";
import { Class } from "./utils";

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

export function stashable(opts: StashableOptions = {}) {
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

stashable.group = (groupName: string) => groups[groupName] || [];
