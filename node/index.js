const path = require('path')

const WorkerPool = require('./workerpool')

const THREADS = 8

const pool = new WorkerPool(path.join(__dirname, './worker.js'), THREADS)

const tasks = []

for (let i = 0; i < 100; i++) {
  tasks.push(i)
}

Promise.all(
  tasks.map(async (i) => {
    const post = await pool.run(() => ({ id: i }))
    console.log(post)
  }),
)
  .then(() => {
    console.log('finished all')
    process.exit(1)
  })
  .catch(console.log)
