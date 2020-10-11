type TaskGenerator<T> = () => Promise<T>;

type QueueItem<T> = {
  generator: TaskGenerator<T>;
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
};

export default class TaskQueue<T = void> {
  private tasks: QueueItem<T>[] = [];
  private concurrency = 0;

  constructor(private readonly concurrencyLimit: number = 1) {}

  enqueue(generator: TaskGenerator<T>) {
    return new Promise((resolve, reject) => {
      this.tasks.push({
        generator,
        resolve,
        reject
      });

      this.process();
    });
  }

  private process() {
    if (!(this.tasks.length > 0 && this.concurrency < this.concurrencyLimit)) {
      return;
    }

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
