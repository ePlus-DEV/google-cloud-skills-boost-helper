import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import Fuse from "fuse.js";
const fuseOptions = {
  threshold: 0.4,
  keys: ["title"],
};

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
    $sortBy: PostSortBy
  ) {
    searchPostsOfPublication(
      first: $first
      after: $after
      filter: $filter
      sortBy: $sortBy
    ) {
      edges {
        cursor
        node {
          id
          title
          url
        }
      }
    }
  }
`;

// Function to fetch posts of a publication
async function fetchPostsOfPublicationOnce(
  publicationId: string,
  query: string,
  first: number,
  after: string | null = null,
  sortBy: "DATE_PUBLISHED_DESC" = "DATE_PUBLISHED_DESC",
) {
  try {
    const { data } = await client.query({
      query: SEARCH_POSTS_QUERY,
      variables: {
        first,
        filter: { publicationId, query },
        after,
        sortBy,
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
      const outlineContainer = document
        .querySelector(".lab-content__outline.js-lab-content-outline")
        ?.closest("ul");

      if (!outlineContainer) {
        console.warn("Outline container <ul> element not found.");
        return;
      }

      const firstOutlineItem = outlineContainer.querySelector("li");
      if (!firstOutlineItem) {
        console.warn("First outline item <li> element not found.");
        return;
      }

      const queryText = (() => {
        const firstItemText = firstOutlineItem?.textContent?.trim();
        if (firstItemText === "Overview") {
          return (
            document
              .querySelector(".ql-display-large.lab-preamble__title")
              ?.textContent?.trim() || ""
          );
        }
        return firstItemText || "";
      })();

      const labTitle =
        document
          .querySelector(".ql-display-large.lab-preamble__title")
          ?.textContent?.trim() || "";
      const combinedQueryText = `${labTitle} - ${queryText}`.trim();

      const postsData = await fetchPostsOfPublicationOnce(
        import.meta.env.WXT_API_KEY,
        queryText,
        20,
        null,
        "DATE_PUBLISHED_DESC",
      );

      interface PostNode {
        id: string;
        title: string;
        url: string;
      }

      interface PostEdge {
        cursor: string;
        node: PostNode;
      }

      interface SearchPostsOfPublicationData {
        edges: PostEdge[];
      }

      // Use Fuse.js for fuzzy search to improve matching accuracy
      const firstPostUrl: string | null = (() => {
        if (!postsData) return null;
        const nodes = (postsData as SearchPostsOfPublicationData).edges.map(
          (e) => e.node,
        );
        if (!nodes.length) return null;
        const fuse = new Fuse(nodes, fuseOptions);
        const [best] = fuse.search(combinedQueryText);
        if (!best) return null;
        const url = best.item.url;
        if (!url) return null;
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}t=${Date.now()}`;
      })();

      outlineContainer.appendChild(createSolutionElement(firstPostUrl));
    }

    const ui = await createShadowRootUi(ctx, {
      name: "tailwind-extension",
      position: "inline",
      anchor: "body",
      onMount() {
        document.querySelector(".js-lab-leaderboard")?.remove();

        const gamesLabsElement = document.querySelector(".games-labs");
        if (gamesLabsElement) {
          gamesLabsElement.className =
            "lab-show l-full no-nav application-new lab-show l-full no-nav";
        }

        if (pathname === "/my_account/profile") {
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

          const publicProfileElement = document.querySelector(
            ".ql-body-medium.public-profile.public",
          );

          if (publicProfileElement) {
            const linkElement = publicProfileElement.querySelector("a");
            if (linkElement) {
              const copyButton = document.createElement("button");
              copyButton.textContent = "Copy Link";
              Object.assign(copyButton.style, {
                marginLeft: "10px",
                padding: "5px 10px",
                fontSize: "14px",
                cursor: "pointer",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
              });

              copyButton.addEventListener("click", (event) => {
                event.preventDefault();
                navigator.clipboard
                  .writeText(linkElement.href)
                  .then(() => {
                    if (publicProfileElement) {
                      publicProfileElement.insertAdjacentHTML(
                        "afterend",
                        `<ql-infobox id="clipboard" class="l-mtl"> ${browser.i18n.getMessage(
                          "messageLinkCopiedToClipboard",
                        )} </ql-infobox>`,
                      );
                    }

                    setTimeout(() => {
                      const clipboardElement =
                        document.querySelector("#clipboard");
                      if (clipboardElement) {
                        clipboardElement.remove();
                      }
                    }, 4000);
                  })
                  .catch((err) => {
                    console.error("Failed to copy link:", err);
                  });
              });

              publicProfileElement.appendChild(copyButton);
            }
          }

          // If there is a hash #public-profile, automatically scroll to the public profile section
          if (hash === "#public-profile") {
            const publicProfileElement =
              document.querySelector("#public-profile");
            if (publicProfileElement) {
              const elementPosition =
                publicProfileElement.getBoundingClientRect().top +
                window.pageYOffset;

              window.scrollTo({
                top: elementPosition,
                behavior: "smooth",
              });
            }
          }
        }
      },
    });
    ui.mount();
  },
});
