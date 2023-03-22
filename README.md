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
expect(unstashed).toEqual(anything);
```

## It's like JSON.stringify

When used on vanilla objects, `stash` is equivalent to `JSON.stringify`

```javascript
armstrong = { name: "Neil", apollo: 11, steps: ["small", "giant"] };

JSON.stringify(armstrong);
// '{"name":"Neil","apollo":11,"steps":["small","giant"]}'

stash(armstrong);
// '{"name":"Neil","apollo":11,"steps":["small","giant"]}'
```

## Only better

But `stash` can handle things `JSON.stringify` can't. For example:

### Circular references

```javascript
egoist = {}
egoist.preoccupation = egoist;

JSON.stringify(egoist);
// TypeError: Converting circular structure to JSON

stash(egoist);
// '{"preoccupation":{"_stashRef":"$"}}'

unstash(stash(egoist));
// <ref *1> { preoccupation: [Circular *1]
```

### In other words, identical objects

Circular references are a special case of identical objects. 
When data contains multiple references to the same object, `stash`
maintains those identities. `JSON.stringify` doesn't

```javascript
steph = { name: 'Curry' };
steve = { name: 'Kerr' };

// per-game stat leaders
threes = { shot: steph, made: steph, pct: steve }

unstringified = JSON.parse(JSON.stringify(threes));
// `shot` and `made` are duplicates
expect(unstringified.shot).not.toBe(unstringified.made);

unstashed = unstash(stash(threes));
// `shot` and `made` are the same object
expect(unstashed.shot).toBe(unstashed.made);
```

### Non-vanilla types

`JSON.stringify/parse` doesn't support non-vanilla data. `Date`s get converted to strings, and most other objects become `{}`.

```javascript
JSON.parse(JSON.stringify(new Date("1969-07-21T02:56Z")))
// '1969-07-21T02:56:00.000Z'

JSON.parse(JSON.stringify(new Map([["driver", "Armstrong"], ["shotgun", "Aldrin"]])))
// {}

JSON.parse(JSON.stringify({ collect: /rock/g }));
// { collect: {} }
```

`json-stash` supports `Date`, `RegExp`, `Map`, and `Set` out of the box.

```javascript
unstash(stash(new Date("1969-07-21T02:56Z")))
// 1969-07-21T02:56:00.000Z // Date object

unstash(stash(new Map([["driver", "Armstrong"], ["shotgun", "Aldrin"]])))
// Map(2) { 'driver' => 'Armstrong', 'shotgun' => 'Aldrin' }

unstash(stash({ collect: /rock/g }));
// { collect: /rock/g }
```

### User-defined types

You can add support for other types by passing custom serializers
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

The simplest serializer is just a `type` and a `save` function. The `type` is a class constructor, 
and `save` returns an array of arguments to be passed to it by calling `new type(...args)`.
For example, here are the built-in serializers for `Date` and `RegExp`:

```typescript
const serializers = [{
  type: Date,
  save: (date: Date) => [date.toISOString()],
}, {
  type: RegExp,
  save: (regex: RegExp) => [regex.source, regex.flags],
}];
```

If your object can contain other objects, you'll also need to define a `load` function. The load function takes 
two arguments: 
- `data`: the value returned by `save`
- `existing?`: an existing object to populate, or `undefined`

The first time `load` is called, 
- `data` may contain unresolved object placeholders
- `existing` will be undefined, and `load` should return a new object

If there were unresolved placeholders the first time, `load` will be called a second time:
- `data` will have all its placeholders resolved 
- `existing` will contain the object returned by the first call, and `load` should repopulate it with the new data.

This double-pass approach is necessary to handle circular references.

To illustrate, here are the built-in serializers for `Map` and `Set`:

```typescript
const serializers = [{
  type: Map,
  save: (map: Map<unknown, unknown>) => [...map],
  load: (data: [unknown, unknown][], map = new Map()) => {
    map.clear();
    for (const [k, v] of data) map.set(k, v);
    return map;
  },
}, {
  type: Set,
  save: (set: Set<unknown>) => [...set],
  load: (data: unknown[], set = new Set()) => {
    set.clear();
    for (const item of data) set.add(item);
    return set;
  },
}];
```

You may need a custom `load` function anyway, if reconstructing your object involves more than passing
arguments to `new type`.

Other optional serializer properties are:

- `test`: a test to detect objects of this type. Defaults to `(x) => x instance of type`
- `key`: a unique string identifier for this type. Defaults to `type.name`. If you have types with the same `type.name` 
(because they're from different packages for example) you'll need to give them distinct `key`s to keep them straight

## Todo

- Support other common javascript types
