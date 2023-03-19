export type Serializer = {
  type: any;
  key: string;
  save: (value: any) => any;
  load: (value: any) => any;
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
  },
] as Serializer[];
