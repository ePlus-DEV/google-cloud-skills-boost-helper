import type { ContentScriptContext } from "wxt/client";
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
    "https://www.cloudskillsboost.google/my_account/profile*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const labLeaderboardElement = document.querySelector("#step1");
    const labLeaderboardText = labLeaderboardElement?.textContent || "";

    if (labLeaderboardText) {
      const postsData = await fetchPostsOfPublicationOnce(
        import.meta.env.WXT_API_KEY,
        labLeaderboardText
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
        backgroundColor: "#f0f9ff",
        border: "1px solid #b6e0fe",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      });

      if (firstPostUrl) {
        const solutionLink = document.createElement("a");
        Object.assign(solutionLink, {
          href: firstPostUrl,
          textContent: "Solution for this Lab",
          target: "_blank",
          title: "Click to view the solution for this lab",
          style: {
            textDecoration: "none",
            color: "#0056b3",
            fontWeight: "bold",
            fontSize: "14px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#e3f2fd",
            borderRadius: "5px",
            transition: "background-color 0.3s, color 0.3s",
          },
        });

        solutionLink.addEventListener("mouseover", () => {
          solutionLink.style.backgroundColor = "#bbdefb";
          solutionLink.style.color = "#003c8f";
        });

        solutionLink.addEventListener("mouseout", () => {
          solutionLink.style.backgroundColor = "#e3f2fd";
          solutionLink.style.color = "#0056b3";
        });

        solutionElement.appendChild(solutionLink);
      } else {
        solutionElement.textContent = "No solution available.";
        Object.assign(solutionElement.style, {
          color: "#d32f2f",
          fontWeight: "bold",
          fontSize: "14px",
          textAlign: "center",
        });
      }

      outlineContainer.appendChild(solutionElement);
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
