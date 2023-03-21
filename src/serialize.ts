import { isPlainObject } from "./utils";
import { DEFAULT_SERIALIZERS, Serializer } from "./serializers";

export type Deserializable = {
  _stashType: string;
  data: unknown;
};

export function isDeserializable(value: unknown): value is Deserializable {
  return isPlainObject(value) && "_stashType" in value;
}

export function serialize(value: unknown) {
  for (const serializer of DEFAULT_SERIALIZERS) {
    if (value instanceof serializer.type) {
      return {
        _stashType: serializer.key,
        data: serializer.save(value),
      };
    }
  }
  return value;
}

export function deserialize(value: Deserializable) {
  for (const serializer of DEFAULT_SERIALIZERS) {
    if (value._stashType === serializer.key) {
      const load = serializer.load || defaultLoader(serializer);
      return load(value.data as any);
    }
  }
  return value;
}

export function dereference(
  type: string,
  value: unknown,
  deRef: (value: unknown) => unknown
) {
  const serializer = DEFAULT_SERIALIZERS.find((s) => s.key === type);
  serializer?.deRef?.(value, deRef);
  return value;
}

export function defaultLoader(serializer: Serializer) {
  return (value: unknown[]) => new serializer.type(...value);
}
