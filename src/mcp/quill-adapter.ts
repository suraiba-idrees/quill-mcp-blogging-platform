import type { AnalyticsResult, ApiKeyIdentity, ApiKeyResolver, PostRecord, PostStatus, QuillPostService } from "./types.js";
import * as postService from "../core/services/post.service.js";
import * as analyticsService from "../core/services/analytics.service.js";
import { validateApiKey } from "../core/services/api-key.service.js";
import type { Post } from "../core/types/domain.js";

function toPostRecord(post: Post): PostRecord {
  return {
    id: post.id,
    title: post.title,
    content: post.contentMd,
    tags: [], // tags are not part of the current data model
    status: post.status,
    publishAt: post.scheduledAt ?? undefined,
    metaTitle: post.metaTitle ?? undefined,
    metaDescription: post.metaDescription ?? undefined,
    slug: post.slug,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export const quillPostService: QuillPostService = {
  async createPost(input) {
    const post = postService.createPost(input.userId, {
      title: input.title,
      contentMd: input.content,
    });
    return toPostRecord(post);
  },

  async updatePost(input) {
    const post = postService.updatePost(input.userId, input.id, {
      title: input.title,
      contentMd: input.content,
    });
    return toPostRecord(post);
  },

  async deletePost(input) {
    postService.deletePost(input.userId, input.id);
  },

  async listPosts(input) {
    const posts = postService.listPosts(input.userId, input.status as PostStatus | undefined);
    const limited = input.limit ? posts.slice(0, input.limit) : posts;
    return limited.map(toPostRecord);
  },

  async getPost(input) {
    const post = postService.getPost(input.userId, input.id);
    return toPostRecord(post);
  },

  async publishPost(input) {
    const post = postService.publishPost(input.userId, input.id);
    return toPostRecord(post);
  },

  async schedulePost(input) {
    const post = postService.schedulePost(input.userId, input.id, { scheduledAt: input.publishAt });
    return toPostRecord(post);
  },

  async unpublishPost(input) {
    const post = postService.unpublishPost(input.userId, input.id);
    return toPostRecord(post);
  },

  async manageSeo(input) {
    const post = postService.updateSeo(input.userId, input.id, {
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      slug: input.slug,
    });
    return toPostRecord(post);
  },

  async getAnalytics(input): Promise<AnalyticsResult> {
  if (input.postId) {
    const result = analyticsService.getPostAnalytics(input.userId, input.postId);
    return {
      postId: input.postId,
      range: input.range,
      views: result.totalViews,
      referrers: result.referrers,
      topPosts: [],
    };
  }
  const summary = analyticsService.getUserAnalytics(input.userId);
  return {
    range: input.range,
    views: summary.totalViews,
    referrers: summary.referrers,
    topPosts: summary.topPosts,
  };
},
};
export const apiKeyResolver: ApiKeyResolver = {
  async resolve(apiKey: string): Promise<ApiKeyIdentity | undefined> {
    try {
      const { userId } = validateApiKey(apiKey);
      return { userId };
    } catch {
      return undefined;
    }
  },
};