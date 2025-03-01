export interface Serializer<Type = any, Data = any> {
  key: string;
  test: (value: unknown) => boolean;
  save: (value: Type) => Data;
  load: (data: Data) => Type;
  update?: (value: Type, data: Data) => void;
}
