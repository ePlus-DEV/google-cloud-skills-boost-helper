import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import type {
  SearchPostsOfPublicationData,
  SearchPostsParams,
} from "../types/api";

// Apollo Client singleton
class ApiClient {
  private static instance: ApolloClient<any>;

  private static getClient(): ApolloClient<any> {
    if (!this.instance) {
      this.instance = new ApolloClient({
        uri: import.meta.env.WXT_API_URL,
        cache: new InMemoryCache(),
      });
    }
    return this.instance;
  }

  // GraphQL query definition
  private static readonly SEARCH_POSTS_QUERY = gql`
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

  /**
   * Fetch posts of a publication using GraphQL
   */
  static async fetchPostsOfPublication(
    params: SearchPostsParams
  ): Promise<SearchPostsOfPublicationData | null> {
    const {
      publicationId,
      query,
      first,
      after = null,
      sortBy = "DATE_PUBLISHED_DESC",
    } = params;

    try {
      const { data } = await this.getClient().query({
        query: this.SEARCH_POSTS_QUERY,
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
}

export default ApiClient;
