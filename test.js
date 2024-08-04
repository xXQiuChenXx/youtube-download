const prompt = require("prompt-sync")();

class MyTest {
  constructor() {
    this.test = "Hello World";
  }

  async promisifyFn() {
    console.log("Outside: " + this.test);
    return new Promise((resolve, reject) => {
      console.log("Inside: " + this.test);

      resolve({ hello: "world" });
    });
  }
}

async function promisifyFn() {
  return new Promise((resolve, reject) => {
    resolve({ hello: "world" });
  });
}

async function test() {
  const ttest = new MyTest();

  await ttest.promisifyFn();
  const name = prompt("What is your name? ");
  const age = prompt("What is your age? ");
  const gender = prompt("What is your gender? ");
  console.log("Please choose an option:");
  console.log("1. Say Hello");
  console.log("2. Say Goodbye");
  console.log("3. Exit");

  // Prompt the user to make a selection
  const choice = prompt("Enter your choice (1, 2, or 3): ");

  console.log(`Hello, ${name}, you're ${age} years old, and ${gender} ${choice}!`);
}

test();
