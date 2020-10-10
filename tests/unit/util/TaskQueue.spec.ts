import TaskQueue from "@/util/TaskQueue";

const generator = () => {
  return new Promise((resolve) => {
    console.log("promising running");
    resolve("done");
  });
};

const makeGenerator = (id: number) => {
  return () => {
    return new Promise((resolve) => {
      console.log(`running ${id}`);
      setTimeout(() => {
        console.log(`resolving ${id}`);
        resolve();
      }, 400);
    });
  };
};

describe("TaskQueue", () => {
  it("works", async (done) => {
    const queue = new TaskQueue(7);

    const promises = [];

    for (let i = 0; i < 10; ++i) {
      promises.push(queue.enqueue(makeGenerator(i)));
    }

    await Promise.all(promises);
    done();

    /*const msg = "new message";
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    });
    expect(wrapper.text()).toMatch(msg);*/
  });
});
