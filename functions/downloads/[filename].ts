interface Env {
  BUCKET: R2Bucket;
}

type Params = "filename";

export const onRequestGet: PagesFunction<Env, Params> = async ({ env, params }) => {
  // @ts-ignore
  const obj = await env.BUCKET.get(params.filename);
  if (obj === null) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(obj.body);
};
