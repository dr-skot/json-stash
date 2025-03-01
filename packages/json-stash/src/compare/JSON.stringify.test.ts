import { stash, unstash } from "../index";
function expectStringifyToFail(input: unknown) {
  const output = JSON.parse(JSON.stringify(input));
  expect(output).not.toEqual(input);
}

function expectStringifyToThrow(input: unknown) {
  expect(() => JSON.stringify(input)).toThrow();
}

function expectStashToSucceed(input: unknown) {
  const output = unstash(stash(input));
  expect(output).toEqual(input);
}

describe("JSON.stringify", () => {
  it("punts on non-primitive types", () => {
    const eagle = {
      crew: new Map([
        ["driver", "Armstrong"],
        ["shotgun", "Aldrin"],
      ]),
      landed: new Date("1969-07-21T02:56Z"),
      search: /rock/g,
    };
    Object.values(eagle).forEach(expectStringifyToFail);
    Object.values(eagle).forEach(expectStashToSucceed);
  });

  it("chokes on circular refs", () => {
    const egoist = {} as any;
    egoist.preoccupation = egoist;
    expectStringifyToThrow(egoist);
    expectStashToSucceed(egoist);
  });
});
