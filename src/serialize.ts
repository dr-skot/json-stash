import { hasOwnProperty, isPlainObject, isVanilla } from "./utils";
import { LegacySerializer } from "./types/LegacySerializer";
import { Serializer } from "./types/Serializer";
import { NoUpdateMethodError } from "./errors/NoUpdateMethodError";
import { getKey } from "./normalizeSerializer";

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
    return {
      $type: serializer.key,
      data: serializer.save(value),
    };
  }

  // otherwise punt; value will just get JSON.stringified
  // if it's not vanilla, give a warning
  if (!isVanilla(value)) {
    console.warn(`json-stash: no serializer found for ${value}`);
  }
  return value;
}

// the first pass of unstash, before refs are resolved
export function deserialize(spec: Deserializable, serializers: Serializer[]) {
  // if there's a matching serializer, use it
  const serializer = serializers.find((s) => s.key === spec.$type);
  if (serializer) return serializer.load(spec.data as any);

  // otherwise punt
  console.warn(`json-stash: no deserializer found for ${spec}`);
  return spec;
}

// the second pass of unstash, after refs are resolved
export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer[],
) {
  // we'll find a matching serializer this time; second pass only happens if the first pass found one
  const serializer = serializers.find((s) => s.key === spec.$type);
  if (!serializer) {
    // should we throw?
    console.warn(`json-stash: no deserializer found for ${spec}`);
    return;
  }

  const data = spec.data;

  // value will be mutated in place
  if (serializer.update) serializer.update(value, data);
  else throw new NoUpdateMethodError(serializer.key);
}

// TODO save this as test in the serializer
// default test is instanceof
export function defaultTest(serializer: LegacySerializer<any, any>) {
  return (value: unknown) => {
    try {
      return serializer.type && value instanceof serializer.type;
    } catch (e) {
      return false;
    }
  };
}
