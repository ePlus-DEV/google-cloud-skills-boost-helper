import type { SearchPostsParams } from "../types/api";

// REST API Client
const ApiClient = (() => {
  /**
   * Fetch posts from REST API and transform to SearchPostsOfPublicationData format
   */
  async function fetchPostsOfPublication(params: SearchPostsParams): Promise<
    Array<{
      id: string;
      title: string;
      slug: string;
      url: string;
      datePublished: string;
    }>
  > {
    const { query } = params;

    try {
      const baseUrl = import.meta.env.WXT_API_URL;
      const separator = baseUrl.includes("?") ? "&" : "?";
      const response = await fetch(`${baseUrl}${separator}time=${Date.now()}`);
      if (!response.ok) {
        if (import.meta.env.MODE === "development") {
          console.error("[ApiClient] API response not OK:", response.status);
        }
        return [];
      }

      const posts = (await response.json()) as Array<{
        _id: string;
        title: string;
        slug: string;
        datePublished: string;
      }>;
      console.info("[ApiClient] Total posts loaded:", posts.length);

      // Filter posts by query
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/[\s-]+/).filter(Boolean);

      const filteredPosts = posts.filter((post) => {
        const titleLower = post.title.toLowerCase();
        const slugLower = post.slug.toLowerCase();
        return queryWords.every(
          (word) => titleLower.includes(word) || slugLower.includes(word),
        );
      });
      if (import.meta.env.MODE === "development") {
        console.info(
          "[ApiClient] Filtered posts:",
          filteredPosts.length,
          filteredPosts.map((p) => p.title),
        );
      }

      // Return simple array of posts
      return filteredPosts.map((post) => ({
        id: post._id,
        title: post.title,
        slug: post.slug,
        url: post.slug,
        datePublished: post.datePublished,
      }));
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("[ApiClient] Error fetching posts:", error);
      }
      return [];
    }
  }

  return {
    fetchPostsOfPublication,
  };
})();

export default ApiClient;
