const stash = require("json-stash");

const d = { a: 1, b: 2, c: 3 };
d.d = d;
const e = { d, f: 4, g: [5, 6, 7] };
console.log(stash.toJSON(e));
console.log(stash.fromJSON(stash.toJSON(e)));
