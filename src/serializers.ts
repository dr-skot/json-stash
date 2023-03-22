export type Serializer = {
  type: any;
  // default is type.name
  key?: string;
  // default is (value: any) => value instanceof type
  test?: (value: any) => boolean;
  save: (value: any) => any;
  // default is (data: any) => new type(...data)
  load?: (data: any, value?: any) => any;
};

export const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    save: (value: Date) => [value.toISOString()],
  },
  {
    type: RegExp,
    save: (value: RegExp) => [value.source, value.flags],
  },
  {
    type: Map,
    save: (map: Map<unknown, unknown>) => [...map],
    load: (data: [unknown, unknown][], map = new Map()) => {
      map.clear();
      for (const [k, v] of data) map.set(k, v);
      return map;
    },
  },
  {
    type: Set,
    save: (set: Set<unknown>) => [...set],
    load: (data: unknown[], set = new Set()) => {
      set.clear();
      for (const item of data) set.add(item);
      return set;
    },
  },
] as Serializer[];
