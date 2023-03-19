import { hello } from "./index";

describe("hello", () => {
  it("should return hello", () => {
    expect(hello()).toEqual("hello");
  });
});
