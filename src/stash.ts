import { getRefSaver, getRefResolver, hasRefs, isRef } from "./ref";
import {
  dereference,
  deserialize,
  isDeserializable,
  serialize,
} from "./serialize";
import { deepMap } from "./utils";

export type StashRoot = {
  $: any;
};

export function toJSON(raw: unknown) {
  const stash = encode({ $: raw });
  return JSON.stringify(stash.$);
}

export function fromJSON(json: string) {
  const stash = { $: JSON.parse(json) };
  return decode(stash).$;
}

//
// internals
//

function encode(raw: StashRoot): StashRoot {
  const saveRefs = getRefSaver();
  return deepMap((value, path) => serialize(saveRefs(path, value)), {
    depthFirst: false,
    inPlace: false,
  })(raw) as StashRoot;
}

function decode(root: StashRoot): StashRoot {
  const refs = getRefResolver(root);

  // first pass: deserialize special types, note which ones need dereferencing
  const needsDeref: any[] = [];
  root = deepMap(
    (v, path) => {
      if (isRef(v)) return v;
      if (isDeserializable(v)) {
        const deserialized = refs.registerValue(deserialize(v), path);
        if (hasRefs(v.data)) needsDeref.push([v, deserialized]);
        return refs.registerValue(deserialized, path);
      }
      return refs.registerValue(v, path);
    },
    { depthFirst: true, inPlace: false }
  )(root) as StashRoot;

  // second pass: resolve refs
  refs.resolve(root);
  needsDeref.forEach(([spec, deserialized]) => {
    dereference(spec._stashType, deserialized, refs.resolve);
  });

  return root;
}
