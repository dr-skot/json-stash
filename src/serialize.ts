import { isObject, recursivelyApply } from "./utils";
import { DEFAULT_SERIALIZERS } from "./serializers";

export type Deserializable = {
  _stashType: string;
  data: unknown;
};

export function isDeserializable(value: unknown): value is Deserializable {
  return isObject(value) && "_stashType" in value;
}

export function serialize(value: unknown) {
  return recursivelyApply(serializeValue)(value);
}

export function deserialize(value: Deserializable) {
  for (const serializer of DEFAULT_SERIALIZERS) {
    if (value._stashType === serializer.key) {
      return serializer.load(value.data as any);
    }
  }
  return value;
}

export function serializeValue(value: unknown) {
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
