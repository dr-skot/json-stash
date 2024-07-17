import { addSerializers } from "./index";
import { classSerializer } from "./serializers";
import { Type } from "./utils";

// TODO properly type this; remove all "any"s

type StashableClassSpec = Type<any> | [Type<any>, string];

const groups: Record<string, StashableClassSpec[]> = {};

interface StashableOptions {
  key?: string;
  group?: string;
}

export function stashable(opts: StashableOptions = {}) {
  return function (target: any) {
    if (opts.group) {
      const group = groups[opts.group] || [];
      target = opts.key ? [target, opts.key] : target;
      groups[opts.group] = [...group, target];
    } else {
      addSerializers(classSerializer(target, opts.key));
    }
  };
}
stashable.save = (target: any, key: string) => {
  target.__jsonStash_save = target[key];
};
stashable.load = (target: any, key: string) => {
  target.__jsonStash_load = target[key];
};

stashable.update = (target: any, key: string) => {
  target.__jsonStash_update = target[key];
};

stashable.group = (groupName: string) => groups[groupName] || [];
