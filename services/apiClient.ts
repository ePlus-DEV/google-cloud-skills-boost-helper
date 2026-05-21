import type {
  SearchPostsOfPublicationData,
  SearchPostsParams,
} from "../types/api";

// REST API Client
const ApiClient = (() => {
  const REST_API_URL =
    "https://raw.githubusercontent.com/hoangsvit/eplus.dev/refs/heads/main/data/posts.json";

  /**
   * Fetch posts from REST API and transform to SearchPostsOfPublicationData format
   */
  async function fetchPostsOfPublication(
    params: SearchPostsParams,
  ): Promise<SearchPostsOfPublicationData | null> {
    const { query, first } = params;
    console.log("[ApiClient] Fetching posts with query:", query);

    try {
      console.log("[ApiClient] Fetching from:", REST_API_URL);
      const response = await fetch(REST_API_URL);
      if (!response.ok) {
        console.error("[ApiClient] API response not OK:", response.status);
        return null;
      }

      const posts = (await response.json()) as Array<{
        _id: string;
        title: string;
        slug: string;
        datePublished: string;
      }>;
      console.log("[ApiClient] Total posts loaded:", posts.length);

      // Filter posts by query
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/[\s-]+/).filter(Boolean);

      const filteredPosts = posts.filter((post) => {
        const titleLower = post.title.toLowerCase();
        const slugLower = post.slug.toLowerCase();

        // Check if all query words are in title or slug
        return queryWords.every(
          (word) => titleLower.includes(word) || slugLower.includes(word),
        );
      });
      console.log(
        "[ApiClient] Filtered posts:",
        filteredPosts.length,
        filteredPosts.map((p) => p.title),
      );

      // Transform to SearchPostsOfPublicationData format for compatibility
      const edges = filteredPosts.slice(0, first).map((post, index) => ({
        cursor: `cursor_${index}`,
        node: {
          id: post._id,
          title: post.title,
          url: post.slug,
          slug: post.slug,
          __typename: "Post",
        },
        __typename: "PostEdge",
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: filteredPosts.length > first,
          endCursor:
            filteredPosts.length > first ? `cursor_${first}` : undefined,
          __typename: "PageInfo",
        },
        __typename: "PostConnection",
      };
    } catch (error) {
      console.error("[ApiClient] Error fetching posts:", error);
      return null;
    }
  }

  return {
    fetchPostsOfPublication,
  };
})();

export default ApiClient;
