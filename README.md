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

This cascades in case objects have `$$type` or `$$ref` properties too:

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

A caveat is that `addClasses` uses `<class>.name` as the `$type` key by default. 
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
For example, say your agent class has private properties:

```javascript
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
```

You can support this by providing a serializer with `save` and `load` functions.
- `save` returns a value that's stashable, and
- `load` reconstructs the object from the value returned by `save`.


```javascript
import { addSerializers, stash, unstash } from 'json-stash';

const agentSerializer = {
  type: Agent, 
  save: (agent) => agent.serialize(),
  load: (data) => new Agent(...data),
};
// add this to stash's serializer registry
addSerializers(agentSerializer);

const bond = new Agent("James", "Bond");

// JSON.stringify: nope
const parsed = JSON.parse(JSON.stringify(bond));
// {}
parsed.introduce();
// TypeError: parsed.introduce is not a function

// stash ftw
const unstashed = unstash(stash(bond));
// Agent {}
unstashed.introduce();
// 'My name is Bond. James Bond.'
```

See the next section for more about serializers.


## Serializers

`stash` uses serializers to convert non-vanilla (ie, non-`JSON.stringify`-able) objects
to the format `{ $type: <key>, data: <data> }`,

A serializer specifies
- the `type` of object it handles
- a `test` function to identify objects of that type,
- a `key` to use for `<key>`,
- a `save` function to convert the object to `<data>`
- a `load` function to convert `<data>` back to an object

For example, here is the built-in serializer for `Date`:

```typescript
{
  type: Date,
  save: (date: Date) => date.toISOString(),
  load: (iso: string) => new Date(iso)
}
```

Note that the `key` and `test` properties are optional, because they have sensible defaults:
- `key: type.name`
- `test: (obj) => obj instanceof type`. 

This is usually what you want, but there are exceptions. 
Sometimes `type` is not a class. Here's the built-in serializer for `BigInt`, for example:

```typescript
{
  type: typeof BigInt(0),
  key: "bigint",
  test: (x: any) => typeof x === "bigint",
  save: (x: bigint) => x.toString(),
  load: (str: string) => BigInt(str),
}
```

Also, if you have two classes with the same `<class>.name` (because they come from different packages for example),
you'll need to give them distinct `key`s to avoid conflicts.

### Nested objects

For objects like `Date` and `BigInt` that don't contain any externally accessible objects, 
deserialization is straightforward, and a single-parameter `load` function is all you need.

For objects that might contain externally accessible objects, like `Map` or `Set`,
a two-parameter `load` function is needed, because deserialization might involve multiple passes
to resolve circular and duplicate references. In this case, `load` will be called more than once, and 
repeat calls will pass an existing object as a second parameter which must be mutated in place.

```typescript
function load<Type, Data>(data: <Data>, existing?: <Type>): <Type>
```

On the first call,
- `data` may contain unresolved object placeholders of the form `{ $ref: "$.path.to.object" }`
- `existing` will be undefined, and `load` should return a new object

On subsequent calls,
- `data` will have its placeholders resolved
- `existing` will contain the object returned by the first call, which `load` should mutate in place, 
populating it with the new `data`

For example, here's the built-in serializer for `Map`:

```typescript
{
  type: Map,
  save: (map: Map<unknown, unknown>) => [...map],
  load: (data: [unknown, unknown][], map = new Map()) => {
    map.clear();
    for (const [k, v] of data) map.set(k, v);
    return map;
  }
}
```

### `key` and `test` conflicts

If two serializers return `test(obj) === true` (on `stash`) or have the same `key` (on `unstash`), which one wins?
Answer: They're checked in this order:

1. serializers passed directly to `stash` or `unstash`
2. serializers added with `addSerializers` (starting with the most recently added)
3. built-in serializers

This allows newly-added serializers to override old ones.


## Todo

- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
