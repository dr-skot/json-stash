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

  if (!serializer) {
    // can we extract an object type?
    const type = (value as Object).constructor;
    if (!type) {
      // if not, punt
      console.warn(`json-stash: no serializer found for ${value}`);
      return value;
    }
    // otherwise generate a default serializer for the type
    console.warn(`json-stash: using default serializer for ${type} ${value}`);
    serializer = defaultSerializer(type);
    if (addSerializers) {
      // add the new serializer to the serializers list
      console.warn(`json-stash: adding ${type} serializer to serializer list`);
      addSerializers(serializer);
    }
  }
  const result = {
    $type: getKey(serializer!),
    data: serializer!.save(value),
  };
  return result;
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
  const load = serializer.load || defaultLoader(serializer);
  return load(spec.data as any);
}

export function reload(
  spec: Deserializable,
  value: unknown,
  serializers: Serializer<any, any>[] = []
) {
  const serializer = serializers.find((s) => getKey(s) === spec.$type);
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
