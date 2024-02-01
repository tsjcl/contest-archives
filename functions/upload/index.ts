// @ts-ignore
import path from "node:path";
import algoliasearch from "algoliasearch";
import { createFetchRequester } from "@algolia/requester-fetch";

import { competitions, contests } from "../../src/constants.ts";

interface Env {
  BUCKET: R2Bucket;
  DATABASE: D1Database;

  ALGOLIA_APP_ID: string;
  ALGOLIA_API_KEY: string;
  ALGOLIA_INDEX_NAME: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const input = await request.formData();

  const year = parseInt(input.get('year')!);
  const competitionId = parseInt(input.get('competition')!);
  const contestId = parseInt(input.get('contest')!);
  const file = input.get('file') as unknown as File;
  const timestamp = Math.floor(Date.now() / 1000);
  const ext = path.extname(file.name);
  const filename = `${year}-${competitionId}-${contestId}-${timestamp}${ext}`

  await env.BUCKET.put(filename, file);

  const ps = env.DATABASE.prepare('INSERT INTO downloads (year, competition_id, contest_id, filename) VALUES (?, ?, ?, ?)');
  const data = await ps.bind(year, competitionId, contestId, filename).run();

  const client = algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_API_KEY, { requester: createFetchRequester() });
  const index = client.initIndex(env.ALGOLIA_INDEX_NAME);

  await index.saveObject({
    objectID: data.meta.last_row_id,
    year: year,
    competition: competitions[competitionId],
    contest: contests[contestId],
    filename: filename,
  });

  return Response.redirect(request.url, 302);
};
