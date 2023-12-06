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
`Map`, `Set`, all the `Array`s, `ArrayBuffer`
`BigInt`, `Infinity`, `NaN`, and `Symbol`.

### Class instances

For classes with public properties, just add them to the `stash` class registry with `addClasses`.

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

Note that `addClasses` uses the `<class>.name` as the `$type` key by default. 
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

### Almost anything else

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
  // the object type to serialize, typically a class constructor (e.g. `Date`);
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

When stash encounters a non-vanilla object, it searches its serializer list for a serializer that returns
`true` for `test(object)`. 

If it finds one, it uses the serializer's `key` and `save` properties to serialize the object as `{ $type: key, data: save(object) }`.
If no serializer is found, it punts with `JSON.stringify`.

Later, when `unstash` encounters `{ $type: key, data: data }`, it looks for a serializer with a matching `key`.

If it finds one, it calls `load(data)` to deserialize the object.
If no serializer is found, it punts with `JSON.parse`.

The default `key` is `type.name`. The default `test` is `(obj) => obj instanceof type`.

For example, here are the built-in serializers for `Date` and `RegExp`:

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

### Nested objects

A single-argument `load` function works great if your data doesn't reference any external objects.
If it does, `load` might be called a second time, to resolve circular or duplicate references. 
The second call will pass an `existing` parameter, which `load` should mutate in place.

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

The optional serializer properties are:

- `test`: detects objects `stash` should use this serializer for; defaults to `(x) => x instance of type`
- `key`: identifies the serializer `unstash` should use to resolve `{ $type: key }`; defaults to `type.name`.
  If you have types with the same `type.name`
  (because they're from different packages for example) you'll need to give them distinct `key`s to keep them straight

If two serializers return `test(obj) === true` (on `stash`) or have the same `key` (on `unstash`), which one wins?
They're checked in this order:

1. serializers passed directly to `stash` or `unstash`
2. serializers added with `addSerializers` (starting with the most recently added)
3. built-in serializers

This allows new serializers to override old ones.

## JSON encoding

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



## Todo

- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
