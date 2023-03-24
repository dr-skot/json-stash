export interface Serializer<Type, Data> {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  type: new (...args: any[]) => Type;

  // returns the data needed to reconstruct the object
  save: (value: Type) => Data;

  // reconstructs the object from the data returned by `save`; default is `(data) => new type(...data)`
  // if `existing` is defined, repopulate it with `data`; otherwise return a new object
  // you only need to support the `existing` parameter if `Data` (return value of `save`) can contain objects
  load?: (data: Data, existing?: Type) => Type;

  // detects objects of this type; default is `(obj) => obj instanceof type`
  test?: (value: any) => boolean;

  // unique identifier for this type; default is `type.name`
  key?: string;
}

export const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    save: (value: Date) => [value.toISOString()],
  } as Serializer<Date, [string]>,
  {
    type: RegExp,
    save: (value: RegExp) => [value.source, value.flags],
  } as Serializer<RegExp, [string, string]>,
  {
    type: Map,
    save: (map) => [...map],
    load: (data, map = new Map()) => {
      map.clear();
      for (const [k, v] of data) map.set(k, v);
      return map;
    },
  } as Serializer<Map<unknown, unknown>, [unknown, unknown][]>,
  {
    type: Set,
    save: (set) => [...set],
    load: (data, set = new Set()) => {
      set.clear();
      for (const item of data) set.add(item);
      return set;
    },
  } as Serializer<Set<unknown>, unknown[]>,
] as Serializer<any, any>[];

// support adding custom serializers to the default list
export function addSerializers(serializers: Serializer<any, any>[]) {
  DEFAULT_SERIALIZERS.splice(0, 0, ...serializers);
}
