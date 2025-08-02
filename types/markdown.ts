/**
 * Markdown service related types
 */

export interface MarkdownLoadOptions {
  /** The URL to fetch markdown content from */
  url: string;
  /** The ID of the container element to render content into */
  containerId: string;
  /** The selector for the content area within the container */
  contentSelector?: string;
  /** Whether to append to existing content or replace it */
  append?: boolean;
}

export interface MarkdownConfig {
  /** GitHub Flavored Markdown support */
  gfm?: boolean;
  /** Convert line breaks to <br> */
  breaks?: boolean;
  /** Enable syntax highlighting */
  highlight?: boolean;
}

export interface MarkdownError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Original error object */
  originalError?: unknown;
}
