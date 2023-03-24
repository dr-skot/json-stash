import { hasOwnProperty, isPlainObject } from "./utils";
import { DEFAULT_SERIALIZERS, Serializer } from "./serializers";
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
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) =>
    s.test ? s.test(value) : value instanceof s.type
  );
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
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
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
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
  const data = spec.data;
  serializer?.load?.(data, value);
  return value;
}

export function defaultLoader(serializer: Serializer<any, any>) {
  return (value: unknown[]) => new serializer.type(...value);
}

function getKey(serializer: Serializer<any, any>) {
  return serializer.key || serializer.type.name;
}
