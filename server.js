const http2 = require('http2')
const fs = require('fs')

const port = 1234

// Instructions to create these are in the Readme
const options = {
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
}

// create the http2 server
const server = http2.createSecureServer(options)

// handle any errors
server.on('error', (err) => console.error(err))

// handle incoming requests
server.on('stream', (stream, headers) => {
  // based on the path perform certain actions
  switch (headers[':path']) {
    case '/':
      stream.respond({
        'content-type': 'text/html',
        ':status': 200
      })

      stream.pushStream({ ':path': '/push-data.json' }, (err, pushStream, headers) => {
        if (err) throw err
        const pushData = require('./push-data.json')
        pushStream.respond({
          'content-type': 'application/json',
          ':status': 200
        })
        pushStream.end(JSON.stringify(pushData))
      })

      stream.end(`
        <html>
          <head>
            <title>Http 2 with node</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script type="text/javascript">
              $(function(){
                $.getJSON('push-data.json',function(data){
                  console.log('success', data);
                  $('div').html('Received: ' + JSON.stringify(data));
                });
              });
            </script>
          </head>
          <body>
            <h1>Hello World</h1>
            <div></div>
          </body>
        </html>
      `)
      break
    default:
      stream.respond({
        'content-type': 'text/html',
        ':status': 404
      })
      stream.end('<h1>World Not Found</h1>')
  }
})

// start the server
server.listen(port, () => {
  console.log(`Server started on https://localhost:${port}`)
})
