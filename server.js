const ProxyChain = require('proxy-chain');

const port = process.env.PORT || 8000;
const server = new ProxyChain.Server({
    // Port where the server will listen. By default 8000.
    port: port,

    // Enables verbose logging
    verbose: true,

    // Custom function to authenticate proxy requests and provide the URL to chained upstream proxy.
    // It must return an object (or promise resolving to the object) with the following form:
    // { upstreamProxyUrl: String }
    // If the function is not defined or is null, the server runs in simple mode.
    // Note that the function takes a single argument with the following properties:
    // * request      - An instance of http.IncomingMessage class with information about the client request
    //                  (which is either HTTP CONNECT for SSL protocol, or other HTTP request)
    prepareRequestFunction: ({ request }) => {
        const proxy = request.headers['UPSTREAM'];
        return {
            // Sets up an upstream HTTP proxy to which all the requests are forwarded.
            // If null, the proxy works in direct mode, i.e. the connection is forwarded directly
            // to the target server.
            upstreamProxyUrl: proxy,
        };
    },
});

server.listen(() => {
  console.log(`Proxy server is listening on port ${server.port}.`);
});

// Emitted when HTTP connection is closed
server.on('connectionClosed', ({ connectionId, stats }) => {
  console.log(`Connection ${connectionId} closed.`);
  console.dir(stats);
});

// Emitted when HTTP request fails
server.on('requestFailed', ({ request, error }) => {
  console.log(`Request ${request.url} failed.`);
  console.error(error);
});