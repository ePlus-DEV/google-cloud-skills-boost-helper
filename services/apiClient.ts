import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";
import type {
  SearchPostsOfPublicationData,
  SearchPostsParams,
} from "../types/api";

const HASHNODE_GRAPHQL_ENDPOINT = "https://gql-beta.hashnode.com/";

// Apollo Client singleton
const ApiClient = (() => {
  let instance: ApolloClient;

  /**
   * Returns the singleton ApolloClient instance.
   * Initializes the client if it does not exist.
   */
  function getClient(): ApolloClient {
    if (!instance) {
      instance = new ApolloClient({
        link: new HttpLink({
          uri: HASHNODE_GRAPHQL_ENDPOINT,
          headers: {
            Accept:
              "application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed",
          },
        }),
        cache: new InMemoryCache(),
      });
    }
    return instance;
  }

  // GraphQL query definition kept in sync with Hashnode's latest public search API.
  const SEARCH_POSTS_QUERY = gql`
    query SearchPosts(
      $publicationId: ObjectId!
      $query: String!
      $first: Int!
      $after: String
    ) {
      searchPostsOfPublication(
        first: $first
        after: $after
        filter: { publicationId: $publicationId, query: $query }
      ) {
        edges {
          node {
            ...PostThumbnail
            __typename
          }
          cursor
          __typename
        }
        pageInfo {
          hasNextPage
          endCursor
          __typename
        }
        __typename
      }
    }

    fragment PostThumbnail on Post {
      __typename
      id
      title
      slug
      publishedAt
      cuid
      url
      subtitle
      brief
      readTimeInMinutes
      views
      tags {
        id
        slug
        name
        __typename
      }
      author {
        __typename
        id
        username
        name
        profilePicture
        followersCount
      }
      coverImage {
        __typename
        url
        isPortrait
        isAttributionHidden
      }
    }
  `;

  /**
   * Fetch posts of a publication using GraphQL
   */
  async function fetchPostsOfPublication(
    params: SearchPostsParams,
  ): Promise<SearchPostsOfPublicationData | null> {
    const { publicationId, query, first, after = null } = params;

    try {
      const result = await getClient().query({
        query: SEARCH_POSTS_QUERY,
        variables: {
          publicationId,
          query,
          first,
          after,
        },
      });

      const data = result.data as {
        searchPostsOfPublication: SearchPostsOfPublicationData;
      };
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
