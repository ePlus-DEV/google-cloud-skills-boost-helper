// Types for API responses and data structures

export interface PostNode {
  id: string;
  title: string;
  url: string;
}

export interface PostEdge {
  cursor: string;
  node: PostNode;
}

export interface SearchPostsOfPublicationData {
  edges: PostEdge[];
}

export interface SearchPostsParams {
  publicationId: string;
  query: string;
  first: number;
  after?: string | null;
  sortBy?: "DATE_PUBLISHED_DESC";
}

export interface FuseOptions {
  threshold: number;
  keys: string[];
}
