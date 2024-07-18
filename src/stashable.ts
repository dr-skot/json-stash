import { addSerializers } from "./index";
import { classSerializer } from "./serializers";
import { Class } from "./utils";

// TODO properly type this; remove all "any"s

type StashableClassSpec = Class | [Class, string];

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
stashable.save = (target: any, key: string | { name: string }) => {
  console.log("stashable.save key", key);
  console.log("stashable.save target", target);
  console.log("stashable.save target has key?", target.hasOwnProperty(key));
  console.log("stashable.save this", this);
  const name = typeof key === "string" ? key : key.name;
  const method = typeof key === "string" ? target[key] : target;
  console.log("stashable.save method", method);
  method.__jsonStash_save = true;
  target.__jsonStash_save = target[name];
};
stashable.load = (target: any, key: string | { name: string }) => {
  console.log("stashable.load key", key);
  const name = typeof key === "string" ? key : key.name;
  target.__jsonStash_load = target[name];
};

stashable.update = (target: any, key: string | { name: string }) => {
  console.log("stashable.update key", key);
  const name = typeof key === "string" ? key : key.name;
  target.__jsonStash_update = target[name];
};

stashable.group = (groupName: string) => groups[groupName] || [];
