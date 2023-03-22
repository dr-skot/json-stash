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
});
