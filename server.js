const http2 = require('http2')
const fs = require('fs')

// instructions to create these are in the Readme.md
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
    // prepare response for GET https://localhost:1234/ request
    case '/':
      // update response headers
      stream.respond({
        'content-type': 'text/html',
        ':status': 200
      })

      // push push-data.json file with this response
      stream.pushStream({ ':path': '/push-data.json' }, (err, pushStream, headers) => {
        if (err) throw err
        // import json data
        const pushData = require('./push-data.json')
        // update push headers
        pushStream.respond({
          'content-type': 'application/json',
          ':status': 200
        })
        // send json data
        pushStream.end(JSON.stringify(pushData))
      })

      // send html to browser
      stream.end(`
        <html>
          <head>
            <title>Push with Http2 and node</title>
            <!-- import jquery -->
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <!-- script to get /push-data.json and add response to DOM -->
            <script type="text/javascript">
              $(function(){
                // get push-data.json
                $.getJSON('push-data.json',function(data){
                  console.log('success', data);
                  // update DOM to show received data
                  $('#push-data').html('Received: ' + JSON.stringify(data));
                });
              });
            </script>
          </head>
          <body>
            <h1>Hello World</h1>
            <!-- data from push-data.json will appear here -->
            <div id="push-data"></div>
          </body>
        </html>
      `)
      break

    // return 404 page for any other request
    default:
      stream.respond({
        'content-type': 'text/html',
        ':status': 404
      })
      stream.end('<h1>World Not Found</h1>')
  }
})

const port = 1234
// start the server and listen on port 1234
server.listen(port, () => {
  console.log(`Server started on https://localhost:${port}`)
})
