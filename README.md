# json-stash

Serialize anything. `JSON.stringify` on steroids.
- handles circular and duplicate references
- supports all your favorite built-in types: 
  `Date`, `Error`, `RegExp`, 
  `Map`, `Set`, all the `Array`s, `ArrayBuffer`
  `BigInt`, `Infinity`, `NaN`, `Symbol`
- handles class instances with public properties automatically
- can be configured to handle just about anything else using custom serializers

1.4k when minified and gzipped. No dependencies.


## Installation

```bash
npm install json-stash
```


## Usage

```javascript
import { stash, unstash } from "json-stash";

const stashed = stash(anything);
const unstashed = unstash(stashed);

// `stashed` is a string
expect(typeof stashed).toBe("string");

// `unstashed` is a deep copy of `anything`
expect(unstashed).toEqual(anything);
```

Or if you need to play well with others,
  
```javascript
import { getStasher } from "json-stash";
const stasher = getStasher();

const stashed = stasher.stash(anything);
const unstashed = stasher.unstash(stashed);
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

The output of `stash` is what you'd expect from `JSON.stringify`, with these enhancements:

Re-referenced objects are rendered as `{ $ref: "$.path.to.object" }`.

```javascript
egoist = {};
egoist.preoccupation = egoist;
vipList = [egoist, egoist];

stash(vipList);
// '[{"preoccupation":{"$ref":"$.0"}},{"$ref":"$.0"}]'
```

Special types are rendered as `{ $type: <type>, data: <data> }`.

```javascript
stash(/search/gi);
// '{"$type":"RegExp","data":["search","gi"]}'
```

Each supported type has a serializer that defines how the `data` is saved and restored.
See [Serializers](#serializers) for details.

### Escaping special properties

In order not to choke on input that already contains `$ref` or `$type` properties, `stash` escapes them by prepending a `$`,
and `unstash` duly unescapes them.

```javascript
stash({ $ref: "not a real ref" });
// '{"$$ref":"not a ref"}'

unstash(stash({ $ref: "not a real ref" }));
// { $ref: "not a ref" }
```

The `$`-prepending cascades, in case objects also have `$$type` or `$$ref` properties:

```javascript
stash({ $ref: "not a ref", $$ref: "also not" });
// '{"$$ref":"not a ref","$$$ref":"also not"}'

unstash(stash({ $ref: "not a ref", $$ref: "also not" }));
// { $ref: "not a ref", $$ref: "also not" }
```


## Classes

### Public-field classes

For classes with public fields, just add them to `stash`'s registry with `addClass`.

```javascript
import { addClasses, stash, unstash } from "json-stash";

class Agent {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }
  introduce() {
    return `My name is ${this.last}. ${this.first} ${this.last}.`;
  }
}
addClass(Agent);

const bond = new Agent("James", "Bond");

// stringify: nope
JSON.stringify(bond);
// '{"first":"James","last":"Bond"}'
JSON.parse(JSON.stringify(bond)).introduce();
// TypeError: JSON.parse(...).introduce is not a function

// stash ftw
stash(bond);
// '{"$type":"Agent","data":{"first":"James","last":"Bond"}}'
unstash(stash(bond)).introduce();
// 'My name is Bond. James Bond.'
```

A caveat is that `addClass` uses `<class>.name` as the `$type` key by default. 
If you have two classes with the same `<class>.name` (because they come from different packages for example),
give them distinct keys by passing a second parameter to `addClass`.

```javascript
import { Agent as MI5Agent } from 'mi5';
import { Agent as CIAAgent } from 'cia';

MI5Agent.name === CIAAgent.name 
// true -- both are 'Agent'

// so give them distinct `$type` keys in `stash`'s registry 
addClass(MI5Agent, { key: "MI5Agent" });
addClass(CIAAgent, { key: "CIAAgent" });

stash(new MI5Agent("James", "Bond"));
// '{"$type":"MI5Agent","data":{"first":"James","last":"Bond"}}'
stash(new CIAAgent("Ethan", "Hunt"));
// '{"$type":"CIAAgent","data":{"first":"Ethan","last":"Hunt"}}'
```

### Private-field classes

If your class has private fields, you'll need to provide a `save` function. In the simplest case, `save`
returns an array of arguments to pass to the class constructor.

```javascript
class Agent {
  constructor(first, last) {
    this.#first = first;
    this.#last = last;
  }
  serialize() { 
      return [this.#first, this.#last] 
  }
  introduce() {
    return `My name is ${this.#last}. ${this.#first} ${this.#last}.`;
  }
}
addClass(Agent, { save: "serialize" });

const bond = new Agent("James", "Bond");
const unstashed = unstash(stash(bond));
// Agent {}
unstashed.introduce();
// 'My name is Bond. James Bond.'
```

`save` can be the name of a method, as above, or a function that takes the object as an argument:

```javascript
class Agent {
  constructor(first, last) {
    this.#first = first;
    this.#last = last;
  }
  getFirst() { return this.#first }
  getLast() { return this.#last }
}

addClass(Agent, { save: (agent) => [agent.getFirst(), agent.getLast()] });
```

If `save` doesn't return constructor arguments, you'll have to
provide a `load` function that reconstructs the object from the data returned by `save`.

```javascript
class Agent {
  constructor(first, last) {
    this.#first = first;
    this.#last = last;
  }
  serialize() {
    return { first: this.#first, last: this.#last };
  }
}

addClass(Agent, { 
  save: "serialize", 
  load: ({ first, last }) => new Agent(first, last) 
});
```

`load` can be a function, as above, or the name of a static method:

```javascript
class Agent {
  constructor(first, last) {
    this.#first = first;
    this.#last = last;
  }
  serialize() {
    return { first: this.#first, last: this.#last };
  }
  static deserialize({ first, last }) {
    return new Agent(first, last);
  }
}
addClass(Agent, { save: "serialize", load: "deserialize" });
```

If your object can contain other objects, you'll need to provide an `update` method as well, 
to support circular/duplicate references. 
When there are duplicate references in the original input, 
unstashing involves two phases: 
- phase 1: call `load` with placeholder data for re-referenced objects; 
- phase 2: resolve placeholders and call `update` with the resolved data.

```javascript
class BFF {
  constructor(bff) { this.#bff = bff }
  getBff() { return this.#bff }
  setBff(bff) { this.#bff = bff }
}

addClass(BFF, { 
  save: "getBff",
  load: (bff) => new BFF(bff), 
  update: "setBff"
});

const egoist = new BFF();
egoist.setBff(egoist);

const unstashed = unstash(stash(egoist));
unstashed.getBff() === unstashed;
// true
```

`update` can also be a function that takes the object and data as arguments:

```javascript
addClass(BFF, {
  save: (person) => [person.getBff()],
  update: (person, [bff]) => person.setBff(bff),
})
```

If duplicate references need to be resolved and no `update` method has been provided, `unstash` will throw an error.

```javascript
addClass(BFF, { save: (person) => [person.getBff()] });

const egoist = new BFF();
egoist.setBff(egoist);

const unstashed = unstash(stash(egoist));
// throws Error: json-stash: Second pass required while unstashing but no update method found for BFF
```

### Class decorator

For convenience, `json-stash` provides a TypeScript class decorator `@stashable`as an alternative to `addClasses`.
`@stashable(opts) class X {}` is equivalent to `class X {}; addClasses(X, opts)` 
(unless you use the `group` option—see [next section](#playing-well-with-others) for details).

```javascript
import { stashable } from "json-stash";

// for public-field classes no arguments are necessary
@stashable()
class Person {
  constructor(first, last) {
    this.first = first;
    this.last = last;
  }
}

// provide unique keys to differentiate classes with the same name
// CIA module
@stashable({ key: "CIAAgent" })
class Agent {}
// MI5 module
@stashable({ key: "MI5Agent" })
class Agent {}

// for private field classes, provide a `save` function
// and, if needed, `load` and `update` functions
@stashable({
  save: "getBff",
  load: (bff) => new BFF(bff),
  update: "setBff"
})
class BFF {
  constructor(bff) { this.#bff = bff }
  getBff() { return this.#bff }
  setBff(bff) { this.#bff = bff }
}
```

`@stashable` should work under both of TypeScript’s decorator regimes—the stage 3 decorators introduced in TypeScript 5.0 or the earlier stage 2 decorators using the `--experimentalDecorators` flag.

### Playing well with others

The above examples add classes to the global stasher.
This might be what you want in a small project, but if you're working on something bigger and need to avoid collisions with other `json-stash` users, 
you can create your own stasher instance and add classes to that.

```javascript
import { getStasher } from "json-stash";

class Thing {}

const stasher = getStasher();
stasher.addClass(Thing);
const stashed = stasher.stash(new Thing());
const unstashed = stasher.unstash(stashed);
```

To accomplish this with the decorator syntax, use `@stashable` to create a group of classes, then add them to a stasher.

```javascript
import { stashable, getStasher } from "json-stash";

@stashable({ group: "corporate" })
class Employee {}

@stashable({ group: "corporate" })
class Department {}

const myStasher = getStasher();
myStasher.addClasses(...stashable.group("corporate"));
```

Note that specifying a `group` tells `@stashable` not to add the class to the global stasher. 
If you want the classes added to the global stasher too, you can add them explicitly:

```javascript
addClasses(...stashable.group("corporate"));
```

or double up the decorators:

```javascript
@stashable()
@stashable({ group: "corporate" })
class Employee {}
```

## Other data

You can stash just about anything using a custom serializer.

```typescript
import { addSerializers, stash, unstash } from "json-stash";

function getQueue(items: any[]) {
  items = [...items];
  return {
    isQueue: true,
    enqueue: (item: any) => items.unshift(item),
    dequeue: () => items.pop(),
    save: () => [...items],
    set: (newItems: any[]) => (items = newItems),
  };
}
type Queue = ReturnType<typeof getQueue>;

addSerializers({
  key: "Queue",
  type: Object,
  test: (obj) => obj.isQueue,
  save: (queue: Queue) => queue.save(),
  load: (data: any[], existing?: Queue) => {
    if (!existing) return getQueue(data);
    existing.set(data);
    return existing;
  },
});

// make it circular
const q = getQueue([]);
q.enqueue(q);

// stringify: nope
const parsed = JSON.parse(JSON.stringify(q));
parsed.dequeue() === parsed;
// throws TypeError: parsed.dequeue is not a function

// stash ftw
const unstashed = unstash(stash(q));
parsed.dequeue() === unstashed;
// true
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

## Playing well with others

The above examples use a global stasher object, which any client can `addClasses` or `addSerializers` to. 
This might be what you want in a small project, but if you're writing a library or working on something bigger, 
you can use `getStasher` to create an independent stasher
with its own serializer list.

```javascript
import { getStasher } from "json-stash";
const stasher = getStasher();
stasher.addClasses(...someClasses);
stasher.addSerializers(...someSerializers);
stasher.stash(something);
```

Or, if you prefer the bare function names,

```javascript
import { getStasher } from "json-stash";
const { stash, unstash, addClasses, addSerializers } = getStasher();
```

`getStasher` returns a plain object, not a class instance, so you don't need to `bind`.


## Other API bits

### Removing serializers

You can remove all serializers added to a stasher with `clearSerializers`

```javascript
stasher.clearSerializers();
```
  
or remove particular ones by passing their keys to `removeSerializers`.

```javascript
stasher.removeSerializers('MI5Agent', 'CIAAgent');
```

This removes only the most recently added serializer for each key. So if one
`MI5Agent` serializer is overriding an earlier one,
`removeSerializers('MI5Agent')` will expose the previous one.

Only serializers added with `addSerializers` can be removed.
You can't remove the built-in serializers (`Date`, etc)—but you can override them 
by adding your own serializers with the same keys.

### Just-this-time serializers

`stash` and `unstash` take an optional second parameter, an array of serializers.
These will be used for the current operation only, not added to the stasher's
serializer registry. Don't forget to `unstash` with the same serializers you used to `stash`!

```javascript
const stashed = stash(something, [unsharedSerializer]);
const unstashed = unstash(stashed, [unsharedSerializer]);
```

### Decorators

The `@stashable` decorator adds a class to the default stasher's class registry:

```typescript
import { stashable } from "json-stash";
@stashable()
class Agent {}
```

is equivalent to

```typescript
import { addClasses } from "json-stash";
class Agent {}
addClasses(Agent);
```

The default `key` for encoding class objects is `class.name`. 
You can pass an explicit `key` to avoid conflicts:

```typescript
// in CIA module
@stashable({ key: 'CIAAgent' })
class Agent {}

// in MI5 module
@stashable({ key: 'MI5Agent' })
class Agent {}
```

This is the same as

```typescript
// in CIA module
class Agent {}
addClasses([Agent, 'CIAAgent']);

// in MI5 module
class Agent {}
addClasses([Agent, 'CIAAgent']);
```

If you don't want to pollute the default stasher, 
you can specify a stashable group and add it to a specific stasher later:

```typescript
import { stashable } from "json-stash";

@stashable({ group: 'corporate' })
class Employee {}

@stashable({ group: 'corporate' })
class Department {}
```

Then later,

```typescript
import { stashable, getStasher } from "json-stash";
const myStasher = getStasher();
myStasher.addClasses(...stashable.group('corporate'));
```

For classes that can't be serialized like objects (because they have private properties, or require special processing), 
you can identify save and load methods using special subdecorators of `@stashable`:

```typescript
import { stashable } from "json-stash";

@stashable()
class Agent {
    #first: string;
    #last: string;
    constructor(first, last) {
        this.#first = first;
        this.#last = last;
    }
    introduce() {
        return `My name is ${this.#last}. ${this.#first} ${this.#last}.`;
    }
    @stashable.save
    serialize() {
        return [this.#first, this.#last];
    }
    @stashable.load
    static deserialize([first, last]) {
        return new Agent(first, last);
    }
}

const agent = new Agent("James", "Bond");
const unstashed = unstash(stash(agent));
unstashed.introduce();
// 'My name is Bond. James Bond.'
```

The `@stashable.load` method should be static and return a new object using the data returned by the `@stashable.save` method.

## Todo

- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
