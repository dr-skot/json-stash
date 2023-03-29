const {
  stash,
  unstash,
  addSerializers,
  clearSerializers,
} = require("../index");

beforeEach(() => {
  clearSerializers();
});

describe("https://stackoverflow.com/questions/8164802/serialize-javascript-object-into-json-string", () => {
  it("should be solved by stash", () => {
    const MyClass1 = function (id, member) {
      this.id = id;
      this.member = member;
    };
    const myobject = new MyClass1("5678999", "text");

    const serializer = {
      type: MyClass1,
      save: (obj) => [obj.id, obj.member],
    };

    const stashed = stash(myobject, [serializer]);
    expect(stashed).toBe('{"$type":"MyClass1","data":["5678999","text"]}');

    const unstashed = unstash(stashed, [serializer]);
    expect(unstashed).toEqual(myobject);
  });
});

describe("https://stackoverflow.com/questions/11616630/how-can-i-print-a-circular-structure-in-a-json-like-format", () => {
  it("should be solved by stash", () => {
    const nodes = [
      { self: null, siblings: [] },
      {
        self: null,
        siblings: [],
      },
    ];
    nodes[0].self = nodes[0];
    nodes[0].siblings = nodes;
    nodes[1].self = nodes[1];
    nodes[1].siblings = nodes;

    const stashed = stash(nodes);
    expect(stashed).toBe(
      '[{"self":{"$ref":"$.0"},"siblings":{"$ref":"$"}},{"self":{"$ref":"$.1"},"siblings":{"$ref":"$"}}]'
    );
    expect(unstash(stashed)).toEqual(nodes);
  });
});

describe("https://stackoverflow.com/questions/6487699/best-way-to-serialize-unserialize-objects-in-javascript", () => {
  it("is solved by stash", () => {
    function Person(age) {
      this.age = age;
      this.isOld = function () {
        return this.age > 60;
      };
    }

    // add a serializer
    const serializer = {
      type: Person,
      save: (p) => [p.age],
    };
    addSerializers(serializer);

    var p1 = new Person(77);
    expect(p1.isOld()).toBe(true);

    var serialize = stash(p1);
    var _p1 = unstash(serialize);
    expect(_p1.isOld()).toBe(true);
  });

  it("is solved by stash if Person is a class", () => {
    class Person {
      constructor(age) {
        this.age = age;
        this.isOld = function () {
          return this.age > 60;
        };
      }
    }

    // add a serializer
    const serializer = {
      type: Person,
      save: (p) => [p.age],
    };
    addSerializers(serializer);

    var p1 = new Person(77);
    expect(p1.isOld()).toBe(true);

    var serialize = stash(p1);
    var _p1 = unstash(serialize);
    expect(_p1.isOld()).toBe(true);
  });
});
