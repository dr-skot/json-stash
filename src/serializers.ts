export type Serializer = {
  type: any;
  key: string;
  save: (value: any) => any;
  load: (value: any) => any;
  deRef?: (value: any, deRef: (value: unknown) => unknown) => void;
};

export const DEFAULT_SERIALIZERS = [
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
    deRef: (obj: Map<unknown, unknown>, deRef: (value: unknown) => unknown) => {
      for (const [key, value] of obj) {
        const newKey = deRef(key);
        const newValue = deRef(value);
        if (newKey !== key) obj.delete(key);
        obj.set(newKey, newValue);
      }
    },
  },
] as Serializer[];
