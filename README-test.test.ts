import {
  stash,
  unstash,
  addSerializer,
  addSerializers,
  addClass,
  clearSerializers,
  getStasher,
  stashable,
} from "./src";
import { Agent as MI5Agent } from "./test/README.test.mi5";
import { Agent as CIAAgent } from "./test/README.test.cia";

// IMPORTANT: this file should be named README-test.test.ts
//   or anything that's not README.*
//   so it doesn't get included in the npm package

describe("README", () => {
  beforeEach(() => clearSerializers());

  test("Usage", () => {
    const anything = { a: 1, b: 2, c: /anything/i, d: new Date() };
    const stashed = stash(anything);
    const unstashed = unstash(stashed);

    // `stashed` is a string
    expect(typeof stashed).toBe("string");

    // `unstashed` is a deep copy of `anything`
    expect(unstashed).toEqual(anything);
  });

  test("Or, if you don't want to use the global stasher, create your own stasher instance", () => {
    const anything = { a: 1, b: 2, c: /anything/i, d: new Date() };
    const stasher = getStasher();

    const stashed = stasher.stash(anything);
    const unstashed = stasher.unstash(stashed);

    // `stashed` is a string
    expect(typeof stashed).toBe("string");

    // `unstashed` is a deep copy of `anything`
    expect(unstashed).toEqual(anything);
  });

  test("Simple classes with public fields just need to be added", () => {
    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }

    addClass(Point);
    const result = unstash(stash(new Point(5, 6)));

    expect(result instanceof Point).toBe(true);
    expect(result.x).toEqual(5);
    expect(result.y).toEqual(6);
  });

  test("For classes with private fields, supply save and load methods", () => {
    class ImmutablePoint {
      #x: number;
      #y: number;

      constructor(x: number, y: number) {
        this.#x = x;
        this.#y = y;
      }

      xy() {
        return [this.#x, this.#y];
      }
    }

    addClass(ImmutablePoint, {
      save: (point) => point.xy(),
      load: ([x, y]) => new ImmutablePoint(x, y),
    });
    const stashed = stash(new ImmutablePoint(5, 6));
    expect(stashed).toBe('{"$type":"ImmutablePoint","data":[5,6]}');
    const unstashed = unstash(stashed);
    expect(unstashed instanceof ImmutablePoint).toBe(true);
    expect(unstashed.xy()).toEqual([5, 6]);
  });

  test("Just about anything else can be handled with a custom serializer", () => {
    const store: Record<string, string> = {};
    const localStorage = {
      getItem(key: string) {
        return store[key];
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
    };
    const mobyDickText = "Call me Ishmael ... only found another orphan.";
    addSerializer({
      key: "book",
      test: (obj: any) => obj?.title && obj?.text,
      save: ({ title, text }: Record<string, string>) => {
        localStorage.setItem(title, text);
        return title;
      },
      load: (title) => ({ title, text: localStorage.getItem(title) }),
    });
    const stashed = stash({ title: "Moby Dick", text: mobyDickText });
    expect(stashed).toBe('{"$type":"book","data":"Moby Dick"}');
    expect(localStorage.getItem("Moby Dick")).toBe(mobyDickText);
    const result = unstash(stashed);
    expect(result).toEqual({ title: "Moby Dick", text: mobyDickText });
  });

  test("Here's the built-in serializer for Map: ... and here it is in action, with circular references:", () => {
    const loner = new Map();
    loner.set("friend", loner);
    expect(stash(loner)).toBe(
      '{"$type":"Map","data":[["friend",{"$ref":"$"}]]}',
    );
    const unstashedLoner = unstash(stash(loner));
    expect(unstashedLoner.get("friend").get("friend")).toBe(unstashedLoner);
  });

  test("It's like JSON.stringify", () => {
    const dude = { name: "Dude", heads: 1, legs: ["left", "right"] };
    expect(stash(dude)).toEqual(JSON.stringify(dude));
  });

  test("Circular references", () => {
    const egoist: any = {};
    egoist.preoccupation = egoist;

    expect(() => JSON.stringify(egoist)).toThrow(
      "Converting circular structure to JSON",
    );
    expect(stash(egoist)).toEqual('{"preoccupation":{"$ref":"$"}}');
    expect(unstash(stash(egoist))).toEqual(egoist);
  });

  test("Identical objects", () => {
    const grover = { name: "Cleveland" };
    const ben = { name: "Harrison" };
    const presidents = { 22: grover, 23: ben, 24: grover };

    expect(JSON.stringify(presidents)).toEqual(
      '{"22":{"name":"Cleveland"},"23":{"name":"Harrison"},"24":{"name":"Cleveland"}}',
    );
    expect(stash(presidents)).toEqual(
      '{"22":{"name":"Cleveland"},"23":{"name":"Harrison"},"24":{"$ref":"$.22"}}',
    );

    const unstringified = JSON.parse(JSON.stringify(presidents));
    expect(unstringified[22] === unstringified[24]).toBe(false);

    const unstashed = unstash(stash(presidents));
    expect(unstashed[22] === unstashed[24]).toBe(true);
  });

  test("Built-in types", () => {
    const landing = new Date("1969-07-21T02:56Z");
    expect(JSON.stringify(landing)).toBe('"1969-07-21T02:56:00.000Z"');
    expect(JSON.parse(JSON.stringify(landing))).toBe(
      "1969-07-21T02:56:00.000Z",
    );
    expect(stash(landing)).toBe(
      '{"$type":"Date","data":"1969-07-21T02:56:00.000Z"}',
    );
    expect(unstash(stash(landing))).toEqual(landing);

    const order = new Map([
      [1, "Armstrong"],
      [2, "Aldrin"],
    ]);
    expect(JSON.stringify(order)).toBe("{}");
    expect(JSON.parse(JSON.stringify(order))).toEqual({});
    expect(stash(order)).toBe(
      '{"$type":"Map","data":[[1,"Armstrong"],[2,"Aldrin"]]}',
    );
    expect(unstash(stash(order))).toEqual(order);

    const steps = new Set(["small", "giant"]);
    expect(JSON.stringify(steps)).toBe("{}");
    expect(JSON.parse(JSON.stringify(steps))).toEqual({});
    expect(stash(steps)).toBe('{"$type":"Set","data":["small","giant"]}');
    expect(unstash(stash(steps))).toEqual(steps);

    const collect = /rock/g;
    expect(JSON.stringify(collect)).toBe("{}");
    expect(JSON.parse(JSON.stringify(collect))).toEqual({});
    expect(stash(collect)).toBe('{"$type":"RegExp","data":["rock","g"]}');
    expect(unstash(stash(collect))).toEqual(collect);
  });

  test("let's say you have a datatype that represents a linear equation", () => {
    const makeLine = (m: number, b: number) => ({
      type: "Line",
      y: (x: number) => m * x + b,
      mb: () => [m, b],
    });

    const line = makeLine(2, 3);
    expect(line.y(4)).toBe(11);

    addSerializer({
      key: "Line",
      test: (obj) => (obj as any).type === "Line",
      save: (obj) => obj.mb(),
      load: ([m, b]) => makeLine(m, b),
    });

    const stashed = stash(line);
    expect(stashed).toBe('{"$type":"Line","data":[2,3]}');
    expect(unstash(stashed).y(4)).toBe(11);
  });

  test("`update` must mutate the object in place", () => {
    function makePerson(friends: any[]) {
      friends = [...friends];
      return {
        type: "Person",
        getFriends: () => [...friends],
        setFriends: (newFriends: any[]) => (friends = [...newFriends]),
      };
    }

    addSerializer({
      key: "Person",
      test: (obj: any) => obj.type === "Person",
      save: (person: any) => person.getFriends(),
      load: (friends: any[]) => makePerson(friends),
      update: (person: any, friends: any[]) => person.setFriends(friends),
    });

    const loner = makePerson([]);
    loner.setFriends([loner]);

    const unstashedLoner = unstash(stash(loner));
    expect(unstashedLoner.getFriends()[0]).toBe(unstashedLoner);
  });

  test("If `unstash` finds re-referenced objects and no `update` method has been provided, it will throw a runtime error", () => {
    function makePerson(friends: any[]) {
      friends = [...friends];
      return {
        type: "Person",
        getFriends: () => [...friends],
        setFriends: (newFriends: any[]) => (friends = [...newFriends]),
      };
    }

    addSerializers({
      key: "Person",
      test: (obj: any) => obj.type === "Person",
      save: (person: any) => person.getFriends(),
      load: (friends: any) => makePerson(friends),
    });

    const loner = makePerson([]);
    loner.setFriends([loner]);

    expect(() => unstash(stash(loner))).toThrow("No update method");
  });

  test("Use `addClass` to make a class stashable", () => {
    class Line {
      constructor(
        public m: number,
        public b: number,
      ) {}

      y(x: number) {
        return this.m * x + this.b;
      }
    }

    addClass(Line);

    const line = new Line(2, 3);
    const unstashed = unstash(stash(line));
    expect(unstashed instanceof Line).toBe(true);
    expect(unstashed.m).toBe(2);
    expect(unstashed.b).toBe(3);
    expect(unstashed.y(4)).toBe(11);
  });

  test("you can provide custom `save` and `load` options", () => {
    class Line {
      #m: number;
      #b: number;

      constructor(m: number, b: number) {
        this.#m = m;
        this.#b = b;
      }

      y(x: number) {
        return this.#m * x + this.#b;
      }

      getData() {
        return { m: this.#m, b: this.#b };
      }
    }

    addClass(Line, {
      save: (obj: any) => obj.getData(),
      load: ({ m, b }: { m: number; b: number }) => new Line(m, b),
    });

    const stashed = stash(new Line(2, 3));
    expect(stashed).toBe('{"$type":"Line","data":{"m":2,"b":3}}');
    expect(unstash(stashed).y(4)).toBe(11);
  });

  test("Strings are interpreted as method names", () => {
    class Line {
      #m: number;
      #b: number;

      constructor(m: number, b: number) {
        this.#m = m;
        this.#b = b;
      }

      y(x: number) {
        return this.#m * x + this.#b;
      }

      getData() {
        return { m: this.#m, b: this.#b };
      }

      static fromData({ m, b }: { m: number; b: number }) {
        return new Line(m, b);
      }
    }

    addClass(Line, { save: "getData", load: "fromData" });

    const stashed = stash(new Line(2, 3));
    expect(stashed).toBe('{"$type":"Line","data":{"m":2,"b":3}}');
    expect(unstash(stashed).y(4)).toBe(11);
  });

  test("If `save` returns an array of constructor arguments, you can omit `load`", () => {
    class Line {
      #m: number;
      #b: number;

      constructor(m: number, b: number) {
        this.#m = m;
        this.#b = b;
      }

      y(x: number) {
        return this.#m * x + this.#b;
      }

      getData() {
        return [this.#m, this.#b];
      }
    }

    addClass(Line, { save: "getData" });

    const stashed = stash(new Line(2, 3));
    expect(stashed).toBe('{"$type":"Line","data":[2,3]}');
    expect(unstash(stashed).y(4)).toBe(11);
  });

  test("If you supply a custom `save` function, there is no default `update` function", () => {
    class Person {
      #friends: Person[] = [];

      constructor(...friends: Person[]) {
        this.setFriends(friends);
      }

      getFriends() {
        return [...this.#friends];
      }

      setFriends(friends: Person[]) {
        this.#friends = [...friends];
      }
    }

    const loner = new Person();
    loner.setFriends([loner]);

    // without `update`
    addClass(Person, { save: "getFriends" });
    expect(() => unstash(stash(loner))).toThrow("No update method found");
    // throws Error: no update function found

    // with `update`
    addClass(Person, { save: "getFriends", update: "setFriends" });
    const unstashedLoner = unstash(stash(loner));
    expect(unstashedLoner.getFriends()[0]).toBe(unstashedLoner);
  });

  test("If you have two classes with the same  class.name, give them distinct keys", () => {
    expect(MI5Agent.name).toBe(CIAAgent.name);

    addClass(MI5Agent, { key: "MI5Agent" });
    addClass(CIAAgent, { key: "CIAAgent" });

    expect(stash(new MI5Agent("James", "Bond"))).toBe(
      '{"$type":"MI5Agent","data":{"first":"James","last":"Bond"}}',
    );
    expect(stash(new CIAAgent("Ethan", "Hunt"))).toBe(
      '{"$type":"CIAAgent","data":{"first":"Ethan","last":"Hunt"}}',
    );
  });

  describe("`@stashable(opts) class X {}` is equivalent to `class X {}; addClasses(X, opts)`", () => {
    test("for public-field classes no arguments are necessary", () => {
      @stashable()
      class Agent {
        constructor(
          public first: string,
          public last: string,
        ) {}
      }

      expect(stash(new Agent("James", "Bond"))).toBe(
        '{"$type":"Agent","data":{"first":"James","last":"Bond"}}',
      );
    });

    test("provide unique keys to differentiate classes with the same name", async () => {
      let { Agent: MI5AgentStashable } = await import(
        "./test/README.test.mi5.stashable"
      );
      let { Agent: CIAAgentStashable } = await import(
        "./test/README.test.cia.stashable"
      );

      // CIA module
      expect(stash(new MI5AgentStashable("James", "Bond"))).toBe(
        '{"$type":"MI5AgentStashable","data":{"first":"James","last":"Bond"}}',
      );
      // MI5 module
      expect(stash(new CIAAgentStashable("Ethan", "Hunt"))).toBe(
        '{"$type":"CIAAgentStashable","data":{"first":"Ethan","last":"Hunt"}}',
      );
    });

    test("for private field classes, provide a `save` function", () => {
      // and, if needed, `load` and `update` functions
      @stashable({ save: "getFriends", update: "setFriends" })
      class PrivatePerson {
        #friends: PrivatePerson[] = [];

        constructor(...friends: PrivatePerson[]) {
          this.setFriends(friends);
        }

        getFriends() {
          return [...this.#friends];
        }

        setFriends(friends: PrivatePerson[]) {
          this.#friends = [...friends];
        }
      }

      const loner = new PrivatePerson();
      loner.setFriends([loner]);
      expect(stash(loner)).toBe(
        '{"$type":"PrivatePerson","data":[{"$ref":"$"}]}',
      );
      const unstashed = unstash(stash(loner));
      expect(unstashed.getFriends()[0]).toBe(unstashed);
    });
  });

  test("Playing well with others: `@stashable`", () => {
    @stashable({ group: "corporate" })
    class Employee {}

    @stashable({ group: "corporate" })
    class Department {}

    const myStasher = getStasher();
    const wrong = myStasher.stash(new Employee());
    expect(wrong).toBe("{}");

    myStasher.addClasses(...stashable.group("corporate"));
    const right = myStasher.stash(new Employee());
    expect(right).toBe('{"$type":"Employee","data":{}}');
  });

  test("or double up the decorators", () => {
    @stashable()
    @stashable({ group: "corporate" })
    class Employee {}

    addClass(Employee);
    expect(stash(new Employee())).toBe('{"$type":"Employee","data":{}}');

    const myStasher = getStasher();
    // class not supported
    expect(myStasher.stash(new Employee())).toBe("{}");
    myStasher.addClasses(...stashable.group("corporate"));
    // now it is
    expect(myStasher.stash(new Employee())).toBe(
      '{"$type":"Employee","data":{}}',
    );
  });

  test('Re-referenced objects are rendered as `{ $ref: "$.path.to.object" }`', () => {
    const egoist: any = {};
    egoist.preoccupation = egoist;
    const vipList = [egoist, egoist];

    expect(stash(vipList)).toBe(
      '[{"preoccupation":{"$ref":"$.0"}},{"$ref":"$.0"}]',
    );
  });

  test('Special types are rendered as `{ $type: "type", data: <data> }`', () => {
    expect(stash(/search/gi)).toBe('{"$type":"RegExp","data":["search","gi"]}');
  });

  test("`stash` avoids choking on them by prepending an `$`, which `unstash` duly removes.", () => {
    const x = { $ref: "not a real ref" };

    expect(stash(x)).toBe('{"$$ref":"not a real ref"}');
    expect(unstash(stash(x))).toEqual(x);
  });

  test("this prepending cascades", () => {
    const x = { $type: "not a type", $$type: "also not" };

    expect(stash(x)).toBe('{"$$$type":"also not","$$type":"not a type"}');
    expect(unstash(stash(x))).toEqual(x);
  });

  test("This removes only the most recently added serialzier for each key", () => {
    const stasher = getStasher();
    stasher.addClass(MI5Agent, { key: "MI5Agent" });
    stasher.addClass(MI5Agent, { key: "MI5Agent", save: () => "redacted" });

    const agent = new MI5Agent("James", "Bond");
    expect(stasher.stash(agent)).toBe('{"$type":"MI5Agent","data":"redacted"}');

    stasher.removeSerializers("MI5Agent");
    expect(stasher.stash(agent)).toBe(
      '{"$type":"MI5Agent","data":{"first":"James","last":"Bond"}}',
    );

    stasher.removeSerializers("MI5Agent");
    expect(stasher.stash(agent)).toBe('{"first":"James","last":"Bond"}');
  });
});

describe("old ones to bring back?", () => {
  test("Simple public property classes", () => {
    class Agent {
      constructor(
        public first: string,
        public last: string,
      ) {}
      introduce() {
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }
    addClass(Agent);

    const bond = new Agent("James", "Bond");

    // stringify: nope
    expect(JSON.stringify(bond)).toBe('{"first":"James","last":"Bond"}');
    expect(() => JSON.parse(JSON.stringify(bond)).introduce()).toThrow(
      "JSON.parse(...).introduce is not a function",
    );

    // stash ftw
    expect(stash(bond)).toBe(
      '{"$type":"Agent","data":{"first":"James","last":"Bond"}}',
    );
    expect(unstash(stash(bond)).introduce()).toBe(
      "My name is Bond. James Bond.",
    );
  });
});
