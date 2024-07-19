import { hasOwnProperty, isPlainObject, isVanilla } from "./utils";
import { getKey, type Serializer } from "./serializers";

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

export function serialize(
  value: unknown,
  serializers: Serializer<any, any>[] = [],
) {
  // only serialize non-vanilla objects
  if (isVanilla(value)) return value;

  // find a matching serializer in the list
  const serializer = serializers.find((s) => (s.test || defaultTest(s))(value));

  // if we found one, use it
  if (serializer) {
    return {
      $type: getKey(serializer),
      data: serializer.save(value),
    };
  }

  // otherwise punt; value will just get JSON.stringified
  console.warn(`json-stash: no serializer found for ${value}`);
  return value;
}

// the first pass of unstash, before refs are resolved
export function deserialize(
  spec: Deserializable,
  serializers: Serializer<any, any>[] = [],
) {
  // if there's a matching serializer, use it
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
  if (serializer) return serializer.load(spec.data as any);

  // otherwise punt
  console.warn(`json-stash: no deserializer found for ${spec}`);
  return spec;
}

// the second pass of unstash, after refs are resolved
export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer<any, any>[] = [],
) {
  // we'll find a matching serializer this time; second pass only happens if the first pass found one
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
  const data = spec.data;
  // value will be mutated in place
  serializer?.load(data, value);
}

// TODO save this as test in the serializer
// default test is instanceof
export function defaultTest(serializer: Serializer<any, any>) {
  return (value: unknown) => {
    try {
      return value instanceof serializer.type;
    } catch (e) {
      return false;
    }
  };
}
