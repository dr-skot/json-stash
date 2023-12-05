import { addSerializers, addClasses, stash, unstash } from "./src";

describe("the README examples", () => {
  it("compares with JSON.stringify", () => {
    let dude;

    // README text

    dude = { name: "Dude", heads: 1, legs: ["left", "right"] };

    JSON.stringify(dude);
    // '{"name":"Dude","heads":1,"legs":["left","right"]}'

    stash(dude);
    // '{"name":"Dude","heads":1,"legs":["left","right"]}'

    // end README text

    expect(JSON.stringify(dude)).toBe(
      '{"name":"Dude","heads":1,"legs":["left","right"]}'
    );
    expect(stash(dude)).toBe(
      '{"name":"Dude","heads":1,"legs":["left","right"]}'
    );
  });

  it("handles circular refs", () => {
    let egoist: any;

    try {
      // README text

      egoist = {};
      egoist.preoccupation = egoist;

      JSON.stringify(egoist);
      // TypeError: Converting circular structure to JSON

      stash(egoist);
      // '{"preoccupation":{"$ref":"$"}}'

      unstash(stash(egoist));
      // <ref *1> { preoccupation: [Circular *1]

      // end README text
    } catch (e) {}

    expect(() => JSON.stringify(egoist)).toThrow(
      "Converting circular structure to JSON"
    );

    expect(stash(egoist)).toBe('{"preoccupation":{"$ref":"$"}}');
  });

  it("handles identical objects", () => {
    let grover, ben, presidents, unstringified, unstashed;

    // README text

    grover = { name: "Cleveland" };
    ben = { name: "Harrison" };
    presidents = { 22: grover, 23: ben, 24: grover };

    unstringified = JSON.parse(JSON.stringify(presidents));
    // 22 and 24 are copies of each other
    expect(unstringified[22]).not.toBe(unstringified[24]);

    unstashed = unstash(stash(presidents));
    // 22 and 24 are the same object
    expect(unstashed[22]).toBe(unstashed[24]);

    // end README text
  });

  it("handles non-vanilla objects", () => {
    let landing, order, steps, collect;

    // README text
    landing = new Date("1969-07-21T02:56Z");
    JSON.parse(JSON.stringify(landing));
    // '1969-07-21T02:56:00.000Z'
    unstash(stash(landing));
    // 1969-07-21T02:56:00.000Z // Date object

    order = new Map([
      [1, "Armstrong"],
      [2, "Aldrin"],
    ]);
    JSON.parse(JSON.stringify(order));
    // {}
    unstash(stash(order));
    // Map(2) { 1 => 'Armstrong', 2 => 'Aldrin' }

    steps = new Set(["small", "giant"]);
    JSON.parse(JSON.stringify(steps));
    // {}
    unstash(stash(steps));
    // Set(2) { 'small', 'giant' }

    collect = /rock/g;
    JSON.parse(JSON.stringify(collect));
    // {}
    unstash(stash(collect));
    // /rock/g

    // end README text

    expect(JSON.parse(JSON.stringify(landing))).toBe(
      "1969-07-21T02:56:00.000Z"
    );
    expect(unstash(stash(landing))).toEqual(landing);
    expect(JSON.parse(JSON.stringify(order))).toEqual({});
    expect(unstash(stash(order))).toEqual(order);
    expect(JSON.parse(JSON.stringify(steps))).toEqual({});
    expect(unstash(stash(steps))).toEqual(steps);
    expect(JSON.parse(JSON.stringify(collect))).toEqual({});
    expect(unstash(stash(collect))).toEqual(collect);
  });

  it("explains how duplicate references are rendered", () => {
    let egoist: any, vipList;

    // README text

    egoist = {};
    egoist.preoccupation = egoist;
    vipList = [egoist, egoist];

    stash(vipList);
    // '[{"preoccupation":{"$ref":"$.0"}},{"$ref":"$.0"}]'

    // end README text

    expect(stash(vipList)).toEqual(
      '[{"preoccupation":{"$ref":"$.0"}},{"$ref":"$.0"}]'
    );
  });

  it("explains how special types are rendered", () => {
    // README text

    stash(/rock/g);
    // '{"$type":"RegExp","data":["rock","g"]}'

    // end README text
    expect(stash(/rock/g)).toEqual('{"$type":"RegExp","data":["rock","g"]}');
  });

  it("explains escaping", () => {
    // README text

    stash({ $type: "fake" });
    // '{"$type":"fake","$esc":true}'

    unstash(stash({ $type: "fake" }));
    // { $type: "fake" }

    // end README text
    expect(stash({ $type: "fake" })).toBe('{"$type":"fake","$esc":true}');
    expect(unstash(stash({ $type: "fake" }))).toEqual({ $type: "fake" });
  });

  it("explains escaping $esc", () => {
    // README text

    stash({ $esc: false });
    // '{"$esc":false,"$$esc":true}'

    stash({ $esc: false, $$esc: null });
    // '{"$esc":false,"$$esc":null,"$$$esc":true}'

    unstash(stash({ $esc: false, $$esc: null }));
    // { $esc: false, $$esc: null }

    // end README text

    expect(stash({ $esc: false })).toBe('{"$esc":false,"$$esc":true}');
    expect(stash({ $esc: false, $$esc: null })).toBe(
      '{"$esc":false,"$$esc":null,"$$$esc":true}'
    );
    const unstashed = unstash(stash({ $esc: false, $$esc: null }));
    expect(unstashed).toEqual({ $esc: false, $$esc: null });
  });

  it("demonstrates a custom serializer", () => {
    let agent, stashed;

    // README text
    class Agent {
      // @ts-ignore
      constructor(first, last) {
        // @ts-ignore
        this.first = first;
        // @ts-ignore
        this.last = last;
      }

      introduce() {
        // @ts-ignore
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }

    const agentSerializer = {
      type: Agent,
      // @ts-ignore
      save: (agent) => [agent.first, agent.last],
    };

    stashed = stash(new Agent("James", "Bond"), [agentSerializer]);
    agent = unstash(stashed, [agentSerializer]);
    agent.introduce();
    // 'My name is Bond. James Bond.'
    // end README text

    stashed = stash(new Agent("James", "Bond"), [agentSerializer]);
    agent = unstash(stashed, [agentSerializer]);
    expect(agent.introduce()).toBe("My name is Bond. James Bond.");
  });

  it("handles public-property classes which have been added", () => {
    let bond, unstashed;

    class Agent {
      constructor(public first: string, public last: string) {}

      introduce() {
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }

    // README text
    /*
    class Agent {
      constructor(first, last) {
        this.first = first;
        this.last = last;
      }
      introduce() {
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }
    */
    addClasses(Agent);
    bond = new Agent("James", "Bond");
    addClasses((bond as Object).constructor);
    expect(Agent).toBe(bond.constructor);
    expect(bond instanceof Agent).toBe(true);
    unstashed = unstash(stash(bond));
    expect(unstashed.introduce()).toBe("My name is Bond. James Bond.");
    // end README text
  });

  it("automagically handles public-property classes which are present at stash and unstash", () => {
    let bond, unstashed;

    class Agent {
      constructor(public first: string, public last: string) {}

      introduce() {
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }

    // README text
    /*
    class Agent {
      constructor(first, last) {
        this.first = first;
        this.last = last;
      }
      introduce() {
        return `My name is ${this.last}. ${this.first} ${this.last}.`;
      }
    }
    */
    bond = new Agent("James", "Bond");
    const parsed = JSON.parse(JSON.stringify(bond));
    expect(() => parsed.introduce()).toThrow(
      "parsed.introduce is not a function"
    );
    unstashed = unstash(stash(bond));
    expect(unstashed.introduce()).toBe("My name is Bond. James Bond.");
    // end README text
    console.log({ unstashed, parsed });
  });

  it("handles private-property classes with serializers", () => {
    let agent;

    class Agent {
      #first: string;
      #last: string;
      constructor(first: string, last: string) {
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

    // README text
    /*
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
     */

    addSerializers({
      type: Agent,
      save: (agent) => agent.serialize(),
    });
    const unparsed = JSON.parse(JSON.stringify(new Agent("James", "Bond")));
    expect(unparsed).toEqual({});
    expect(() => unparsed.introduce()).toThrow(
      "unparsed.introduce is not a function"
    );
    agent = unstash(stash(new Agent("James", "Bond")));
    agent.introduce();
    expect(agent.introduce()).toBe("My name is Bond. James Bond.");
  });

  it("punts if no serializer is found", () => {
    function blah() {
      return "blah";
    }
    expect(unstash(stash(blah))()).not.toBe("blah");
  });
});
