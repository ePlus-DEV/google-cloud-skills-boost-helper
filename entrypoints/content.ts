import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: import.meta.env.WXT_API_URL,
  cache: new InMemoryCache(),
});

// Define the GraphQL query
const SEARCH_POSTS_QUERY = gql`
  query SearchPostsOfPublication(
    $first: Int!
    $filter: SearchPostsOfPublicationFilter!
    $after: String
  ) {
    searchPostsOfPublication(first: $first, after: $after, filter: $filter) {
      edges {
        cursor
        node {
          id
          title
          url
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// Function to fetch posts of a publication
async function fetchPostsOfPublicationOnce(
  publicationId: string,
  query: string,
  first = 10,
  after: string | null = null,
) {
  try {
    const { data } = await client.query({
      query: SEARCH_POSTS_QUERY,
      variables: {
        first,
        filter: { publicationId, query },
        after,
      },
    });
    return data.searchPostsOfPublication;
  } catch (error) {
    console.error("Error fetching posts of publication:", error);
    return null;
  }
}

// Helper function to create a solution button
function createSolutionElement(url: string | null): HTMLLIElement {
  const solutionElement = document.createElement("li");
  Object.assign(solutionElement.style, {
    marginTop: "15px",
    padding: "10px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  });

  solutionElement.innerHTML = url
    ? `
      <ql-button
        icon="check"
        type="button"
        title="Click to open the solution"
        data-aria-label="Click to open the solution"
        onclick="window.open('${url}', '_blank')"
      >
        Solution this lab
      </ql-button>
    `
    : `
      <ql-button icon="close" disabled>
        No solution
      </ql-button>
    `;

  return solutionElement;
}

export default defineContentScript({
  matches: [
    "https://www.cloudskillsboost.google/games/*/labs/*",
    "https://www.cloudskillsboost.google/course_templates/*/labs/*",
    "https://www.cloudskillsboost.google/focuses/*",
    "https://www.cloudskillsboost.google/my_account/profile*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const { href, pathname, hash } = window.location;

    if (
      href.startsWith("https://www.cloudskillsboost.google/games/") ||
      href.startsWith(
        "https://www.cloudskillsboost.google/course_templates/",
      ) ||
      href.startsWith("https://www.cloudskillsboost.google/focuses/")
    ) {
      const queryText =
        document.querySelector("#step1")?.textContent?.trim() ||
        document
          .querySelector("h1.ql-display-large.lab-preamble__title")
          ?.textContent?.trim();

      if (!queryText || queryText === "Overview") {
        console.warn("Query text not found or is 'Overview'.");
        return;
      }

      const postsData = await fetchPostsOfPublicationOnce(
        import.meta.env.WXT_API_KEY,
        queryText,
      );

      const firstPostUrl = postsData?.edges?.[0]?.node?.url
        ? `${postsData.edges[0].node.url}#heading-solution-of-lab`
        : null;

      const outlineContainer = document
        .querySelector(".lab-content__outline.js-lab-content-outline")
        ?.closest("ul");

      if (!outlineContainer) {
        console.warn("Outline container <ul> element not found.");
        return;
      }

      outlineContainer.appendChild(createSolutionElement(firstPostUrl));
    }

    const ui = await createShadowRootUi(ctx, {
      name: "tailwind-shadow-root-example",
      position: "inline",
      anchor: "body",
      onMount() {
        document.querySelector(".js-lab-leaderboard")?.remove();

        const gamesLabsElement = document.querySelector(".games-labs");
        if (gamesLabsElement) {
          gamesLabsElement.className =
            "lab-show l-full no-nav application-new lab-show l-full no-nav";
        }

        if (hash === "#public-profile" && pathname === "/my_account/profile") {
          const publicProfileElement =
            document.querySelector("#public-profile");
          publicProfileElement?.scrollIntoView({ behavior: "smooth" });

          const publicProfileChecked = document.querySelector<HTMLInputElement>(
            "#public_profile_checked",
          );
          if (publicProfileChecked && !publicProfileChecked.checked) {
            publicProfileChecked.checked = true;

            const formElement = document.querySelector(
              ".simple_form.edit_user",
            );
            if (formElement) {
              formElement.insertAdjacentHTML(
                "afterend",
                `<ql-warningbox> ${browser.i18n.getMessage(
                  "notePleaseSetUpTheSettings",
                )} </ql-warningbox>`,
              );
            }
          }
        }
      },
    });
    ui.mount();
  },
});
