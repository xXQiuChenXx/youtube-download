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
}

test();
