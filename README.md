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

Or, if you don't want to use the global stasher, create your own stasher instance:

```javascript
import { getStasher } from "json-stash";
const stasher = getStasher();

const stashed = stasher.stash(anything);
const unstashed = stasher.unstash(stashed);
```


Simple classes with public fields just need to be added.

```javascript
import { addClass } from 'json-stash';

class Point { constructor(x, y) { this.x = x; this.y = y } }

addClass(Point)
unstash(stash(new Point(5, 6)));
// Point { x: 5, y: 6 }
```

For classes with private fields, supply `save` and `load` methods.

```javascript
class ImmutablePoint { 
    constructor(x,y) { this.#x = x; this.#y = y } 
    xy() { return [this.#x, this.#y] }
}

addClass(ImmutablePoint, {
  save: (point) => point.xy(), 
  load: ([x, y]) => new ImmutablePoint(x, y) 
})
const stashed = stash(new ImmutablePoint(5, 6));
// '{"$type":"ImmutablePoint","data":[5,6]}'
const unstashed = unstash(stashed);
// ImmutablePoint {}
unstashed.xy();
// [5, 6]
```

Just about anything else can be handled with a custom serializer.

```typescript
import { addSerializer } from 'json-stash'

addSerializer({ 
  key: "book", 
  test: (obj) => title in obj && text in obj,
  save: ({ title, text }) => { localStorage.setItem(title, text); return title },
  load: (title) => ({ title, text: localStorage.getItem(title) })
})
const stashed = stash({ title: "Moby Dick", text: mobyDickText });
// '{"$type":"book","data":"Moby Dick"}' -- with side effect of storing text in localStorage
unstash(stashed);
// { title: "Moby Dick", text: <text loaded from localStorage> }
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

### Duplicate references
Circular references are a special case of duplicate references. 
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

Most other types can be supported using the `addClass` and `addSerializers` functions. 
See [User-defined types](#user-defined-types) for details.

## User-defined types

You can handle custom types by defining custom serializers for them. For example,
let's say you have a datatype that represents a linear equation:

```typescript
const makeLine = (m, b) => ({
  type: "Line",
  y: (x) => m * x + b,
  mb: () => [m, b],
});

const line = makeLine(2, 3);
line.y(4); // 11
```

To stash this successfully, add a serializer for it.

```javascript
import { addSerializers, stash, unstash } from "json-stash";

addSerializers({
  key: "Line",
  test: (obj) => obj.type === "Line",
  save: (obj) => obj.mb,
  load: ([m, b]) => makeLine(m, b),
});

const stashed = stash(line);
// '{"$type":"Line","data":[2,3]}'
unstash(stashed).y(4);
// 11
```

### Serializers

A serializer has this signature:

```typescript
interface Serializer<Type, Data> {
  key: string;
  test: (obj: unknown) => boolean;
  save: (obj: Type) => Data;
  load: (data: Data) => Type;
  update?: (obj: Type, data: Data) => void;
}
```

When `stash` encounters an object `x` and finds a serializer for which `serialzier.test(x)` returns `true`, it converts `x` to

```javascript
{ $type: serializer.key, data: serializer.save(x) }
```

When `unstash` encounters this and finds a serializer with a matching `key`, it recreates the object with `serializer.load(data)`.

The `update` function is only necessary if your object can contain other objects. It's used to resolve circular and duplicate references. 
When `unstash` finds re-referenced objects, it uses a two-phase method for deserialization:

- phase 1: calls `load` with data that contains placeholders for re-referenced objects
- phase 2: calls `update` with the object returned by `load` and new data with placeholders resolved; `update` must mutate the object in place

```javascript
function makePerson(friends) {
  friends = [...friends];
  return {
    type: "Person",
    getFriends: () => [...friends],
    setFriends: (newFriends) => (friends = [...newFriends]),
  };
}

addSerializers({
  key: "Person",
  test: (obj) => obj.type === "Person",
  save: (person) => person.getFriends(),
  load: (friends) => makePerson(friends),
  update: (person, friends) => person.setFriends(friends),
});

const loner = makePerson([]);
loner.setFriends([loner]);

const unstashedLoner = unstash(stash(loner));
unstashedLoner.getFriends() === [unstashedLoner];
// true
```

If `unstash` finds re-referenced objects and no `update` method has been provided, it will throw a runtime error.

```javascript
addSerializers({
  key: "Person",
  test: (obj) => obj.type === "Person",
  save: (person) => person.getFriends(),
  load: (friends) => makePerson(friends),
});

const loner = makePerson([]);
loner.setFriends([loner]);

const unstashedLoner = unstash(stash(loner));
// throws Error
```

## Classes

Use `addClass` to make a class stashable.

```javascript
import { addClasses, stash, unstash } from "json-stash";

class Line {
  constructor(m, b) { this.m = m; this.b = b }
  y(x) { return this.m * x + this.b }
}

addClass(Line);

const line = new Line(2, 3);
const unstashed = unstash(stash(line));
// Line { m: 2, b: 3 }
unstashed.y(4);
// 11
```

`addClass(K)` is sufficient for simple classes with public fields. It creates a serializer that looks like this:

```javascript
{
  key: K.name,
  test: (obj) => obj instanceof K,
  save: (obj) => ({ ...obj }),
  load: (data) => Object.assign(new K(), data),
  update: (obj, data) => Object.assign(obj, data),
}
```

### `addClass` options: `save`, `load`

In cases where an `obj` of class `K` can't be cloned with `Object.assign(new K(), { ...obj })` 
(because the class has private fields, for example, or the constructor can't be called without arguments),
you can provide custom `save` and `load` options.

```javascript
class Line {
  constructor(m, b) { this.#m = m; this.#b = b }
  y(x) { return this.#m * x + this.#b }
  getData() { return { m: this.#m, b: this.#b } }
}

addClass(Line, { 
  save: (obj) => obj.getData(), 
  load: ({ m, b }) => new Line(m, b)
});

const stashed = stash(new Line(2, 3));
// '{"$type":"Line","data":{"m":2,"b":3}}'
unstash(stashed).y(4);
// 11
```

Strings are interpreted as method names. For `obj` of class `K`, `save: "method"` is 
equivalent to `save: (obj) => obj.method()`, and `load: "method"` is equivalent to `load: (data) => K.method(data)`. 
Note that the `load` method must be static.

```javascript
class Line {
  constructor(m, b) { this.#m = m; this.#b = b }
  y(x) { return this.#m * x + this.#b }
  getData() { return { m: this.#m, b: this.#b } }
  static fromData({ m, b }) { return new Line(m, b) }
}

addClass(Line, { save: "getData", load: "fromData" });
```

If `save` returns an array of constructor arguments, you can omit `load`, because it defaults to `new <Class>(...data)`.

```javascript
class Line {
  constructor(m, b) { this.#m = m; this.#b = b }
  y(x) { return this.#m * x + this.#b }
  getData() { return [this.#m, this.#b] }
}

addClass(Line, { save: "getData" });
```

### `addClass` options: `update`

If you supply a custom `save` function, there is no default `update` function.
You can omit `update` if your class doesn't contain other objects. Otherwise you must provide it, 
or risk runtime errors with input that contains circular or duplicate references.

```javascript
class Person {
  #friends = [];
  constructor(...friends) { this.setFriends(friends) }
  getFriends() { return [...this.#friends] }
  setFriends(friends) { this.#friends = [...friends] }
}

const loner = makePerson([]);
loner.setFriends([loner]);

// without `update`
addClass("Person", { save: "getFriends" });
unstash(stash(loner));
// throws Error: no update function found

// with `update`
addClass("Person", { save: "getFriends", update: "setFriends" });
const unstashedLoner = unstash(stash(loner));
unstashedLoner.getFriends() === [unstashedLoner];
// true
```

### `addClass` options: `key`

By default, `addClass` uses `<class>.name` as the `$type` key. If you have two classes with the same `<class>.name`
(because they come from different packages, for example), give them distinct keys.

```javascript
import { Agent as MI5Agent } from 'mi5';
import { Agent as CIAAgent } from 'cia';

MI5Agent.name === CIAAgent.name
// true -- both are 'Agent'
        
// so give them distinct `$type` keys
addClass(MI5Agent, { key: "MI5Agent" });
addClass(CIAAgent, { key: "CIAAgent" });

stash(new MI5Agent("James", "Bond"));
// '{"$type":"MI5Agent","data":{"first":"James","last":"Bond"}}'
stash(new CIAAgent("Ethan", "Hunt"));
// '{"$type":"CIAAgent","data":{"first":"Ethan","last":"Hunt"}}'
```

### `addClass` options: summary

```typescript
interface AddClassOptions<K, Data> = {
  // key for stashing `{ $type: key, data }`
  // if undefined, use `K.name`
  key?: string;

  // the data to stash
  // if a string, use `obj[save]()`
  // if a function, use `save(obj)`
  // if undefined, use `{ ...obj }`
  save?: string | ((obj: K) => Data); 

  // recreates an object from data
  // if a string, use `K[load](data)`
  // if a function, use `load(data)`
  // if `save` is defined and `load` isn't, use `new K(...data)`
  // if both `load` and `save` are undefined, use `Object.assign(new K(), data)`
  load?: string | ((data: Data) => K); 

  // updates a previously loaded object with resolved data
  // if a string, use `obj[update](data)`
  // if a function, use `update(obj, data)`
  // if `save` is defined and `update` isn't, throw a runtime error
  // if both `update` and `save` are undefined, use `Object.assign(obj, data)`
  update?: string | ((obj: K, data: Data) => void); 
}
```
### Class decorator

For convenience, `json-stash` provides a TypeScript class decorator `@stashable` as an alternative to `addClasses`.
`@stashable(opts) class X {}` is equivalent to `class X {}; addClasses(X, opts)`
(unless you use the `group` option to defer adding—see [Playing well with others](#playing-well-with-others) for details).

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
class Agent {...}
// MI5 module
@stashable({ key: "MI5Agent" })
class Agent {...}

// for private field classes, provide a `save` function
// and, if needed, `load` and `update` functions
@stashable({ save: "getFriends", update: "setFriends" })
class Person {
  constructor(...friends) { this.setFriends(friends) }
  getFriends() { return [...this.#friends] }
  setFriends(friends) { this.friends = [...friends] }
}
```

`@stashable` should work under both of TypeScript’s decorator regimes—the stage 3 decorators introduced in TypeScript 5.0 or the still supported `--experimentalDecorators`.


## Playing well with others

The above examples add serializers/classes to the global stasher.
This might be what you want in a small project, but if you're working on something bigger and need to 
avoid collisions with other `json-stash` users,
you can create your own stasher instance and add serializers/classes to that.

```javascript
import { getStasher } from "json-stash";

class Thing {...}

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
If you want the classes added to the global stasher too, add them explicitly:

```javascript
addClasses(...stashable.group("corporate"));
```

or double up the decorators:

```javascript
@stashable()
@stashable({ group: "corporate" })
class Employee {}
```

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

Special types are rendered as `{ $type: <key>, data: <data> }`.

```javascript
stash(/search/gi);
// '{"$type":"RegExp","data":["search","gi"]}'
```

Each supported type has a serializer that defines how the `data` is saved and restored.
See [Serializers](#serializers) for details. The serializer for `RegExp` is

```javascript
{
  key: "RegExp",
  test: (value) => value instanceof RegExp,
  save: (value) => [value.source, values.flags],
  load: ([source, flags]) => new RegExp(source, flags),
}
```

### Escaping special properties

In the unlikely event that your original input contains `$ref` or `$type` properties, `stash` avoids choking on them by prepending an `$`,
which `unstash` duly removes.

```javascript
x = { $ref: "not a real ref" };

stash(x);
// '{"$$ref":"not a real ref"}'

unstash(stash(x));
// { $ref: "not a real ref" }
```

To be extra safe, this prepending cascades, in case the input also has `$$type` or `$$ref` properties:

```javascript
x = { $type: "not a type", $$type: "also not" };

stash(x);
// '{"$$type":"not a type","$$$type":"also not"}'

unstash(stash(x));
// { $type: "not a type", $$type: "also not" }
```

## More about serializers

### Serializer overriding

If two serializers return `test(obj) === true` for the same `obj` (when stashing) or have the same `key` (when unstashing), which one wins?
Answer: the most recently added one. The priority order is

1. serializers passed as arguments to `stash` or `unstash`
2. serializers added with `addSerializers`
3. built-in serializers

This allows you to override existing serializers with new ones.

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
You can't remove the built-in serializers (`Date`, etc). But you can override them 
by adding your own serializers for the same types.

### Just-this-time serializers

`stash` and `unstash` take an optional second parameter: an array of serializers.
These will be used for the current operation only, not added to the stasher's
serializer registry. Don't forget to `unstash` with the same serializers you used to `stash`!

```javascript
const stashed = stash(something, [unsharedSerializer]);
const unstashed = unstash(stashed, [unsharedSerializer]);
```

## Todo

- Log helpful messages when errors happen
- Do typescript better
- Add a changelog
