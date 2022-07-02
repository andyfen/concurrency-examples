const { isMainThread, parentPort } = require('worker_threads');
const https = require("https")

if (isMainThread) {
 throw new Error("Not a worker :(");
}

parentPort.on('message', (data) => {

    https.get(`https://jsonplaceholder.typicode.com/todos/${data.id}`, (response) => {
        response.setEncoding("utf8")

        response.on("data", (data) => {
            parentPort.postMessage(data);
        })

        response.on("error", console.error)

    }).on("error", console.error)

});