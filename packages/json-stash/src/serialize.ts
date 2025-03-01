import { error, hasOwnProperty, isPlainObject, isVanilla } from "./utils";
import { Serializer } from "./types/Serializer";

// a stashed object that needs to be deserialized looks like this
type Deserializable = {
  $type: string;
  data: unknown;
};

export function isDeserializable(value: unknown): value is Deserializable {
  return (
    isPlainObject(value) &&
    hasOwnProperty(value, "$type") &&
    hasOwnProperty(value, "data")
  );
}

export function serialize(value: unknown, serializers: Serializer[]) {
  // find a matching serializer in the list
  const serializer = serializers.find((s) => s.test(value));

  // if we found one, use it
  if (serializer) {
    return { $type: serializer.key, data: serializer.save(value) };
  }

  // otherwise punt; value will just get JSON.stringified
  // if it's not vanilla, give a warning
  return !isVanilla(value) ? warnNoSerializer(value) : value;
}

// the first pass of unstash, before refs are resolved
export function deserialize(spec: Deserializable, serializers: Serializer[]) {
  // if there's a matching serializer, use it
  const serializer = serializers.find((s) => s.key === spec.$type);
  if (serializer) return serializer.load(spec.data as any);

  // otherwise punt
  return warnNoSerializer(spec);
}

// the second pass of unstash, after refs are resolved
export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer[],
) {
  // we'll find a matching serializer this time; second pass only happens if the first pass found one
  const serializer = serializers.find((s) => s.key === spec.$type);
  if (!serializer) return warnNoSerializer(spec);

  const data = spec.data;

  // value will be mutated in place
  if (serializer.update) serializer.update(value, data);
  else throw error(`No update method found on ${serializer.key} serializer`);
}

function warnNoSerializer(value: unknown) {
  try {
    console.warn(`json-stash: No serializer found for ${value}`);
  } catch (e) {
    console.warn(
      `json-stash: No serializer found for an object with no toString() method`,
    );
  }
  return value;
}
