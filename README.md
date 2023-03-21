# json-stash

Serialize and deserialize javascript data to/from JSON. Supports non-primitive types and circular references.

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

## Non-primitive types

`JSON.stringify/parse` doesn't support non-primitive data. `Date`s get converted to strings, and most other objects become `{}`.

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
  key: 'MoonGuy',
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

- `key`: a unique identifier for your type. Unless you want to override
the default serializers for `Date`, `RegExp`, `Map`, or `Set`, don't use those keys.

- `type`: the type of objects to serialize (detected by `x instanceof type`—or if that's not the right test, 
you can define a custom `test` function)

- `test`: (optional) a custom test to detect this type of object. Defaults to `(x) => x instance of type`.

- `save`: should normally return an array of parameters to pass to the `new type` constructor—or 
if reconstructing your object is more complicated than that, you can define a custom `load` function

- `load`: (optional) reconstructs the object using the data returned by `save`. 
Defaults to `(data) => new type(...data)`

If your object can contain other objects, you'll also need a `deref` function 
to handle circular/duplicate references.

- `deref`: (optional) dereferences any reference placeholders inside the object. 
Receives the object and a deref function. Must modify the object in place.

Here's the `Map` serializer for example:

```javascript
const mapSerializer = {
  key: "Map",
  type: Map, 
  save: (value: Map<unknown, unknown>) => [[...value]],
  deref: (obj: Map<unknown, unknown>, deref) => {
    for (const [key, value] of obj) {
      const newKey = deref(key);
      const newValue = deref(value);
      if (newKey !== key) obj.delete(key);
      if (newKey !== key || newValue !== value) obj.set(newKey, newValue);
    }
  },
};
```

## Caveats

`stash` inserts special objects into the data structure to represent non-primitive types and duplicate references.

```typescript
type NonPrimitive = { _stashType: string, data: any }
type Ref = { _stashRef: string }
```

So if you have `_stashType` or `_stashRef` keys in your actual data, it will mess things up. 
Presumably the likelihood of such a key collision is slim. Protecting against it is on the todo list.

## Todo

- Support other common types
- Protect against key collisions with `_stashType` and `_stashRef`
