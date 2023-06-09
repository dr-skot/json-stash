import { getRefResolver, getRefSaver, hasRefs, isRef } from "./ref";
import { reload, deserialize, isDeserializable, serialize } from "./serialize";
import { deepMap } from "./utils";
import { getObjectEscaper } from "./escape";
import { Serializer } from "./serializers";

export type StashRoot = {
  $: any;
};

export function stash(
  data: unknown,
  serializers?: Serializer<any, any>[],
  addSerializers?: (...s: Serializer<any, any>[]) => void
) {
  const root = encode({ $: data }, serializers, addSerializers);
  return JSON.stringify(root.$);
}

export function unstash(json: string, serializers?: Serializer<any, any>[]) {
  const root = { $: JSON.parse(json) };
  return decode(root, serializers).$;
}

//
// internals
//

function encode(
  root: StashRoot,
  serializers?: Serializer<any, any>[],
  addSerializers?: (...s: Serializer<any, any>[]) => void
): StashRoot {
  const saveRefs = getRefSaver();
  const { escape, unescapeAll } = getObjectEscaper();
  const encoded = deepMap(
    (value, path) =>
      serialize(saveRefs(path, escape(value)), serializers, addSerializers),
    { depthFirst: false, inPlace: false, avoidCircular: false }
  )(root) as StashRoot;
  unescapeAll();
  return encoded;
}

function decode(
  root: StashRoot,
  serializers?: Serializer<any, any>[]
): StashRoot {
  const refs = getRefResolver(root);
  const { registerEscapes, unescapeAll } = getObjectEscaper();

  // first pass: deserialize special types, note which ones need dereferencing or unescaping
  const needsDeref: any[] = [];
  const needsUnescape: any[] = [];

  root = deepMap(
    (node, path) => {
      registerEscapes(node);
      if (isRef(node)) return node;
      if (isDeserializable(node)) {
        let deserialized = deserialize(node, serializers);
        deserialized = refs.registerValue(deserialized, path);
        // node.data is just-parsed JSON, so no need to worry about circular refs
        if (hasRefs(node.data)) needsDeref.push([node, deserialized]);
        else if (registerEscapes(node.data))
          needsUnescape.push([node, deserialized]);
        return deserialized;
      }
      return refs.registerValue(node, path);
    },
    { depthFirst: true, inPlace: false, avoidCircular: false }
  )(root) as StashRoot;

  // second pass: resolve refs, note which deserialized objects need unescaping
  refs.resolve(root);
  needsDeref.forEach(([node, deserialized]) => {
    node = { ...node, data: refs.resolve(node.data) };
    if (registerEscapes(node.data)) needsUnescape.push([node, deserialized]);
    reload(node, deserialized, serializers);
  });

  // third pass: unescape
  unescapeAll();
  needsUnescape.forEach(([node, deserialized]) => {
    reload(node, deserialized, serializers);
  });

  return root;
}
