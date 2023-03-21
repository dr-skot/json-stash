# json-stash

Serialize and deserialize javascript data. Supports non-primitive types and circular references.

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

Support for other common types, and for user-defined types, is on the todo list.

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
leaders3p = {
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
- Support user-defined types 
- Protect against key collisions
