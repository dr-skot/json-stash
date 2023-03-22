import { getRefSaver, getRefResolver, hasRefs, isRef } from "./ref";
import {
  dereference,
  deserialize,
  isDeserializable,
  serialize,
} from "./serialize";
import { deepMap } from "./utils";
import { Serializer } from "./serializers";

export type Stash = {
  $: any;
};

export function toJSON(data: unknown, serializers?: Serializer[]) {
  const stash = encode({ $: data }, serializers);
  return JSON.stringify(stash.$);
}

export function fromJSON(json: string, serializers?: Serializer[]) {
  const stash = { $: JSON.parse(json) };
  return decode(stash, serializers).$;
}

//
// internals
//

function encode(stash: Stash, serializers?: Serializer[]): Stash {
  const saveRefs = getRefSaver();
  return deepMap(
    (value, path) => serialize(saveRefs(path, value), serializers),
    {
      depthFirst: false,
      inPlace: false,
    }
  )(stash) as Stash;
}

function decode(stash: Stash, serializers?: Serializer[]): Stash {
  const refs = getRefResolver(stash);

  // first pass: deserialize special types, note which ones need dereferencing
  const needsDeref: any[] = [];
  stash = deepMap(
    (v, path) => {
      if (isRef(v)) return v;
      if (isDeserializable(v)) {
        const deserialized = refs.registerValue(
          deserialize(v, serializers),
          path
        );
        if (hasRefs(v.data)) needsDeref.push([v, deserialized]);
        return refs.registerValue(deserialized, path);
      }
      return refs.registerValue(v, path);
    },
    { depthFirst: true, inPlace: false }
  )(stash) as Stash;

  // second pass: resolve refs
  refs.resolve(stash);
  needsDeref.forEach(([spec, deserialized]) => {
    // dereference(spec._stashType, deserialized, refs.resolve, serializers);
    dereference(spec, deserialized, refs.resolve, serializers);
  });

  return stash;
}
