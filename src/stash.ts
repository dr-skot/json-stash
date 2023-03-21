import { getRefSaver, getRefResolver, hasRefs, isRef } from "./ref";
import {
  dereference,
  deserialize,
  isDeserializable,
  serialize,
} from "./serialize";
import { deepMap } from "./utils";

export type Stash = {
  $: any;
};

export function toJSON(data: unknown) {
  const stash = encode({ $: data });
  return JSON.stringify(stash.$);
}

export function fromJSON(json: string) {
  const stash = { $: JSON.parse(json) };
  return decode(stash).$;
}

//
// internals
//

function encode(stash: Stash): Stash {
  const saveRefs = getRefSaver();
  return deepMap((value, path) => serialize(saveRefs(path, value)), {
    depthFirst: false,
    inPlace: false,
  })(stash) as Stash;
}

function decode(stash: Stash): Stash {
  const refs = getRefResolver(stash);

  // first pass: deserialize special types, note which ones need dereferencing
  const needsDeref: any[] = [];
  stash = deepMap(
    (v, path) => {
      if (isRef(v)) return v;
      if (isDeserializable(v)) {
        const deserialized = refs.registerValue(deserialize(v), path);
        if (hasRefs(v.data)) needsDeref.push([v._stashType, deserialized]);
        return refs.registerValue(deserialized, path);
      }
      return refs.registerValue(v, path);
    },
    { depthFirst: true, inPlace: false }
  )(stash) as Stash;

  // second pass: resolve refs
  refs.resolve(stash);
  needsDeref.forEach(([type, deserialized]) => {
    dereference(type, deserialized, refs.resolve);
  });

  return stash;
}
