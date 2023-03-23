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
      // '{"preoccupation":{"_stashRef":"$"}}'

      unstash(stash(egoist));
      // <ref *1> { preoccupation: [Circular *1]

      // end README text
    } catch (e) {}

    expect(() => JSON.stringify(egoist)).toThrow(
      "Converting circular structure to JSON"
    );

    expect(stash(egoist)).toBe('{"preoccupation":{"_stashRef":"$"}}');
  });

  it("handles identical objects", () => {
    let steph, steve, threes, unstringified, unstashed;

    // README text

    steph = { name: "Curry" };
    steve = { name: "Kerr" };

    // per-game stat leaders
    threes = { shot: steph, made: steph, pct: steve };

    unstringified = JSON.parse(JSON.stringify(threes));
    // `shot` and `made` are duplicates
    expect(unstringified.shot).not.toBe(unstringified.made);

    unstashed = unstash(stash(threes));
    // `shot` and `made` are the same object
    expect(unstashed.shot).toBe(unstashed.made);

    // end README text
  });

  it("explains how duplicate references are rendered", () => {
    let egoist: any, vipList;

    // README text

    egoist = {};
    egoist.preoccupation = egoist;
    vipList = [egoist, egoist];

    stash(vipList);
    // '[{"preoccupation":{"_stashRef":"$.0"}},{"_stashRef":"$.0"}]'

    // end README text

    expect(stash(vipList)).toEqual(
      '[{"preoccupation":{"_stashRef":"$.0"}},{"_stashRef":"$.0"}]'
    );
  });

  it("explains how special types are rendered", () => {
    // README text

    stash(/rock/g);
    // '{"_stashType":"RegExp","data":["rock","g"]}'

    // end README text
    expect(stash(/rock/g)).toEqual(
      '{"_stashType":"RegExp","data":["rock","g"]}'
    );
  });

  it("explains escaping", () => {
    // README text
    stash({ _stashRef: "fake" });
    // '{"_stashRef":"fake","_stashEscape":true}'
    stash({ _stashType: "bogus" });
    // '"{\"_stashType\":\"bogus\",\"_stashEscape\":true}"
    // end README text
    expect(stash({ _stashRef: "fake" })).toBe(
      '{"_stashRef":"fake","_stashEscape":true}'
    );
    expect(stash({ _stashType: "bogus" })).toBe(
      '{"_stashType":"bogus","_stashEscape":true}'
    );
  });

  it("explains escaping _stashEscape", () => {
    // README text

    stash({ _stashEscape: false });
    // '{"_stashEscape":false,"__stashEscape":true}'

    stash({ _stashEscape: false, __stashEscape: null });
    // '{"_stashEscape":false,"__stashEscape":null,"___stashEscape":true}'

    unstash(stash({ _stashEscape: false }));
    // { _stashEscape: false }

    // end README text

    expect(stash({ _stashEscape: false })).toBe(
      '{"_stashEscape":false,"__stashEscape":true}'
    );
    expect(stash({ _stashEscape: false, __stashEscape: null })).toBe(
      '{"_stashEscape":false,"__stashEscape":null,"___stashEscape":true}'
    );
    expect(unstash(stash({ _stashEscape: false }))).toEqual({
      _stashEscape: false,
    });
  });
});
