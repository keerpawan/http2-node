Simple application to demo <b>PUSH</b> with http2 and node

## Step up

```
yarn
```

## Start server
```
yarn start:server
```

## Create certificate

```
brew install openssl
```

```
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-privkey.pem -out localhost-cert.pem
```

Click on localhost-cert.pem and add it to your keychain

## Try it out

Start the server and Goto: https://localhost:1234

You can see hello world and the json data being printed.

You might think that we are making a jquery request to fetch the push-data.json, but in our server.js file we actually don't even have a route to get the file.

To understand this better let's try something : 
Open https://localhost:1234/push-data.json we get a 404 'World Not Found'. Which is what we expect as there are actually no open routes to it.

You can also open developer console of your browser and under the Network calls we can see a push request for push-data.json
