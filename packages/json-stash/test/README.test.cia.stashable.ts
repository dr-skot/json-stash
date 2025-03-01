import { stashable } from "../src/stashable";

@stashable({ key: "CIAAgentStashable" })
export class Agent {
  constructor(
    public first: string,
    public last: string,
  ) {}

  introduce() {
    return `I'm ${this.last}. ${this.first} ${this.last} of the CIA.`;
  }
}
