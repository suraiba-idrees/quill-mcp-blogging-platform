import * as z from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { McpToolError, toMcpError } from '../errors.js';
import type { McpAuditHook, McpRequestContext, PostRecord, QuillPostService } from '../types.js';

const id = z.string().trim().min(1).max(200);
const nonEmptyText = z.string().trim().min(1);
const postStatus = z.enum(['draft', 'published', 'scheduled']);
const tagList = z.array(nonEmptyText).max(50).optional();

function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

function postResult(message: string, post: PostRecord): CallToolResult {
  return jsonResult({ success: true, message, post });
}

function registerTool(
  server: McpServer,
  name: string,
  description: string,
  inputSchema: Record<string, z.ZodType>,
  context: McpRequestContext,
  service: QuillPostService,
  audit: McpAuditHook | undefined,
  handler: (input: Record<string, unknown>) => Promise<CallToolResult>,
) {
  server.registerTool(name, { description, inputSchema }, async input => {
    const timestamp = new Date().toISOString();
    try {
      const response = await handler(input as Record<string, unknown>);
      await audit?.({ userId: context.userId, toolName: name, timestamp, success: true });
      return response;
    } catch (error) {
      const safeError = toMcpError(error);
      await audit?.({ userId: context.userId, toolName: name, timestamp, success: false });
      return { ...jsonResult({ success: false, error: safeError.message, code: safeError.code }), isError: true };
    }
  });
}

export function registerQuillTools(server: McpServer, context: McpRequestContext, service: QuillPostService, audit?: McpAuditHook) {
  registerTool(server, 'create_post', 'Create a new draft post.', { title: nonEmptyText.max(300), content: z.string(), tags: tagList }, context, service, audit, async input =>
    postResult('Draft created.', await service.createPost({ userId: context.userId, title: input.title as string, content: input.content as string, tags: input.tags as string[] | undefined })));

  registerTool(server, 'update_post', 'Update one or more editable fields on a post.', { id, title: nonEmptyText.max(300).optional(), content: z.string().optional(), tags: tagList }, context, service, audit, async input => {
    if (input.title === undefined && input.content === undefined && input.tags === undefined) throw new McpToolError('At least one editable field is required.', 'INVALID_ARGUMENT');
    return postResult('Post updated.', await service.updatePost({ userId: context.userId, id: input.id as string, title: input.title as string | undefined, content: input.content as string | undefined, tags: input.tags as string[] | undefined }));
  });

  registerTool(server, 'delete_post', 'Delete a post belonging to the authenticated user.', { id }, context, service, audit, async input => {
    await service.deletePost({ userId: context.userId, id: input.id as string });
    return jsonResult({ success: true, message: 'Post deleted.', id: input.id });
  });

  registerTool(server, 'list_posts', "List the authenticated user's posts by status.", { status: postStatus, limit: z.number().int().positive().max(100).optional() }, context, service, audit, async input =>
    jsonResult({ success: true, posts: await service.listPosts({ userId: context.userId, status: input.status as 'draft' | 'published' | 'scheduled', limit: input.limit as number | undefined }) }));

  registerTool(server, 'get_post', 'Get the full details of one post.', { id }, context, service, audit, async input =>
    postResult('Post retrieved.', await service.getPost({ userId: context.userId, id: input.id as string })));

  registerTool(server, 'publish_post', 'Publish a draft immediately.', { id }, context, service, audit, async input =>
    postResult('Post published.', await service.publishPost({ userId: context.userId, id: input.id as string })));

  registerTool(server, 'schedule_post', 'Schedule a post for publication.', { id, publish_at: z.string().datetime({ offset: true }) }, context, service, audit, async input => {
    const publishAt = input.publish_at as string;
    if (new Date(publishAt).getTime() <= Date.now()) throw new McpToolError('publish_at must be in the future.', 'INVALID_ARGUMENT');
    return postResult('Post scheduled.', await service.schedulePost({ userId: context.userId, id: input.id as string, publishAt }));
  });

  registerTool(server, 'unpublish_post', 'Convert a published post back into a draft.', { id }, context, service, audit, async input =>
    postResult('Post unpublished.', await service.unpublishPost({ userId: context.userId, id: input.id as string })));

  registerTool(server, 'manage_seo', 'Update SEO metadata for a post.', { id, meta_title: nonEmptyText.max(300).optional(), meta_description: nonEmptyText.max(1000).optional(), slug: nonEmptyText.max(200).optional() }, context, service, audit, async input => {
    if (input.meta_title === undefined && input.meta_description === undefined && input.slug === undefined) throw new McpToolError('At least one SEO field is required.', 'INVALID_ARGUMENT');
    return postResult('SEO metadata updated.', await service.manageSeo({ userId: context.userId, id: input.id as string, metaTitle: input.meta_title as string | undefined, metaDescription: input.meta_description as string | undefined, slug: input.slug as string | undefined }));
  });

  registerTool(server, 'get_analytics', 'Retrieve post views, referrers, and top-post analytics.', { post_id: id.optional(), range: nonEmptyText.max(50) }, context, service, audit, async input =>
    jsonResult({ success: true, analytics: await service.getAnalytics({ userId: context.userId, postId: input.post_id as string | undefined, range: input.range as string }) }));
}