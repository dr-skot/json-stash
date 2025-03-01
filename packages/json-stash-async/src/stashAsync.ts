import {
  getRefResolver,
  getRefSaver,
  hasRefs,
  isRef,
} from "json-stash/src/ref";
import {
  reload,
  deserialize,
  isDeserializable,
  serialize,
} from "json-stash/src/serialize";
import { getObjectEscaper } from "json-stash/src/escape";
import { Serializer } from "json-stash/src/types/Serializer";
import { StashRoot } from "json-stash/src/stash";
import { deepMapAsync } from "./deepMapAsync";
import { DEFAULT_SERIALIZERS } from "json-stash/src/serializers";

export async function stashAsync(
  data: unknown,
  serializers: Serializer[] = DEFAULT_SERIALIZERS,
  yieldThreadEvery = 100,
) {
  // wrap data in a StashRoot
  const root: StashRoot = { $: data };

  // use a ref tracker to preserve object identity
  const saveRefs = getRefSaver();

  // if objects in the data are using our special property names ('$type' and '$ref'),
  // we'll escape those while serializing, and unescape them after we're done
  const { escape, unescapeAll } = getObjectEscaper();

  const encoded = (await deepMapAsync(
    (value, path) => serialize(saveRefs(path, escape(value)), serializers),
    false,
    false,
    false,
    yieldThreadEvery,
  )(root)) as StashRoot;

  // unescape escaped properties
  unescapeAll();

  // pop the result out of the StashRoot before stringifying
  return JSON.stringify(encoded.$);
}

export async function unstashAsync(
  json: string,
  serializers: Serializer[] = DEFAULT_SERIALIZERS,
  yieldThreadEvery = 100,
) {
  // wrap the JSON in a StashRoot
  const root = { $: JSON.parse(json) };

  // use a ref tracker to preserve object identity
  const refs = getRefResolver(root);

  // we'll register objects that need unescaping as we go, and unescape them after all the deserializing is done
  const { registerEscapes, unescapeAll } = getObjectEscaper();

  // first pass: deserialize special types, note which ones need dereferencing or unescaping
  const needsDeref: any[] = [];
  const needsUnescape: any[] = [];

  const decoder = deepMapAsync(
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
    false,
    true,
    false,
    yieldThreadEvery,
  );

  const decoded = (await decoder(root)) as StashRoot;

  // second pass: resolve refs, note which deserialized objects need unescaping
  await refs.resolve(decoded);
  for (let [node, deserialized] of needsDeref) {
    node = { ...node, data: refs.resolve(node.data) };
    if (registerEscapes(node.data)) needsUnescape.push([node, deserialized]);
    reload(node, deserialized, serializers);
  }

  // third pass: unescape
  unescapeAll();
  needsUnescape.forEach(([node, deserialized]) => {
    reload(node, deserialized, serializers);
  });

  // pop the result out of the StashRoot
  return decoded.$;
}
