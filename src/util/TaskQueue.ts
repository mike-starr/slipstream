type TaskGenerator = () => Promise<any>;

type QueueItem = {
  generator: TaskGenerator;
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
};

export default class TaskQueue {
  private tasks: QueueItem[] = [];
  private concurrency = 0;

  constructor(private readonly concurrencyLimit: number = 1) {}

  enqueue(generator: TaskGenerator) {
    return new Promise((resolve, reject) => {
      this.tasks.push({
        generator,
        resolve,
        reject
      });

      this.process();
    });
  }

  process() {
    while (this.tasks.length > 0 && this.concurrency < this.concurrencyLimit) {
      ++this.concurrency;
      const queueItem = this.tasks.shift()!;

      queueItem
        .generator()
        .then((value) => {
          queueItem.resolve(value);
        })
        .catch((error) => {
          queueItem.reject(error);
        })
        .finally(() => {
          --this.concurrency;
          this.process();
        });
    }
  }
}
