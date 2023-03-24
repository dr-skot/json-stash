import { stash, unstash } from "./src";

describe("the README examples", () => {
  it("is like JSON.stringify", () => {
    let armstrong;

    // README text

    armstrong = { name: "Neil", apollo: 11, steps: ["small", "giant"] };

    JSON.stringify(armstrong);
    // '{"name":"Neil","apollo":11,"steps":["small","giant"]}'

    stash(armstrong);
    // '{"name":"Neil","apollo":11,"steps":["small","giant"]}'

    // end README text

    expect(JSON.stringify(armstrong)).toBe(
      '{"name":"Neil","apollo":11,"steps":["small","giant"]}'
    );
    expect(stash(armstrong)).toBe(
      '{"name":"Neil","apollo":11,"steps":["small","giant"]}'
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
});
