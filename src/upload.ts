import "./style.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faExternalLink } from "@fortawesome/pro-light-svg-icons";
import { competitions, contests } from "./constants.ts";

library.add(faExternalLink);
dom.watch();

const competitionEl = document.getElementById('competition') as HTMLSelectElement;
for (const [key, value] of Object.entries(competitions)) {
  competitionEl.add(new Option(value, key));
}

const contestEl = document.getElementById('contest') as HTMLSelectElement;
for (const [key, value] of Object.entries(contests)) {
  contestEl.add(new Option(value, key));
}
