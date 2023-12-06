import {
  hasOwnProperty,
  hasSymbolKeys,
  isPlainObject,
  isVanilla,
} from "./utils";
import { defaultSerializer, getKey, type Serializer } from "./serializers";
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
  serializers: Serializer<any, any>[] = [],
  addSerializers?: (...s: Serializer<any, any>[]) => void
) {
  if (isVanilla(value)) return value;

  // find a matching serializer in the list
  let serializer = serializers.find((s) => (s.test || defaultTest(s))(value));

  // punt if none found; it will just get JSON.stringified
  if (!serializer) {
    console.warn(`json-stash: no serializer found for ${value}`);
    return value;
  }

  return {
    $type: getKey(serializer!),
    data: serializer!.save(value),
  };
}

export function deserialize(
  spec: Deserializable,
  serializers: Serializer<any, any>[] = []
) {
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
  if (!serializer) {
    console.warn(`unstash: no serializer found for ${spec.$type}`);
    return spec;
  }
  return serializer.load(spec.data as any);
}

export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer<any, any>[] = []
) {
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
  const data = spec.data;
  // value will be mutated in place
  serializer?.load(data, value);
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
