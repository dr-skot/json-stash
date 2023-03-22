export type DerefFunction = (value: unknown) => unknown;

export type Serializer = {
  key: string;
  type: any;
  test?: (value: any) => boolean;
  save: (value: any) => any;
  load?: (data: any, value?: any) => any;
};

export const DEFAULT_SERIALIZERS = [
  {
    key: "Date",
    type: Date,
    save: (value: Date) => [value.toISOString()],
  },
  {
    key: "RegExp",
    type: RegExp,
    save: (value: RegExp) => [value.source, value.flags],
  },
  {
    key: "Map",
    type: Map,
    save: (map: Map<unknown, unknown>) => [...map],
    load: (data: [unknown, unknown][], map = new Map()) => {
      map.clear();
      for (const [k, v] of data) map.set(k, v);
      return map;
    },
  },
  {
    key: "Set",
    type: Set,
    save: (set: Set<unknown>) => [...set],
    load: (data: unknown[], value = new Set()) => {
      value.clear();
      for (const item of data) value.add(item);
      return value;
    },
  },
] as Serializer[];
