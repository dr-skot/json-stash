# json-stash

Serialize and deserialize javascript data to/from JSON. Supports `Date`, `RegExp`, `Map`, `Set`, and circular references.

## Installation

```bash
npm install json-stash
```

## Usage

```javascript
import { stash, unstash } from 'json-stash';

const stashed = stash(anything);
const unstashed = unstash(stashed);

// `unstashed` is a deep copy of `anything`
```

## Circular references

`JSON.stringify/parse` chokes on circular references.

```javascript
egoist = {}
egoist.preoccupation = egoist;
JSON.stringify(egoist);
// TypeError: Converting circular structure to JSON
```

`json-stash` doesn't.

```javascript
unstash(stash(egoist));
// <ref *1> { preoccupation: [Circular *1] }
```

## Duplicate references

Circular references are a special case of duplicate references. 
When an object contains multiple references to the same object, `json-stash`
maintains those internal identities. `JSON.stringify/parse` doesn't

```javascript
curry = { name: 'Steph Curry' };
kerr = { name: 'Steve Kerr' };
leaders3p = { // per-game stats
    attempts: curry,
    made: curry,
    pct: kerr,
}
// note that leaders3p.attempts === leaders3p.made

unstringified = JSON.parse(JSON.stringify(leaders3p));
// unstringified.attempts.name === unstringified.made.name, but
// unstringified.attempts !== unstringified.made

unstashed = unstash(stash(leaders3p));
// unstashed.attempts === unstashed.made
```

## Non-vanilla types

`JSON.stringify/parse` doesn't support non-vanilla data. `Date`s get converted to strings, and most other objects become `{}`.

```javascript
JSON.parse(JSON.stringify(new Date("1969-07-21T02:56Z")))
// '1969-07-21T02:56:00.000Z'

JSON.parse(JSON.stringify(new Map([["driver", "Armstrong"], ["shotgun", "Aldrin"]])))
// {}

JSON.parse(JSON.stringify({ collect: /rock/g }));
// { collect: {} }
```

`json-stash` handles `Date`, `RegExp`, `Map`, and `Set` correctly.

```javascript
unstash(stash(new Date("1969-07-21T02:56Z")))
// 1969-07-21T02:56:00.000Z // Date object

unstash(stash(new Map([["driver", "Armstrong"], ["shotgun", "Aldrin"]])))
// Map(2) { 'driver' => 'Armstrong', 'shotgun' => 'Aldrin' }

unstash(stash({ collect: /rock/g }));
// { collect: /rock/g }
```

### User-defined types

You can serialize your own types by passing custom serializers
to the `stash` and `unstash` functions.

```typescript
class MoonGuy {
  constructor(name, order) {
    this.name = name;
    this.order = order;
  }
}

const moonGuySerializer = {
  type: MoonGuy,
  save: (guy) => [guy.name, guy.order],
};

const eagleCrew = [new MoonGuy('Armstrong', 1), new MoonGuy('Aldrin', 2)];

const stashed = stash(eagleCrew, [moonGuySerializer]);
const unstashed = unstash(stashed, [moonGuySerializer]);
// [ 
//   MoonGuy { name: 'Armstrong', order: 1 },
//   MoonGuy { name: 'Aldrin', order: 2 }
// ]
```

The properties of a serializer are

- `type`: the type of objects to serialize, detected by `(x) => x instance of type`—but if that's not the right test, 
you can define a custom `test` function (see below)

- `key`: a unique identifier for the type. Defaults to `type.name`

- `test`: (optional) a custom test to detect this type of object. Defaults to `(x) => x instance of type`.

- `save`: returns data that when passed to `load` will reconstruct the object. Ordinarily this is an array of arguments 
to be passed to `new type`

- `load`: (optional) reconstructs the object using the data returned by `save`. 
Defaults to `(data) => new type(...data)`. If your object might contain other objects,
`load` should take an optional second argument, which might contain an existing object to populate;
if no such object is passed, `load` should create a new one. This is necessary to resolve duplicate 
or circular references.

To illustrate how it works, here are the serializers for `Date`, `RegExp`, `Map`, and `Set`

```typescript
const DEFAULT_SERIALIZERS = [
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
```

## Caveats

`stash` inserts special objects into the data structure to represent non-vanilla types and duplicate references.

```typescript
type NonPrimitive = { _stashType: string, data: any }
type Ref = { _stashRef: string }
```

So if you have `_stashType` or `_stashRef` keys in your actual data, it will mess things up. 
Presumably the likelihood of such a key collision is slim. Protecting against it is on the todo list.

## Todo

- Support other common types
- Protect against key collisions with `_stashType` and `_stashRef`
