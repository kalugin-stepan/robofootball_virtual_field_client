const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.end(fs.readFileSync('index.html'))
        return
    }
    if (req.url.match('/public/*') || req.url.match('/node_modules/*')) {
        res.end(fs.readFileSync(path.join(__dirname, req.url)))
        return
    }
})

server.listen(80)