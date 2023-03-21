export type Serializer = {
  type: any;
  key: string;
  save: (value: any) => any;
  load?: (value: any) => any;
  deRef?: (value: any, deref: (value: unknown) => unknown) => void;
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
    deRef: (obj: Map<unknown, unknown>, deref) => {
      for (const [key, value] of obj) {
        const newKey = deref(key);
        const newValue = deref(value);
        if (newKey !== key) obj.delete(key);
        if (newKey !== key || newValue !== value) obj.set(newKey, newValue);
      }
    },
  },
] as Serializer[];
