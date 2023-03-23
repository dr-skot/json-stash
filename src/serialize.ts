import { hasOwnProperty, isPlainObject } from "./utils";
import { DEFAULT_SERIALIZERS, Serializer } from "./serializers";
import { isEscaped } from "./escape";

export type Deserializable = {
  _stashType: string;
  data: unknown;
};

export function isDeserializable(value: unknown): value is Deserializable {
  return (
    isPlainObject(value) &&
    hasOwnProperty(value, "_stashType") &&
    !isEscaped(value)
  );
}

export function serialize(value: unknown, serializers: Serializer[] = []) {
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) =>
    s.test ? s.test(value) : value instanceof s.type
  );
  if (!serializer) return value;
  return {
    _stashType: getKey(serializer),
    data: serializer.save(value),
  };
}

export function deserialize(
  spec: Deserializable,
  serializers: Serializer[] = []
) {
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) => getKey(s) === spec._stashType);
  if (!serializer) {
    console.warn(`No serializer found for ${spec._stashType}`);
    return spec;
  }
  const load = serializer.load || defaultLoader(serializer);
  return load(spec.data as any);
}

export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer[] = []
) {
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) => getKey(s) === spec._stashType);
  const data = spec.data;
  serializer?.load?.(data, value);
  return value;
}

export function defaultLoader(serializer: Serializer) {
  return (value: unknown[]) => new serializer.type(...value);
}

function getKey(serializer: Serializer) {
  return serializer.key || serializer.type.name;
}
