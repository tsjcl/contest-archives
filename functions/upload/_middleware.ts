// @ts-ignore
import { Buffer } from "node:buffer";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  const encoder = new TextEncoder();

  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  if (aBytes.byteLength !== bBytes.byteLength) {
    return false;
  }

  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

function unauthorized() {
  return new Response("Authorization required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="TSJCL Contest Archives", charset="UTF-8"',
    },
  });
}

interface Env {
  UPLOAD_USERNAME: string;
  UPLOAD_PASSWORD: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, next, env }) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return unauthorized();
  }

  const [scheme, encoded] = authorization.split(" ");

  if (!encoded || scheme !== "Basic") {
    return unauthorized();
  }

  const credentials = Buffer.from(encoded, "base64").toString();
  const [username, password] = credentials.split(":");

  if (
    !timingSafeEqual(env.UPLOAD_USERNAME, username) ||
    !timingSafeEqual(env.UPLOAD_PASSWORD, password)
  ) {
    return unauthorized();
  }

  return await next();
}
