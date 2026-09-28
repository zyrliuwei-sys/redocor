import type { ComponentType } from 'react';

import { baseLocale } from '@/paraglide/runtime.js';

/**
 * Local blog posts written as MDX files in this directory.
 * File naming: `<slug>.<locale>.mdx` (falls back to the base locale).
 * Register every local post slug here — it drives loading and the sitemap.
 *
 * This module is isomorphic (safe in client bundles). Database posts are
 * fetched through the server functions in ./server.ts and merged with the
 * local posts via the pure helpers below.
 */
export const BLOG_POST_SLUGS = [] as const;

export type BlogPostMeta = {
  title: string;
  description: string;
  created_at: string;
  author_name?: string;
  author_image?: string;
  image?: string;
};

type PostModule = {
  default: ComponentType;
  meta: BlogPostMeta;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  /** ISO date string — serializable across loader/server-fn boundaries */
  createdAt: string;
  authorName?: string;
  authorImage?: string;
  source: 'local' | 'db';
};

export type BlogPostDetail = BlogPost & {
  /** Raw markdown — set for database posts */
  content?: string;
};

// Public blog content is intentionally scoped to the product. This keeps old
// CMS entries from another project (for example poster-size guides) out of the
// blog, sitemap, and llms.txt even if they still exist in the database.
const ROOM_DESIGN_CONTEXT = [
  'room',
  'interior',
  'bedroom',
  'living room',
  'kitchen',
  'bathroom',
  'dining room',
  'home office',
  'office',
  'basement',
  'attic',
  'study room',
  'kids room',
  'furniture',
  'decor',
  'makeover',
  'redesign',
  'storage',
  'apartment',
  'home design',
  'wall',
  'window',
  'lighting',
  '房间',
  '室内',
  '卧室',
  '客厅',
  '厨房',
  '卫生间',
  '浴室',
  '餐厅',
  '书房',
  '办公室',
  '地下室',
  '阁楼',
  '儿童房',
  '家居',
  '家装',
  '装修',
  '改造',
  '布置',
  '家具',
  '收纳',
  '墙',
  '窗',
  '灯光',
  '空间',
  '小户型',
] as const;

const LEGACY_COPY_MARKERS = [
  'poster',
  'postersize',
  'print & digital',
  'print and digital',
  'digital dimensions',
  'livestream',
  'live stream',
] as const;

export function isRoomDesignPost(
  post: Pick<BlogPost, 'title' | 'description'> & {
    content?: string | null;
  }
): boolean {
  const copy = [post.title, post.description, post.content]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (LEGACY_COPY_MARKERS.some((marker) => copy.includes(marker))) {
    return false;
  }
  return ROOM_DESIGN_CONTEXT.some((term) => copy.includes(term));
}

// Eagerly bundle the local MDX posts (small markdown files), mirroring the
// static-pages pattern. Keys are absolute from the project root.
const postModules = import.meta.glob<PostModule>('/src/content/posts/*.mdx', {
  eager: true,
});

export function loadLocalPost(slug: string, locale: string): PostModule | null {
  if (!BLOG_POST_SLUGS.includes(slug as (typeof BLOG_POST_SLUGS)[number])) {
    return null;
  }
  return (
    postModules[`/src/content/posts/${slug}.${locale}.mdx`] ??
    postModules[`/src/content/posts/${slug}.${baseLocale}.mdx`] ??
    null
  );
}

function localPostToItem(slug: string, meta: BlogPostMeta): BlogPost {
  return {
    slug,
    title: meta.title,
    description: meta.description,
    image: meta.image,
    createdAt: new Date(meta.created_at).toISOString(),
    authorName: meta.author_name,
    authorImage: meta.author_image,
    source: 'local',
  };
}

export function getLocalPosts(locale: string): BlogPost[] {
  return BLOG_POST_SLUGS.map((slug) => ({
    slug: slug as string,
    mod: loadLocalPost(slug, locale),
  }))
    .filter((m): m is { slug: string; mod: PostModule } => m.mod !== null)
    .map(({ slug, mod }) => localPostToItem(slug, mod.meta));
}

/**
 * Merge database posts with local MDX posts, deduped by slug
 * (database wins), newest first.
 */
export function mergePosts(
  dbPosts: BlogPost[],
  localPosts: BlogPost[],
  options: { limit?: number } = {}
): BlogPost[] {
  const scopedDbPosts = dbPosts.filter(isRoomDesignPost);
  const dbSlugs = new Set(scopedDbPosts.map((p) => p.slug));
  const merged = [
    ...scopedDbPosts,
    ...localPosts.filter((p) => !dbSlugs.has(p.slug)),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return options.limit ? merged.slice(0, options.limit) : merged;
}

export function formatPostDate(dateIso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh' ? 'long' : 'short',
    day: 'numeric',
  }).format(new Date(dateIso));
}
