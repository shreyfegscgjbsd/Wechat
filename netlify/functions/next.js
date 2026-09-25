// Netlify function handler for Next.js API routes
// All /api/* requests are proxied to this function

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';
const app = next({ dev: isDev });
const handle = app.getRequestHandler();

exports.handler = async (event, context) => {
  const parsedUrl = parse(event.path, true);
  const { method, headers, body } = event;

  // Build a simplified request object for Next.js
  const req = {
    method,
    headers,
    url: event.path,
    query: parsedUrl.query,
    body: body
      ? (() => {
          try {
            return JSON.parse(body);
          } catch {
            return null;
          }
        })()
      : null,
    cookies: parseCookies(event.headers.cookie),
    rawBody: body,
    ...event,
  };

  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    raw: {
      write: () => true,
      end: () => true,
      setHeader: (k, v) => {
        res.headers[k] = v;
      },
      getHeader: (k) => res.headers[k],
      removeHeader: () => {},
      flushHeaders: () => true,
    },
    setHeader: (k, v) => {
      res.headers[k] = v;
    },
    getHeader: (k) => res.headers[k],
    removeHeader: () => {},
    cookie: () => {},
    json: (data) => {
      res.statusCode = 200;
      res.headers['content-type'] = 'application/json';
      res.body = JSON.stringify(data);
    },
    send: (data) => {
      res.statusCode = 200;
      res.body = data;
    },
    redirect: (status, url) => {
      res.statusCode = parseInt(status);
      res.headers['location'] = url;
    },
  };

  await app.prepare();
  return handle(req, res).then(() => ({
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body,
    isBase64Encoded: false,
  }));
};

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    cookies[name] = rest.join('=');
    return cookies;
  }, {});
}
