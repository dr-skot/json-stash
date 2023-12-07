# json-stash

Serialize anything. `JSON.stringify` on steroids.
- handles circular and duplicate references
- supports all your favorite built-in types: 
  `Date`, `Error`, `RegExp`, 
  `Map`, `Set`, all the `Array`s, `ArrayBuffer`
  `BigInt`, `Infinity`, `NaN`, `Symbol`
- handles class instances with public properties automatically
- can be configured to handle just about anything else using custom serializers

## Installation

```bash
npm install json-stash
```

## Usage

```javascript
import { stash, unstash } from 'json-stash';

const stashed = stash(anything);
const unstashed = unstash(stashed);

// `stashed` is a string
expect(typeof stashed).toBe("string");

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

stash(egoist);
// '{"preoccupation":{"$ref":"$"}}'
unstash(stash(egoist));
// <ref *1> { preoccupation: [Circular *1] }
```

### Identical objects
Circular references are a special case of identical objects. 
When the input contains multiple references to the same object, `stash`
maintains those identities. `JSON.stringify` doesn't.

```javascript
grover = { name: "Cleveland" };
ben = { name: "Harrison" };
presidents = { 22: grover, 23: ben, 24: grover };

JSON.stringify(presidents);
// '{"22":{"name":"Cleveland"},"23":{"name":"Harrison"},"24":{"name":"Cleveland"}}'
stash(presidents);
// '{"22":{"name":"Cleveland"},"23":{"name":"Harrison"},"24":{"$ref":"$.22"}}'

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
const landing = new Date("1969-07-21T02:56Z");
JSON.stringify(landing);
// '"1969-07-21T02:56:00.000Z"'
JSON.parse(JSON.stringify(landing));
// '1969-07-21T02:56:00.000Z' // string
stash(landing);
// '{"$type":"Date","data":"1969-07-21T02:56:00.000Z"}'
unstash(stash(landing));
// 1969-07-21T02:56:00.000Z // Date object

const order = new Map([[1, "Armstrong"], [2, "Aldrin"]]);
JSON.stringify(order);
// '{}'
JSON.parse(JSON.stringify(order));
// {}
stash(order);
// '{"$type":"Map","data":[[1,"Armstrong"],[2,"Aldrin"]]}'
unstash(stash(order));
// Map(2) { 1 => 'Armstrong', 2 => 'Aldrin' }

const steps = new Set(["small", "giant"]);
JSON.stringify(steps);
// '{}'
JSON.parse(JSON.stringify(steps));
// {}
stash(steps);
// '{"$type":"Set","data":["small","giant"]}'
unstash(stash(steps));
// Set(2) { 'small', 'giant' }

const collect = /rock/g;
JSON.stringify(collect);
// '{}'
JSON.parse(JSON.stringify(collect));
// {}
stash(collect);
// '{"$type":"RegExp","data":["rock","g"]}'
unstash(stash(collect));
// /rock/g
```

Supported out of the box are `Date`, `Error`, `RegExp`,
`Map`, `Set`, all the `Array`s, `ArrayBuffer`,
`BigInt`, `Infinity`, `NaN`, and `Symbol`.

Most other types can be supported using the `addClasses` and `addSerializers` functions. 
See [User-defined types](#user-defined-types) for details.


## The encoding

The output is what you'd expect from `JSON.stringify`, with these enhancements:

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

### Escaping special properties

In order not to choke on input that already contains `$ref` or `$type` properties, `stash` escapes them by prepending a `$`,
and `unstash` duly unescapes them.

```javascript
stash({ $type: "fake" });
// '{"$$type":"fake"}'

unstash(stash({ $type: "fake" }));
// { $type: "fake" }
```

This cascades in case objects have `$$type` or `$$ref` properties too

```javascript
stash({ $ref: "not a ref", $$ref: "also not" });
// '{"$$ref":"not a ref","$$$ref":"also not"}'

unstash(stash({ $ref: "not a ref", $$ref: "also not" }));
// { $ref: "not a ref", $$ref: "also not" }
```

## User-defined types

### Public-property classes

For classes with public properties, just add them to `stash`'s class registry with `addClasses`.

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

const bond = new Agent("James", "Bond");

JSON.stringify(bond);
// '{"first":"James","last":"Bond"}'
JSON.parse(JSON.stringify(bond)).introduce();
// TypeError: JSON.parse(...).introduce is not a function

stash(bond);
// '{"$type":"Agent","data":{"first":"James","last":"Bond"}}'
unstash(stash(bond)).introduce();
// 'My name is Bond. James Bond.'
```

Note that `addClasses` uses `<class>.name` as the `$type` key by default. 
If you have two classes with the same `<class>.name` (because they come from different packages for example),
give them distinct `$type` keys by passing `[<class>, <key>]` pairs to `addClasses`.

```javascript
import { Agent as MI5Agent } from 'mi5';
import { Agent as CIAAgent } from 'cia';

MI5Agent.name === CIAAgent.name 
// true -- both are 'Agent'

// give them distinct keys in `stash`'s class registry 
// by passing [<class>, <key>] pairs
addClasses([MI5Agent, 'MI5Agent'], [CIAAgent, 'CIAAgent']);

stash(new MI5Agent("James", "Bond"));
// '{"$type":"MI5Agent","data":{"first":"James","last":"Bond"}}'
stash(new CIAAgent("Ethan", "Hunt"));
// '{"$type":"CIAAgent","data":{"first":"Ethan","last":"Hunt"}}'
```

### Anything else

For other types, you'll need to provide a custom serializer.
For example, for an agent class with private properties:

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
  load: (data) => new Agent(...data),
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

Okay, but what's a serializer?

## Serializers

Serializers specify how `stash` handles non-vanilla (non-JSON.stringifiable) objects.

```typescript
interface Serializer<Type, Data> {
  // the object type to serialize (e.g. `Date`);
  type: new (...args: any[]) => Type;

  // unique identifier for this type; default is `type.name`
  key?: string;

  // detects objects of this type; default is `(obj) => obj instanceof type`
  test?: (value: any) => boolean;

  // returns data which can be passed to `load` to reconstruct the object
  save: (value: Type) => Data;

  // reconstructs the object from the data returned by `save`
  load: (data: Data, existing?: Type) => Type;
}
```

When `stash` encounters a non-vanilla object, it searches its serializer list for a serializer that returns
`true` for `test(object)`. 

If it finds one, it uses that serializer's `key` and `save` properties to serialize the object as `{ $type: key, data: save(object) }`.
(If no serializer is found, it punts and uses `JSON.stringify`.)

Later, when `unstash` encounters `{ $type: key, data: data }`, it looks for a serializer with a matching `key`.

If it finds one, it calls `load(data)` to deserialize the object.
(If no serializer is found, it punts and uses `JSON.parse`.)

To illustrate, here are the built-in serializers for `Date` and `RegExp`:

```typescript
const serializers = [{
  type: Date,
  save: (date: Date) => date.toISOString(),
  load: (iso: string) => new Date(iso)
}, {
  type: RegExp,
  save: (regex: RegExp) => [regex.source, regex.flags],
  load: ([source, flags]: [string, string]) => new RegExp(source, flags)
}];
```

### `key` and `test`

The `key` and `test` properties are optional because they have sensible defaults. The default `key` is `type.name`, and the default `test` is `(obj) => obj instanceof type`. This is usually what you want,
but there are exceptions. For example, here's the built-in serializer for `BigInt`:

```typescript
const serializers = [{
  type: typeof BigInt(0),
  key: "bigint",
  test: (x: any) => typeof x === "bigint",
  save: (x: bigint) => x.toString(),
  load: (str) => BigInt(str),
}];
```

Also if you have multiple classes with the same `type.name` (because they come from different packages for example),
you'll want to give their serializers different `key`s so there's no conflict.

Speaking of conflict, if two serializers return `test(obj) === true` (on `stash`) or have the same `key` (on `unstash`), which one wins?
Answer: They're checked in this order:

1. serializers passed directly to `stash` or `unstash`
2. serializers added with `addSerializers` (starting with the most recently added)
3. built-in serializers

This allows newly-added serializers to override old ones.

### Nested objects

A single-argument `load` function works fine if your data doesn't reference any external objects.
If it does, you'll need a two-parameter function, because `load` might be called twice, 
in order to resolve circular or duplicate references, and the second call 
will pass an `existing` parameter which `load` should mutate in place:

On the first call,
- `data` may contain unresolved object placeholders of the form `{ $ref: "$.path.to.object" }`
- `existing` will be undefined, and `load` should return a new object

If there were unresolved placeholders the first time, `load` will be called a second time:
- `data` will have all its placeholders resolved
- `existing` will contain the object returned by the first call, which `load` should repopulate with the new data

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


## Todo

- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
