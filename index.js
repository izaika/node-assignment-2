const fs = require('fs');
const path = require('path');
const https = require('https');

const handlers = require('./handlers');
const { getRouteString } = require('./utils');

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, './https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './https/cert.pem')),
  },
  (request, response) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', chunk => (body += chunk));

    request.on('end', async () => {
      const handlerName = getRouteString(request);

      const responseBody = handlers[handlerName]
        ? await handlers[handlerName](request)
        : await handlers.notFound();

      response.setHeader('Content-Type', 'application/json');
      response.writeHead(responseBody.statusCode);
      response.end(JSON.stringify(responseBody));
    });
  }
);

server.listen(8000, () => console.log('Server is running on port 8000'));
