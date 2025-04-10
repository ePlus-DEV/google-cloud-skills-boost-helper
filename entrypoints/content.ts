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
          brief
          title
          cuid
          slug
          reactionCount
          publishedAt
          url
          coverImage {
            url
          }
          author {
            id
            name
          }
          publication {
            title
            url
          }
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
  after: string | null = null
) {
  let fetched = false;

  if (!fetched) {
    fetched = true;
    try {
      const { data } = await client.query({
        query: SEARCH_POSTS_QUERY,
        variables: {
          first,
          filter: {
            publicationId,
            query,
          },
          after,
        },
      });
      return data.searchPostsOfPublication;
    } catch (error) {
      console.error("Error fetching posts of publication:", error);
      return null;
    }
  }
  return null;
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
    if (
      window.location.href.startsWith(
        "https://www.cloudskillsboost.google/games/"
      ) ||
      window.location.href.startsWith(
        "https://www.cloudskillsboost.google/course_templates/"
      ) ||
      window.location.href.startsWith(
        "https://www.cloudskillsboost.google/focuses/"
      )
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

      if (queryText) {
        const postsData = await fetchPostsOfPublicationOnce(
          import.meta.env.WXT_API_KEY,
          queryText
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

        const solutionElement = document.createElement("li");
        Object.assign(solutionElement.style, {
          marginTop: "15px",
          padding: "10px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        });

        if (firstPostUrl) {
          solutionElement.innerHTML = `
        <ql-button
          icon="check"
          type="button"
          title="Click to open the solution"
          data-aria-label="Click to open the solution"
          onclick="window.open('${firstPostUrl}', '_blank')"
        >
          Solution this lab
        </ql-button>
        `;
        } else {
          solutionElement.innerHTML = `
        <ql-button icon="close" disabled>
          No solution
        </ql-button>
        `;
        }

        outlineContainer.appendChild(solutionElement);
      }
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

        if (
          window.location.hash === "#public-profile" &&
          window.location.pathname === "/my_account/profile"
        ) {
          const publicProfileElement =
            document.querySelector("#public-profile");
          publicProfileElement?.scrollIntoView({ behavior: "smooth" });

          const publicProfileChecked = document.querySelector<HTMLInputElement>(
            "#public_profile_checked"
          );
          if (publicProfileChecked && !publicProfileChecked.checked) {
            publicProfileChecked.checked = true;

            const updateSettingsButton = document.querySelector<HTMLElement>(
              'ql-button[type="submit"][name="commit"][data-disable-with="Update settings"]'
            );
            updateSettingsButton?.setAttribute(
              "title",
              "Click to update your settings"
            );

            const saveNotification = document.createElement("div");
            Object.assign(saveNotification.style, {
              position: "fixed",
              bottom: "10px",
              right: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              border: "1px solid #f5c6cb",
              borderRadius: "5px",
              zIndex: "1000",
            });
            saveNotification.textContent =
              "Please click the 'Update settings' button above.";
            document.body.appendChild(saveNotification);
          }
        }
      },
    });
    ui.mount();
  },
});
