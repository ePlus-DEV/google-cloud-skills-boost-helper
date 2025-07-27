import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import type {
  SearchPostsOfPublicationData,
  SearchPostsParams,
} from "../types/api";

// Apollo Client singleton
const ApiClient = (() => {
  let instance: ApolloClient<unknown>;

  /**
   * Returns the singleton ApolloClient instance.
   * Initializes the client if it does not exist.
   */
  function getClient(): ApolloClient<unknown> {
    if (!instance) {
      instance = new ApolloClient({
        uri: import.meta.env.WXT_API_URL,
        cache: new InMemoryCache(),
      });
    }
    return instance;
  }

  // GraphQL query definition
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

  /**
   * Fetch posts of a publication using GraphQL
   */
  async function fetchPostsOfPublication(
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
      const { data } = await getClient().query({
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
      return null;
    }
  }

  return {
    fetchPostsOfPublication,
  };
})();

export default ApiClient;
