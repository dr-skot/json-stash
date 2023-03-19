import { recursivelyApply } from "./utils";

export type SpecialSerialized = {
  _stashType: string;
  data: unknown;
};

export function isSpecial(value: unknown) {
  const { _stashType } = value as SpecialSerialized;
  return !!_stashType;
}

export function customSerialize(value: unknown) {
  return recursivelyApply(customSerializeValue)(value);
}
export function customDeserialize(value: SpecialSerialized) {
  for (const serializer of DEFAULT_SERIALIZERS) {
    if (value._stashType === serializer.key) {
      return serializer.load(value.data as any);
    }
  }
  return value;
}

export function customSerializeValue(value: unknown) {
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

const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    key: "Date",
    save: (value: Date) => value.getTime(),
    load: (value: number) => new Date(value),
  },
];
