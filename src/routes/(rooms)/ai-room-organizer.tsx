import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Retired spoke: there is no dedicated organizer mode, so the old URL
 * permanently redirects to the closest real page.
 */
export const Route = createFileRoute('/(rooms)/ai-room-organizer')({
  loader: () => {
    throw redirect({ to: '/ai-room-makeover', statusCode: 301 });
  },
});
