# json-stash

Serialize javascript data to JSON. Like `JSON.stringify`, but better.
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

unstash(stash(egoist));
// <ref *1> { preoccupation: [Circular *1] }
```

Circular references are a special case of identical objects. 
When the input contains multiple references to the same object, `stash`
maintains those identities. `JSON.stringify` doesn't.

```javascript
grover = { name: "Cleveland" };
ben = { name: "Harrison" };
presidents = { 22: grover, 23: ben, 24: grover };

unstringified = JSON.parse(JSON.stringify(presidents));
// 22 and 24 are copies of each other
expect(unstringified[22]).not.toBe(unstringified[24]);

unstashed = unstash(stash(presidents));
// 22 and 24 are the same object
expect(unstashed[22]).toBe(unstashed[24]);
```

### Non-vanilla types

`stash` supports `Date`, `Map`, `Set` and `RegExp` out of the box. `JSON.stringify` doesn't.

```javascript
landing = new Date("1969-07-21T02:56Z");
order = new Map([[1, "Armstrong"], [2, "Aldrin"]]);
steps = new Set(["small", "giant"]);
collect = /rock/g;

JSON.parse(JSON.stringify(landing));
// '1969-07-21T02:56:00.000Z'
unstash(stash(landing));
// 1969-07-21T02:56:00.000Z // Date object

JSON.parse(JSON.stringify(order));
// {}
unstash(stash(order));
// Map(2) { 1 => 'Armstrong', 2 => 'Aldrin' }

JSON.parse(JSON.stringify(steps));
// {}
unstash(stash(steps));
// Set(2) { 'small', 'giant' }

JSON.parse(JSON.stringify(collect));
// {}
unstash(stash(collect));
// /rock/g
```

You can support other types by adding your own serializers. See [User-defined types](#user-defined-types) below.

## How it works

Rereferenced objects are rendered as `{ $ref: "$.path.to.object" }`.

```javascript
egoist = {};
egoist.preoccupation = egoist;
vipList = [egoist, egoist];

stash(vipList);
// '[{"preoccupation":{"$ref":"$.0"}},{"$ref":"$.0"}]'
```

Special types are rendered as `{ $type: "type", data: "json" }`.

```javascript
stash(/rock/g);
// '{"$type":"RegExp","data":["rock","g"]}'
```

Every supported type has a serializer that defines how `data` is saved and restored. 
See [User-defined types](#user-defined-types) below.

If your input data contains `$ref` or `$type` properties, `stash` escapes them so that `unstash` 
won't process them as references or special types.

```javascript
stash({ $type: "fake" }); 
// '{"$type":"fake","$esc":true}'

unstash(stash({ $type: "fake" }));
// { $type: "fake" }
```

If your input contains `$esc` properties, `stash` can deal with that too.

```javascript
stash({ $esc: false });
// '{"$esc":false,"$$esc":true}'

stash({ $esc: false, $$esc: null});
// '{"$esc":false,"$$esc":null,"$$$esc":true}'

unstash(stash({ $esc: false, $$esc: null }));
// { $esc: false, $$esc: null }
```

## User-defined types

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

armstrong = new MoonGuy('Armstrong', 'first');

const stashed = stash(armstrong, [moonGuySerializer]);
const unstashed = unstash(stashed, [moonGuySerializer]);
// MoonGuy { name: 'Armstrong', order: 'first' },
```

If you don't want to pass serializers with every call to `stash` and `unstash`,
you can add them globally.

```typescript
import { addSerializers } from 'json-stash';

addSerializers([moonGuySerializer]);
unstash(stash(armstrong));
// MoonGuy { name: 'Armstrong', order: 'first' },
```

The most recently added serializers have priority, so you can override previous or built-in ones.

The simplest serializer is just a `type` and a `save` function. The `type` is a class constructor, 
and `save` returns an array of arguments to be passed to `type` by calling `new type(...args)`.
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

Note that `save` must return data that can be serialized and deserialized with `JSON.stringify/parse`.

If your object can contain other objects, you'll also need to define a `load` function. The load function takes 
two arguments: 
- `data`: the value returned by `save`
- `existing?`: an existing object to populate, or `undefined`

The first time `load` is called, 
- `data` may contain unresolved object placeholders
- `existing` will be undefined, and `load` should return a new object

If there were unresolved placeholders the first time, `load` will be called a second time:
- `data` will have all its placeholders resolved 
- `existing` will contain the object returned by the first call, and `load` should repopulate it with the new data

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

- `test`: a function that detects objects of this type. Defaults to `(x) => x instance of type`
- `key`: a unique string identifier for this type. Defaults to `type.name`. If you have types with the same `type.name` 
(because they're from different packages for example) you'll need to give them distinct `key`s to keep them straight

## Todo

- Support other common javascript types
- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
