import { getRefResolver, getRefSaver, hasRefs, isRef } from "./ref";
import { reload, deserialize, isDeserializable, serialize } from "./serialize";
import { deepMap } from "./utils";
import { getObjectEscaper } from "./escape";
import { Serializer } from "./types/Serializer";

// a temporary root object that holds the data to be stashed or unstashed
export type StashRoot = {
  $: any;
};

export function stash(data: unknown, serializers: Serializer[]) {
  // wrap data in a StashRoot
  const root: StashRoot = { $: data };

  // use a ref tracker to preserve object identity
  const saveRefs = getRefSaver();

  // if objects in the data are using our special property names ('$type' and '$ref'),
  // we'll escape those while serializing, and unescape them after we're done
  const { escape, unescapeAll } = getObjectEscaper();

  const encoded = deepMap(
    (value, path) => serialize(saveRefs(path, escape(value)), serializers),
    { depthFirst: false, inPlace: false, avoidCircular: false },
  )(root) as StashRoot;

  // unescape escaped properties
  unescapeAll();

  // pop the result out of the StashRoot before stringifying
  return JSON.stringify(encoded.$);
}

export function unstash(json: string, serializers: Serializer[]) {
  // wrap the JSON in a StashRoot
  const root = { $: JSON.parse(json) };

  // use a ref tracker to preserve object identity
  const refs = getRefResolver(root);

  // we'll register objects that need unescaping as we go, and unescape them after all the deserializing is done
  const { registerEscapes, unescapeAll } = getObjectEscaper();

  // first pass: deserialize special types, note which ones need dereferencing or unescaping
  const needsDeref: any[] = [];
  const needsUnescape: any[] = [];

  const decoded = deepMap(
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
    { depthFirst: true, inPlace: false, avoidCircular: false },
  )(root) as StashRoot;

  // second pass: resolve refs, note which deserialized objects need unescaping
  refs.resolve(decoded);
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

  // pop the result out of the StashRoot
  return decoded.$;
}
