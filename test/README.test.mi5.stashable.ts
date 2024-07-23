import { stashable } from "../src/stashable";

console.log("MI5AgentStashable");
@stashable({ key: "MI5AgentStashable" })
export class Agent {
  constructor(
    public first: string,
    public last: string,
  ) {}

  introduce() {
    return `My name is ${this.last}. ${this.first} ${this.last}.`;
  }
}
