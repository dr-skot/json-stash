import { getRefResolver, getRefSaver, hasRefs, isRef } from "./ref";
import { reload, deserialize, isDeserializable, serialize } from "./serialize";
import { deepMap } from "./utils";
import { Serializer } from "./serializers";
import { getObjectEscaper } from "./escape";

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
  const { escape, unescapeAll } = getObjectEscaper();
  const encoded = deepMap(
    (value, path) => serialize(saveRefs(path, escape(value)), serializers),
    { depthFirst: false, inPlace: false, avoidCircular: false }
  )(stash) as Stash;
  unescapeAll();
  return encoded;
}

function decode(stash: Stash, serializers?: Serializer[]): Stash {
  const refs = getRefResolver(stash);
  const { findEscapes, unescapeAll } = getObjectEscaper();

  // first pass: deserialize special types, note which ones need dereferencing or unescaping
  const needsDeref: any[] = [];
  const needsUnescape: any[] = [];

  stash = deepMap(
    (node, path) => {
      findEscapes(node);
      if (isRef(node)) return node;
      if (isDeserializable(node)) {
        const deserialized = refs.registerValue(
          deserialize(node, serializers),
          path
        );
        // node.data is just-parsed JSON, so no need to worry about circular refs
        if (hasRefs(node.data)) needsDeref.push([node, deserialized]);
        else if (findEscapes(node.data))
          needsUnescape.push([node, deserialized]);
        return refs.registerValue(deserialized, path);
      }
      return refs.registerValue(node, path);
    },
    { depthFirst: true, inPlace: false, avoidCircular: false }
  )(stash) as Stash;

  // second pass: resolve refs, note which special types need unescaping
  refs.resolve(stash);
  needsDeref.forEach(([node, deserialized]) => {
    node = { ...node, data: refs.resolve(node.data) };
    if (findEscapes(node.data)) needsUnescape.push([node, deserialized]);
    reload(node, deserialized, serializers);
  });

  // third pass: unescape
  unescapeAll();
  needsUnescape.forEach(([node, deserialized]) => {
    reload(node, deserialized, serializers);
  });
  return stash;
}
