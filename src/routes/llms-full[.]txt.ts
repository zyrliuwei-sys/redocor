import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { baseLocale } from '@/paraglide/runtime.js';
import { getLocalPosts, mergePosts } from '@/content/posts';

const STATIC_PAGES: { path: string; title: string; description: string }[] = [
  {
    path: '',
    title: 'Home',
    description: 'AI room design from a single photo — styles, gallery, FAQ',
  },
  {
    path: '/room-design',
    title: 'Room Design Studio',
    description: 'Upload a photo and generate a redesign',
  },
  {
    path: '/ai-room-design-free',
    title: 'Free AI Room Design',
    description: 'First design free with a free account (watermarked)',
  },
  {
    path: '/ai-living-room-design',
    title: 'AI Living Room Design',
    description: 'Restyle a living room from one photo',
  },
  {
    path: '/ai-bedroom-design',
    title: 'AI Bedroom Design',
    description: 'Restyle a bedroom from one photo',
  },
  {
    path: '/ai-kitchen-design',
    title: 'AI Kitchen Design',
    description: 'Cabinet and countertop looks from one photo',
  },
  {
    path: '/ai-bathroom-design',
    title: 'AI Bathroom Design',
    description: 'Tile, vanity and lighting ideas from one photo',
  },
  {
    path: '/ai-dining-room-design',
    title: 'AI Dining Room Design',
    description: 'Restyle a dining room from one photo',
  },
  {
    path: '/ai-home-office-design',
    title: 'AI Home Office Design',
    description: 'Desk layout and storage ideas from one photo',
  },
  {
    path: '/ai-basement-design',
    title: 'AI Basement Design',
    description: 'Visualize a finished basement from one photo',
  },
  {
    path: '/ai-attic-design',
    title: 'AI Attic Design',
    description: 'Design around sloped ceilings from one photo',
  },
  {
    path: '/ai-study-room-design',
    title: 'AI Study Room Design',
    description: 'Shelving and desk ideas from one photo',
  },
  {
    path: '/ai-kids-room-design',
    title: 'AI Kids Room Design',
    description: 'Sleep, play and study zones from one photo',
  },
  {
    path: '/ai-room-planner',
    title: 'AI Room Planner',
    description: 'Plan furniture layouts from one photo',
  },
  {
    path: '/ai-room-makeover',
    title: 'AI Room Makeover',
    description: 'Before-and-after redesigns from one photo',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Credit packs and packages',
  },
  { path: '/blog', title: 'Blog', description: 'Room design ideas and guides' },
];

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const { app_url, app_name, app_description } = envConfigs;

        const lines: string[] = [
          `# ${app_name}`,
          '',
          `> ${app_description}`,
          '',
          '## Pages',
          '',
          ...STATIC_PAGES.map(
            (p) => `- [${p.title}](${app_url}${p.path}): ${p.description}`
          ),
        ];

        let posts = getLocalPosts(baseLocale);
        try {
          const { listPublishedArticles, findPublishedBySlug } =
            await import('@/modules/posts/service');
          const rows = await listPublishedArticles().catch(() => []);
          const dbPosts = rows.map((row) => ({
            slug: row.slug,
            title: row.title || row.slug,
            description: row.description || '',
            createdAt: new Date(row.createdAt).toISOString(),
            source: 'db' as const,
          }));
          posts = mergePosts(dbPosts, posts);

          if (posts.length > 0) {
            lines.push('', '## Blog Posts', '');

            for (const post of posts) {
              lines.push(`### ${post.title}`, '');
              lines.push(`URL: ${app_url}/blog/${post.slug}`);
              if (post.description)
                lines.push(`Description: ${post.description}`);
              lines.push('');

              if (post.source === 'db') {
                const detail = await findPublishedBySlug(post.slug).catch(
                  () => null
                );
                if (detail?.content) {
                  lines.push(detail.content, '');
                }
              }

              lines.push('---', '');
            }
          }
        } catch {
          // Database unreachable — list local posts without content.
          if (posts.length > 0) {
            lines.push('', '## Blog Posts', '');
            for (const post of posts) {
              lines.push(`### ${post.title}`, '');
              lines.push(`URL: ${app_url}/blog/${post.slug}`);
              if (post.description)
                lines.push(`Description: ${post.description}`);
              lines.push('', '---', '');
            }
          }
        }

        lines.push('');

        return new Response(lines.join('\n'), {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
