import "./style.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faDownload, faExternalLink } from "@fortawesome/pro-light-svg-icons";

library.add(faDownload, faExternalLink);
dom.watch();

import algoliasearch from "algoliasearch/lite";
import instantsearch, { UiState } from "instantsearch.js";
import { connectHits } from "instantsearch.js/es/connectors";
import {
  searchBox,
  pagination,
  poweredBy,
  rangeInput,
  refinementList,
} from "instantsearch.js/es/widgets";

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_API_KEY,
);
const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;

const search = instantsearch({
  searchClient,
  indexName,
  routing: {
    stateMapping: {
      stateToRoute(uiState) {
        const indexUiState = uiState[indexName];
        return {
          query: indexUiState.query,
          year: indexUiState.range?.year,
          competition: indexUiState.refinementList?.competition?.join("~"),
          contest: indexUiState.refinementList?.contest?.join("~"),
          page: indexUiState.page,
        };
      },
      routeToState(routeState) {
        return {
          [indexName]: {
            query: routeState.query,
            range: {
              year: routeState.year,
            },
            refinementList: {
              competition: routeState.competition?.split("~"),
              contest: routeState.contest?.split("~"),
            },
            page: routeState.page,
          },
        } as UiState;
      },
    },
  },
});

const tableHits = connectHits((renderOptions) => {
  const { hits } = renderOptions;

  const el = document.querySelector("#hits-table")!;

  if (hits.length === 0) {
    el.innerHTML = `
      <p class="lead text-center">Eheu! I could not find any tests that match your search.</p>
    `;
    return;
  }

  el.innerHTML = `
    <table class="table">
      <thead>
          <tr>
              <th scope="col">Year</th>
              <th scope="col">Competition</th>
              <th scope="col">Contest Name</th>
              <th scope="col"></th>
          </tr>
      </thead>
      <tbody>
        ${hits
          .map(hit => `
              <tr>
                <td>${hit.year}</td>
                <td>${hit.competition}</td>
                <td>${hit.contest}</td>
                <td>
                  <a href="/downloads/${hit.filename}" target="_blank" aria-label="Download">
                    <i class="fa-light fa-download"></i>
                  </a>
                </td>
              </tr>
          `)
          .join("")}
      </tbody>
    </table>
  `;
});

search.addWidgets([
  searchBox({
    container: "#query",
    placeholder: "Search",
    autofocus: true,
    showReset: false,
    showSubmit: false,
    cssClasses: {
      input: "form-control",
    },
  }),

  tableHits({
    escapeHTML: false,
  }),

  pagination({
    container: "#pagination-container",
    scrollTo: "#contest-search-container",
    showFirst: false,
    showLast: false,
    templates: {
      previous(_, { html }) {
        return html`&laquo;`;
      },
      next(_, { html }) {
        return html`&raquo;`;
      },
    },
    cssClasses: {
      list: "pagination",
      item: "page-item",
      selectedItem: "active",
      disabledItem: "disabled",
      link: "page-link",
    },
  }),

  poweredBy({
    container: "#powered-by",
  }),

  rangeInput({
    container: "#year-facet",
    attribute: "year",
    cssClasses: {
      inputMin: ["form-control", "form-control-sm"],
      inputMax: ["form-control", "form-control-sm"],
      separator: "mx-1",
      submit: ["btn", "btn-primary", "btn-sm", "ml-1"],
    },
  }),

  refinementList({
    container: "#competition-facet",
    attribute: "competition",
    sortBy: ["name:asc"],
    cssClasses: {
      list: "list-unstyled",
      item: ["form-check", "mb-1"],
      label: "form-check-label",
      checkbox: "form-check-input",
      count: ["badge", "badge-primary", "badge-pill", "ml-2"],
    },
  }),

  refinementList({
    container: "#contest-facet",
    attribute: "contest",
    showMore: true,
    showMoreLimit: 50,
    sortBy: ["isRefined", "name:asc"],
    cssClasses: {
      list: "list-unstyled",
      item: ["form-check", "mb-1"],
      label: "form-check-label",
      checkbox: "form-check-input",
      showMore: ["btn", "btn-primary", "btn-sm"],
      disabledShowMore: "d-none",
      count: ["badge", "badge-primary", "badge-pill", "ml-2"],
    },
  }),
]);

search.start();
