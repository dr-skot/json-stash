const { stash, unstash } = require("json-stash");

// TODO elaborate these tests
const d = { a: 1, b: 2, c: 3 };
d.d = d;
const e = { f: 4, g: [5, 6, 7], h: { i: 8, j: 9 } };
console.log(stash(d));
console.log(unstash(stash(d)));
