import { hasOwnProperty, isPlainObject } from "./utils";
import { findSerializer, getKey, type Serializer } from "./serializers";
import { isEscaped } from "./escape";

export type Deserializable = {
  $type: string;
  data: unknown;
};

export function isDeserializable(value: unknown): value is Deserializable {
  return (
    isPlainObject(value) && hasOwnProperty(value, "$type") && !isEscaped(value)
  );
}

export function serialize(
  value: unknown,
  serializers: Serializer<any, any>[] = []
) {
  const serializer = findSerializer((s) => {
    return (s.test || defaultTest(s))(value);
  }, serializers);
  if (!serializer) return value;
  return {
    $type: getKey(serializer),
    data: serializer.save(value),
  };
}

export function deserialize(
  spec: Deserializable,
  serializers: Serializer<any, any>[] = []
) {
  const serializer = findSerializer(
    (s) => getKey(s) === spec.$type,
    serializers
  );
  if (!serializer) {
    console.warn(`No serializer found for ${spec.$type}`);
    return spec;
  }
  const load = serializer.load || defaultLoader(serializer);
  return load(spec.data as any);
}

export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer<any, any>[] = []
) {
  const serializer = findSerializer((s) => getKey(s) === spec.$type);
  const data = spec.data;
  serializer?.load?.(data, value);
  return value;
}

export function defaultLoader(serializer: Serializer<any, any>) {
  return (value: unknown[]) => new serializer.type(...value);
}

export function defaultTest(serializer: Serializer<any, any>) {
  return (value: unknown) => {
    try {
      return value instanceof serializer.type;
    } catch (e) {
      return false;
    }
  };
}
