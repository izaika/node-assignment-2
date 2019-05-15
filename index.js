const fs = require('fs');
const path = require('path');
const https = require('https');
const { StringDecoder } = require('string_decoder');

const handlers = require('./handlers');
const { getRouteString } = require('./utils');

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, './https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './https/cert.pem')),
  },
  (request, response) => {
    request.setEncoding('utf8');

    // Get the payload,if any
    const decoder = new StringDecoder('utf-8');
    let body = '';

    request.on('data', chunk => (body += decoder.write(chunk)));

    request.on('end', () => {
      body += decoder.end();

      const handlerName = getRouteString(request);

      const responseBody = handlers[handlerName]
        ? handlers[handlerName](request, JSON.parse(body))
        : handlers.notFound();

      response.setHeader('Content-Type', 'application/json');
      response.writeHead(responseBody.statusCode);
      response.end(JSON.stringify(responseBody));
    });
  }
);

server.listen(8000, () => console.log('Server is running on port 8000'));
