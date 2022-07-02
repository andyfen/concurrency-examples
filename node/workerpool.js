const { Worker } = require("worker_threads");

class WorkerPool {
    constructor(workerPath, numberOfThreads) {
      this.queue = [];
      
      this.workersById = new Map();
      this.activeWorkersById = new Map();

      this.numberOfThreads = numberOfThreads;
      this.workerPath = workerPath;

      if (this.numberOfThreads < 1) {
        return;
      }

      for (let i = 0; i < this.numberOfThreads; i += 1) {
        const worker = new Worker(this.workerPath);
  
        this.workersById.set(i, worker);
        this.activeWorkersById.set(i, false);
      }
    }
  
    run(getData) {
      return new Promise((resolve, reject) => {
        const availableWorkerId = this.getInactiveWorkerId();
  
        const queueItem = {
          getData,
          callback: (error, result) => {
            if (error) {
              return reject(error);
            }
            return resolve(result);
          },
        };
  
        if (availableWorkerId === -1) {
          this.queue.push(queueItem);
          return null;
        }
        this.runWorker(availableWorkerId, queueItem);
      });
    }
  
    getInactiveWorkerId() {
      for (let i = 0; i < this.numberOfThreads; i += 1) {
        if (!this.activeWorkersById.get(i)) {
          return i;
        }
      }
      return -1;
    }
  
    async runWorker(workerId, queueItem) {
      const worker = this.workersById.get(workerId);
  
      this.activeWorkersById.set(workerId, true);
  
      const messageCallback = (result) => {
        queueItem.callback(null, result);
        cleanUp();
      };
  
      const errorCallback = (error) => {
        queueItem.callback(error);
        cleanUp();
      };
  
      const cleanUp = () => {
        worker.removeAllListeners("message");
        worker.removeAllListeners("error");
  
        this.activeWorkersById.set(workerId, false);

        if (!this.queue.length) {
          return null;
        }
        this.runWorker(workerId, this.queue.shift());
      };
  
      worker.on("message", messageCallback);
      worker.on("error", errorCallback);
  
      worker.postMessage(await queueItem.getData());
    }
  }
  
  module.exports = WorkerPool
  
  