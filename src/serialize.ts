import { isPlainObject } from "./utils";
import { DEFAULT_SERIALIZERS, Serializer } from "./serializers";

export type Deserializable = {
  _stashType: string;
  data: unknown;
};

export function isDeserializable(value: unknown): value is Deserializable {
  return isPlainObject(value) && "_stashType" in value;
}

export function serialize(value: unknown, serializers: Serializer[] = []) {
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) =>
    s.test ? s.test(value) : value instanceof s.type
  );
  if (!serializer) return value;
  return {
    _stashType: serializer.key,
    data: serializer.save(value),
  };
}

export function deserialize(
  value: Deserializable,
  serializers: Serializer[] = []
) {
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) => s.key === value._stashType);
  if (!serializer) {
    console.warn(`No serializer found for ${value._stashType}`);
    return value;
  }
  const load = serializer.load || defaultLoader(serializer);
  return load(value.data as any);
}

export function dereference(
  type: string,
  value: unknown,
  deref: (value: unknown) => unknown,
  serializers: Serializer[] = []
) {
  serializers = [...serializers, ...DEFAULT_SERIALIZERS];
  const serializer = serializers.find((s) => s.key === type);
  serializer?.deref?.(value, deref);
  return value;
}

export function defaultLoader(serializer: Serializer) {
  return (value: unknown[]) => new serializer.type(...value);
}
