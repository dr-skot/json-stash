export type DerefFunction = (value: unknown) => unknown;

export type Serializer = {
  key: string;
  type: any;
  test?: (value: any) => boolean;
  save: (value: any) => any;
  load?: (value: any) => any;
  deref?: (value: any, deref: DerefFunction) => void;
};

export const DEFAULT_SERIALIZERS = [
  {
    type: Date,
    key: "Date",
    save: (value: Date) => [value.toISOString()],
  },
  {
    type: RegExp,
    key: "RegExp",
    save: (value: RegExp) => [value.source, value.flags],
  },
  {
    type: Map,
    key: "Map",
    save: (value: Map<unknown, unknown>) => [[...value]],
    deref: derefMap,
  },
  {
    type: Set,
    key: "Set",
    save: (value: Set<unknown>) => [[...value]],
    deref: derefSet,
  },
] as Serializer[];

function derefMap(obj: Map<unknown, unknown>, deref: DerefFunction) {
  for (const [key, value] of obj) {
    const newKey = deref(key);
    const newValue = deref(value);
    if (newKey !== key) obj.delete(key);
    if (newKey !== key || newValue !== value) obj.set(newKey, newValue);
  }
}

function derefSet(obj: Set<unknown>, deref: DerefFunction) {
  for (const value of obj) {
    const newValue = deref(value);
    if (newValue !== value) {
      obj.delete(newValue);
      obj.add(newValue);
    }
  }
}
