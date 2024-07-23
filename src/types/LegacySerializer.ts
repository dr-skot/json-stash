import { Class } from "./Class";

export interface LegacySerializer<Type = any, Data = any> {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  // but can also be a primitive type (e.g. `symbol`, `bigint`)
  type?: Class<Type>;

  // detects objects of this type; default is `(obj) => obj instanceof type`
  test?: (value: any) => boolean;

  // returns the data needed to reconstruct the object
  save: (value: Type) => Data;

  // unique identifier for this type; default is `type.name`
  key?: string;

  // reconstructs the object from the data returned by `save`
  // if `existing` is defined, repopulate in-place it with `data`; otherwise return a new object
  // you only need to support the `existing` parameter if `Data` (return value of `save`) can contain objects
  load: (data: Data, existing?: Type) => Type;

  // updates the object with new data
  // if this exists, it is used instead of the two-parameter call to `load`
  update?: (object: Type, data: Data) => void;
}
