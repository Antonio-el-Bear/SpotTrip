export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
};

var HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function buildBackendUrl(req) {
  var incomingUrl = new URL(req.url, "http://127.0.0.1:3000");
  return new URL(incomingUrl.pathname + incomingUrl.search, "http://127.0.0.1:8000");
}

function copyRequestHeaders(req) {
  var headers = new Headers();
  Object.entries(req.headers || {}).forEach(function(entry) {
    var name = entry[0];
    var value = entry[1];

    if (value == null || HOP_BY_HOP_HEADERS.has(String(name).toLowerCase()) || String(name).toLowerCase() === "host") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(function(item) {
        headers.append(name, item);
      });
      return;
    }

    headers.set(name, String(value));
  });
  return headers;
}

async function readRawBody(req) {
  var chunks = [];

  for await (var chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return chunks.length ? Buffer.concat(chunks) : null;
}

function writeResponseHeaders(res, headers) {
  if (typeof headers.getSetCookie === "function") {
    var setCookies = headers.getSetCookie();
    if (setCookies && setCookies.length) {
      res.setHeader("set-cookie", setCookies);
    }
  }

  headers.forEach(function(value, name) {
    if (HOP_BY_HOP_HEADERS.has(String(name).toLowerCase())) {
      return;
    }

     if (String(name).toLowerCase() === "set-cookie") {
      return;
    }

    res.setHeader(name, value);
  });
}

export default async function handler(req, res) {
  var targetUrl = buildBackendUrl(req);
  var method = req.method || "GET";
  var headers = copyRequestHeaders(req);
  var body = method === "GET" || method === "HEAD" ? null : await readRawBody(req);

  try {
    var response = await fetch(targetUrl, {
      method: method,
      headers: headers,
      body: body,
      redirect: "manual",
    });
    var payload = Buffer.from(await response.arrayBuffer());

    writeResponseHeaders(res, response.headers);
    res.status(response.status);
    res.send(payload);
  } catch (error) {
    res.status(502).json({
      error: error && error.message ? error.message : "Backend API proxy request failed",
    });
  }
}