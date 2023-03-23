export type Serializer = {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  // determines the default `load`, `test`, and `key` properties
  type: any;

  // returns data that will be passed to `load` to reconstruct the object
  save: (value: any) => any;

  // reconstructs object using data returned by save; default is (data: any) => new type(...data)
  // But types that can contain other objects must implement their own `load` function
  // that populates `existing` with the `data` if it's defined.
  // (This is necessary for handling circular references.)
  load?: (data: any, existing?: any) => any;

  // function to detect this type; default is (value: any) => value instanceof type
  test?: (value: any) => boolean;

  // unique identifier for this type; default is type.name
  key?: string;
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

// support adding custom serializers to the default list
export function addSerializers(serializers: Serializer[]) {
  DEFAULT_SERIALIZERS.splice(0, 0, ...serializers);
}
