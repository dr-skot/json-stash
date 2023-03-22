# json-stash

Serialize and deserialize javascript data to/from JSON. 
- handles circular and duplicate references
- supports `Date`, `RegExp`, `Map`, and `Set` out of the box
- supports user-defined types

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
// leaders3p.attempts === leaders3p.made

unstringified = JSON.parse(JSON.stringify(leaders3p));
// unstringified.attempts.name === unstringified.made.name
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

The simplest serializer is just a type and a save function. The `type` is a class (or constructor function), 
and `save` returns an array of arguments to be passed to `new type` to reconstruct the object.
Here is the built-in `RegExp` serializer, for example:

```typescript
const regExpSerializer = {
  type: RegExp,
  save: (value: RegExp) => [value.source, value.flags],
};
```

If your object can contain other objects, you'll also need to define a `load` function. The load function takes 
two arguments: 
- `data` the value returned by `save`
- `existing` (optional) an existing object to populate

The first time `load` is called, 
- `data` may contain unresolved object placeholders
- `existing` will be undefined; `load` should return a new object

If there were unresolved placeholders the first time, `load` will be called a second time with all placeholders
resolved in `data` and `existing` set to the object returned by the first call.
`load` should then populate `existing` with the new data.

Here is the built-in `Map` serializer, for example:

```typescript
const mapSerializer = {
  type: Map,
  save: (map: Map<unknown, unknown>) => [...map],
  load: (data: [unknown, unknown][], map = new Map()) => {
    map.clear();
    for (const [k, v] of data) map.set(k, v);
    return map;
  },
};
```

This double-pass approach is necessary to handle circular references.

You may need a custom `load` function anyway, if reconstructing your object is more complicated than passing
what's returned by `save` to `new type`.

Other optional serializer properties are:

- `key`: (optional) a unique string identifier for the type. Defaults to `type.name`. If you have types from different packages
with the same name, for example, you'll need to give them different `key`s to keep them straight
- `test`: (optional) a predicate to detect this type of object. Defaults to `(x) => x instance of type`.

## Todo

- Support other common javascript types
