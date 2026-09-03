export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface PostRecord {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: PostStatus;
  publishAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsResult {
  postId?: string;
  range: string;
  views: number;
  referrers: Array<{ referrer: string; views: number }>;
  topPosts: Array<{ postId: string; title: string; views: number }>;
}

export interface QuillPostService {
  createPost(input: { userId: string; title: string; content: string; tags?: string[] }): Promise<PostRecord>;
  updatePost(input: { userId: string; id: string; title?: string; content?: string; tags?: string[] }): Promise<PostRecord>;
  deletePost(input: { userId: string; id: string }): Promise<void>;
  listPosts(input: { userId: string; status: PostStatus; limit?: number }): Promise<PostRecord[]>;
  getPost(input: { userId: string; id: string }): Promise<PostRecord>;
  publishPost(input: { userId: string; id: string }): Promise<PostRecord>;
  schedulePost(input: { userId: string; id: string; publishAt: string }): Promise<PostRecord>;
  unpublishPost(input: { userId: string; id: string }): Promise<PostRecord>;
  manageSeo(input: { userId: string; id: string; metaTitle?: string; metaDescription?: string; slug?: string }): Promise<PostRecord>;
  getAnalytics(input: { userId: string; postId?: string; range: string }): Promise<AnalyticsResult>;
}

export interface McpRequestContext { userId: string; }
export interface ApiKeyIdentity { userId: string; }
export interface ApiKeyResolver { resolve(apiKey: string): Promise<ApiKeyIdentity | undefined>; }
export interface McpAuditEvent { userId: string; toolName: string; timestamp: string; success: boolean; }
export type McpAuditHook = (event: McpAuditEvent) => void | Promise<void>;