// Types for API responses and data structures

export interface PostNode {
  __typename?: string;
  id: string;
  title: string;
  slug?: string;
  publishedAt?: string;
  cuid?: string;
  url?: string;
  subtitle?: string;
  brief?: string;
  readTimeInMinutes?: number;
  views?: number;
  tags?: Array<{
    id: string;
    slug: string;
    name: string;
    __typename?: string;
  }>;
  author?: {
    __typename?: string;
    id: string;
    username: string;
    name: string;
    profilePicture?: string | null;
    followersCount?: number;
  };
  coverImage?: {
    __typename?: string;
    url: string;
    isPortrait?: boolean;
    isAttributionHidden?: boolean;
  } | null;
}

export interface PostEdge {
  __typename?: string;
  cursor: string;
  node: PostNode;
}

export interface SearchPostsOfPublicationData {
  edges: PostEdge[];
  pageInfo?: {
    __typename?: string;
    hasNextPage: boolean;
    endCursor?: string | null;
  };
  __typename?: string;
}

export interface SearchPostsParams {
  publicationId: string;
  query: string;
  first: number;
  after?: string | null;
}

export interface FuseOptions {
  threshold: number;
  keys: string[];
}
