# json-stash

Serialize anything. `JSON.stringify` on steroids.
- handles circular and duplicate references
- supports all your favorite built-in types: 
  `Date`, `Error`, `RegExp`, 
  `Map`, `Set`, all the `Array`s, `ArrayBuffer`
  `BigInt`, `Infinity`, `NaN`, `Symbol`
- handles public-property classes automatically
- can be configured to handle anything else using custom serializers

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
dude = { name: "Dude", heads: 1, legs: ["left", "right"] };

JSON.stringify(dude);
// '{"name":"Dude","heads":1,"legs":["left","right"]}'

stash(dude);
// '{"name":"Dude","heads":1,"legs":["left","right"]}'
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
unstringified[22] === unstringified[24];
// false -- 22 and 24 are duplicates of each other

unstashed = unstash(stash(presidents));
unstashed[22] === unstashed[24];
// true -- 22 and 24 are the same object
```

### Built-in types

`stash` handles many common types that `JSON.stringify` punts on.

```javascript
landing = new Date("1969-07-21T02:56Z");
order = new Map([[1, "Armstrong"], [2, "Aldrin"]]);
steps = new Set(["small", "giant"]);
collect = /rock/g;

JSON.parse(JSON.stringify(landing));
// '1969-07-21T02:56:00.000Z' // string
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

Supported out of the box are `Date`, `Error`, `RegExp`,
`Map`, `Set`, all the `Array`s, `ArrayBuffer`
`BigInt`, `Infinity`, `NaN`, and `Symbol`.

You can support just about anything else using `addClasses` or `addSerializers`.

### Classes with public properties

Use `addClasses` to support simple classes with public properties.

```javascript
import { addClasses, stash, unstash } from 'json-stash';

class Agent {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }
  introduce() {
    return `My name is ${this.last}. ${this.first} ${this.last}.`;
  }
}
addClasses(Agent);

bond = new Agent("James", "Bond");

const parsed = JSON.parse(JSON.stringify(bond));
// { first: 'James', last: 'Bond' }
parsed.introduce();
// TypeError: parsed.introduce is not a function

const unstashed = unstash(stash(bond));
// Agent { first: 'James', last: 'Bond' }
unstashed.introduce();
// 'My name is Bond. James Bond.'
```

## Custom serializers

For objects with private properties you'll need to provide a serializer.

```javascript
import { addSerializers, stash, unstash } from 'json-stash';

class Agent {
  constructor(first, last) {
    this.#first = first;
    this.#last = last;
  }
  introduce() {
    return `My name is ${this.#last}. ${this.#first} ${this.#last}.`;
  }
  serialize() {
    return [this.#first, this.#last];
  }
}

const agentSerializer = {
  type: Agent, 
  save: (agent) => agent.serialize(),
};
addSerializers(agentSerializer);

const bond = new Agent("James", "Bond");

const parsed = JSON.parse(JSON.stringify(bond));
// {}
parsed.introduce();
// TypeError: parsed.introduce is not a function

const unstashed = unstash(stash(bond));
// Agent {}
unstashed.introduce();
// 'My name is Bond. James Bond.'
```

If you don't want to add your serializers globally, you can pass them as parameters to `stash` and `unstash`.

```typescript
const stashed = stash(new Agent("James", "Bond"), [agentSerializer]);
unstash(stashed, [agentSerializer]).introduce();
// 'My name is Bond. James Bond.'
```

Okay, but what's a serializer? See [Serializers](#serializers) for a complete run-down.

## How it works

Re-referenced objects are rendered as `{ $ref: "$.path.to.object" }`.

```javascript
egoist = {};
egoist.preoccupation = egoist;
vipList = [egoist, egoist];

stash(vipList);
// '[{"preoccupation":{"$ref":"$.0"}},{"$ref":"$.0"}]'
```

Special types are rendered as `{ $type: "type", data: <data> }`.

```javascript
stash(/search/gi);
// '{"$type":"RegExp","data":["search","gi"]}'
```

Each supported type has a serializer that defines how the `data` is saved and restored.
See [Serializers](#serializers) for more about serializers.

In order not to choke on input that already contains `$ref` or `$type` properties, `stash` escapes them.

```javascript
stash({ $type: "fake" }); 
// '{"$type":"fake","$esc":true}'

unstash(stash({ $type: "fake" }));
// { $type: "fake" }
```

And to not choke on input that already contains `$esc` properties, `stash` has a way of dealing with that too.

```javascript
stash({ $esc: false });
// '{"$esc":false,"$$esc":true}'

stash({ $esc: false, $$esc: null});
// '{"$esc":false,"$$esc":null,"$$$esc":true}'

unstash(stash({ $esc: false, $$esc: null }));
// { $esc: false, $$esc: null }
```

## Serializers

When `stash` encounters a non-vanilla object, it looks for a serializer to stringify it.

```typescript
interface Serializer<Type, Data> {
  // the object type to serialize, typically a class constructor (e.g. `Date`);
  type: new (...args: any[]) => Type;

  // returns the data needed to reconstruct the object
  save: (value: Type) => Data;

  // reconstructs the object from the data returned by `save`; default is `(data) => new type(...data)`
  load?: (data: Data, existing?: Type) => Type;

  // detects objects of this type; default is `(obj) => obj instanceof type`
  test?: (value: any) => boolean;

  // unique identifier for this type; default is `type.name`
  key?: string;
}
```

If `stash` finds a serializer for which `test(object)` returns true, it serializes the object as 
`{ $type: key, data: serializer.save(object) }`. 

Later, when `unstash` encounters that string, it looks for a serializer with a matching `key` and 
calls `serializer.load(data)` to deserialize the object.

Since `load`, `test`, and `key` have default values, the simplest serializer is just a `type` and a `save` function 
that returns an array of arguments to be passed to `new type`.
Here are the built-in serializers for `Date` and `RegExp`, for example:

```typescript
const serializers = [{
  type: Date,
  save: (date: Date) => [date.toISOString()],
}, {
  type: RegExp,
  save: (regex: RegExp) => [regex.source, regex.flags],
}];
```

This works great if your data is an array of primitive values. If the data might contain objects, though, you'll need to
provide a `load` function that takes an optional `existing` parameter.

To support circular references, `unstash` may need to call `load` twice.
On the first call,
- `data` may contain unresolved object placeholders
- `existing` will be undefined, and `load` should return a new object

*If* there were unresolved placeholders the first time, `load` will be called a second time:
- `data` will have all its placeholders resolved
- `existing` will contain the object returned by the first call, and `load` should repopulate it with the new data

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

The other optional serializer properties are:

- `test` detects objects `stash` should use this serializer for; defaults to `(x) => x instance of type`
- `key`: identifies the serializer `unstash` should use to resolve `{ $type: key }`; defaults to `type.name`. 
If you have types with the same `type.name` 
(because they're from different packages for example) you'll need to give them distinct `key`s to keep them straight

If two serializers return `test(obj) === true` (on `stash`) or have the same `key` (on `unstash`), which one wins? 
They're checked in this order:

1. serializers passed directly to `stash` or `unstash`
2. serializers added with `addSerializers` (starting with the most recently added)
3. built-in serializers

This allows new serializers to override old ones.

## Todo

- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
