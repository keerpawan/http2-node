const http = require('http')

http.createServer((req, res) => {
  console.log('req', req)
  if (req.url === '/mystyle.css') {
    res.writeHeader(200, { 'content-type': 'text/css' })
    res.write(`
      body { text-size: 100px; }
    `)
  } else {
    res.writeHeader(200, { 'content-type': 'text/html' })
    res.write(`
      <html>
          <head>
              <link rel="stylesheet" type="text/css" href="mystyle.css">
          </head>
      <body>
      hello
      </body>
      </html>
      `)
  }
  res.end()
}).listen(5000, () => {
  console.log('Started server 1')
})

const http2 = require('http2')
const fs = require('fs')

const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
})


server.on('stream', (stream, headers) => {
  if (headers[':path'] !== '/') {
    stream.respond({
      ':status': 404
    })
    return stream.end('Not found')
  }

  stream.respond({ 'content-type': 'text/html', ':status': 200 })
  stream.pushStream({ ':path': '/mystyle.css'}, (err, pushStream, headers) => {
    if (err) throw err
    // import json data
    const pushData = 'body { text-size: 100px; }'

    // update push headers
    pushStream.respond({
      'content-type': 'application/css',
      ':status': 200
    })
    // send json data
    pushStream.end(JSON.stringify(pushData))
  })
  stream.end(`
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="mystyle.css">
        </head>
    <body>
    hello
    </body>
    </html>
    `)
})

server.listen(1234, () => {
  console.log('started server 2')
})
