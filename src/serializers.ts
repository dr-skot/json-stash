import { isObject, recursivelyApply } from "./utils";

export type SpecialSerialized = {
  _stashType: string;
  data: unknown;
};

export function isSpecial(value: unknown): value is SpecialSerialized {
  return isObject(value) && "_stashType" in value;
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

type Serializer = {
  type: any;
  key: string;
  save: (value: any) => any;
  load: (value: any) => any;
};

const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    key: "Date",
    save: (value: Date) => value.getTime(),
    load: (value: number) => new Date(value),
  },
  {
    type: RegExp,
    key: "RegExp",
    save: (value: RegExp) => ({ source: value.source, flags: value.flags }),
    load: (value: { source: string; flags: string }) =>
      new RegExp(value.source, value.flags),
  },
  {
    type: Map,
    key: "Map",
    save: (value: Map<unknown, unknown>) => [...value],
    load: (value: [unknown, unknown][]) => new Map(value),
  },
] as Serializer[];
