# json-stash

Serialize anything. `JSON.stringify` [on steroids](#it's-like-json-stringify).
- handles circular and duplicate references
- supports all your favorite built-in types: 
  `Date`, `RegExp`, `Map`, `Set`, `Error` and all its subclasses, all the `Array`s, `ArrayBuffer`,
  `BigInt`, `Infinity`, `NaN`, `Symbol`
- handles class instances with public properties automatically
- can be configured to handle just about anything else using [custom serializers](#custom-serializers)

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

Just about anything else can be supported by defining [custom serializers](#custom-serializers). 


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
JSON.parse(JSON.stringify(landing));
// '1969-07-21T02:56:00.000Z' // string
unstash(stash(landing));
// 1969-07-21T02:56:00.000Z // Date object

const order = new Map([[1, "Armstrong"], [2, "Aldrin"]]);
JSON.parse(JSON.stringify(order));
// {}
unstash(stash(order));
// Map(2) { 1 => 'Armstrong', 2 => 'Aldrin' }

const steps = new Set(["small", "giant"]);
JSON.parse(JSON.stringify(steps));
// {}
unstash(stash(steps));
// Set(2) { 'small', 'giant' }

const collect = /rock/g;
JSON.parse(JSON.stringify(collect));
// {}
unstash(stash(collect));
// /rock/g
```

Supported out of the box are `Date`, `RegExp`,
`Map`, `Set`, `Error` and all its subclasses, all the `Array`s, `ArrayBuffer`,
`BigInt`, `Infinity`, `NaN`, and `Symbol`.

Most other types can be supported using the `addClass` and `addSerializer` functions. 
See [User-defined types](#user-defined-types) for details.

## How it works

`stash` converts non-`JSON.stringify`able values in its input to

```javascript
{ $type: key, data: data }
```

Where `data` is `JSON.stringify`able, or something that can in turn be `stash`ed.

To do this, it maintains a library of _serializers_ for the datatypes it supports. Each serializer provides 
 
- a `test` function to identify instances of the datatype
- `save` and `load` functions, such that `load(save(value))` returns a copy of `value`.
- a string `key` to identify this serializer

When `stash` encounters a value, it searches its library for a serializer for which `serializer.test(value) === true`,
if it finds one, it converts `value` to

```javascript
{ $type: serializer.key, data: serialzier.save(value) }
```

When `unstash` encounters this, it looks up serializer with that `key` and calls `serializer.load(data)` to recreate the original value.

Here's the built-in serializer for `RegExp`, for example:

```javascript
{
    test: (value) => value instanceof RegExp,
    key: "RegExp",
    save: (regexp) => [regexp.source, regexp.flags],
    load: ([source, flags]) => new RegExp(source, flags)
}
```

and here it is in action:

```javascript
stash(/search/gi);
// '{"$type":"RegExp","data":["search","gi"]}'
unstash(stash(/search/gi));
// /search/gi
```

### Re-referenced objects

If `stash` finds the same object more than once in the input, it replaces the repeat occurrences with placeholders:

```javascript
{ $ref: "$.path.to.first.occurrence" }
```

When `unstash` encounters these, it deserializes any objects containing them in multiple stages:

1. `object = load(data)`, with placeholders in the data
2. `update(object, resolvedData)`, with placeholders resolved

So serializers for objects that can contain re-referenced objects must provide an `update` function that updates
the `object` in place with the new `resolvedData`.

Here's the built-in serializer for `Map`, for example:

```javascript
{
  test: (value) => value instanceof Map,
  key: "Map",
  save: (map) => [...map],
  load: (entries) => new Map(entries),
  update: (map, entries) => {
    entries.forEach(([key, value]) => map.set(key, value));
  }
}
```

and here it is in action, with a circular reference:

```javascript
const loner = new Map();
loner.set("friend", loner);
stash(loner);
// '{"$type":"Map","data":[["friend",{"$ref":"$"}]]}'
const unstashedLoner = unstash(stash(loner));
// <ref *1> Map(1) { 'friend' => [Circular *1] }
unstashedLoner.get("friend").get("friend") === unstashedLoner;
// true
```


## Custom serializers

You can add custom serializers to handle your own types. For example,
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

To stash `line` successfully, define a serializer for it.

```javascript
import { addSerializer, stash, unstash } from "json-stash";

addSerializer({
  test: (obj) => obj.type === "Line",
  key: "Line",
  save: (obj) => obj.mb(),
  load: ([m, b]) => makeLine(m, b),
});

const stashed = stash(line);
// '{"$type":"Line","data":[2,3]}'
unstash(stashed).y(4);
// 11
```

### Serializers

A serializer has this TypeScript signature:

```typescript
interface Serializer<Type = any, Data = any> {
  test: (value: unknown) => boolean;
  key: string;
  save: (value: Type) => Data;
  load: (data: Data) => Type;
  update?: (value: Type, data: Data) => void;
}
```

If `test(value)` returns true, `stash` will convert `value` to `{ $type: key, data: save(value) }`
and `unstash` will convert `{ $type: key, data }` to `load(data)`.

So `load(save(value))` should clone `value` if `test(value)` returns true. 

The optional `update` function takes a value returned by `load`, which may contain placeholders for re-referenced objects, 
and updates it with placeholder-resolved data. 
You can omit `update` if you know your `value` will never contain re-referenced objects. 
But if you're wrong about that and `update` is missing when it's needed, `unstash` will throw an error.

<!-- TODO example of this error -->

See [How it works](#how-it-works) for more details about the `stash`/`unstash` process.


## Classes

The `addClass` method simplifies defining serializers for classes.

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

`addClass(K)` is all you need for simple classes with public properties. It generates a serializer like this:

```javascript
{
  test: (value) => value instanceof K,
  key: K.name,
  save: (value) => ({ ...value }),
  load: (data) => Object.assign(new K(), data),
  update: (value, data) => Object.assign(value, data),
}
```

If the class's instances can't be cloned with `Object.assign(new K(), { ...obj })` you can provide
custom `save`, `load`, or `update` functions.

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
```

`save`, `load`, and `update` can be method names, in which case they're converted to 

- `save = (value) => value[save]()` 
- `load = (data) => K[load](data)`
- `update = (value, data) => value[update](data)`

Note that the `load` method must be static.

```javascript
class Person {
  constructor(...friends) { this.#friends = friends }
  getFriends() { return [...this.#friends] }
  setFriends(friends) { this.#friends = [...friends] }
  static withFriends(friends) { return new Person(...friends) }
}

addClass(Line, { save: "getFriends", load: "withFriends", update: "setFriends" });
```

### Defaults for `save`, `load`, and `update`

If `save` is not defined, the defaults are as mentioned above:

```javascript
{
  save: (value) => ({ ...value }),
  load: (data) => Object.assign(new K(), data),
  update: (value, data) => Object.assign(value, data),
}
```

If `save` is defined, the defaults for `load` and `update` are

```javascript
{
  load: (data) => new K(...data),
  update: undefined,
}
```

In other words, `save` is assumed to return an array of constructor arguments.

```javascript
class Line {
  constructor(m, b) { this.#m = m; this.#b = b }
  y(x) { return this.#m * x + this.#b }
  getData() { return [this.#m, this.#b] }
}

addClass(Line, { save: "getData" });
```

If `save` is defined, there is no default `update` function.
You can omit `update` if you're sure your class instances won't contain re-referenced objects,
but if you're wrong and `update` winds up being needed, `unstash` will throw an error.

See [How it works](#how-it-works) for more on when and how the `update` function is used.

### Custom `key`

By default, `addClass(K)` uses `K.name` as the `$type` key. If you have classes with the same name
from different modules, be sure to give them distinct serializer keys.

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

### Summary of `addClass` options

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

For convenience, the TypeScript decorator `@stashable` provides an alternative to `addClasses`.

```javascript
@stashable(opts) 
class X {}
``` 

is equivalent to 

```javascript
class X {}

// ... and later
addClass(K, opts)`
```

Unless you use the `group` option, in which case adding is deferred:

```javascript
@stashable({ group: "A" })
class X {}

@stashable({ group: "A", opts })
class Y {}

// ... and later
stasher = getStasher();
stasher.addClasses(...stashable.group("A"))
```

is equivalent to

```javascript
class X {}
class Y {}

// ... and later
stasher = getStasher();
addClass(X)
addClass(Y, opts);
```

See [Playing well with others](#playing-well-with-others) for more on using the `group` option and `getStasher()`.

`@stashable` should work under both of TypeScript’s decorator regimes—the stage 3 decorators introduced in TypeScript 5.0 or the still supported `--experimentalDecorators`.


## Playing well with others

The above examples add serializers to the global stasher.
This might be what you want in a small project, but if you're working on something bigger and need to 
avoid collisions with other `json-stash` clients,
you can create your own stasher instance and add serializers to that.

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

Re-referenced objects are rendered as `{ $ref: "$.path.to.first.occurrence.of.object" }`.

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

Serializers define how the `data` is saved and restored. See [How it works](#how-it-works) for details.

### Escaping special properties

In the unlikely event that your original input contains `$ref` or `$type` properties, `stash` avoids ambiguity 
by prepending a `$`, which `unstash` removes.

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

### Just-this-time serializers

`stash` and `unstash` take an optional second parameter: an array of serializers.
These will be used for the current operation only, not added to the stasher's
serializer library. Don't forget to `unstash` with the same serializers you used to `stash`!

```javascript
const stashed = stash(something, [unsharedSerializer]);
const unstashed = unstash(stashed, [unsharedSerializer]);
```

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

## Todo

- Better error handling
- Add a changelog

