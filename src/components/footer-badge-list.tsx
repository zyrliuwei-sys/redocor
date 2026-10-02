import { DEFAULT_FOOTER_BADGES } from '@/features/footer-badges/defaults';
import type { FooterBadge } from '@/features/footer-badges/types';
import { parseStoredFooterBadges } from '@/features/footer-badges/validation';

import { cn } from '@/lib/utils';
import { usePublicConfig } from '@/hooks/use-public-config';

function BadgeRow({
  badges,
  hidden,
}: {
  badges: FooterBadge[];
  hidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-6 pr-6"
      aria-hidden={hidden || undefined}
    >
      {badges.map((badge) => (
        <a
          key={`${badge.href}:${badge.src}`}
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={hidden ? -1 : undefined}
          className="inline-flex shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <img
            src={badge.src}
            alt={hidden ? '' : badge.alt}
            width={badge.width ?? 250}
            height={badge.height}
            loading="lazy"
            className="h-7 w-auto max-w-none"
          />
        </a>
      ))}
    </div>
  );
}

/** Small, auto-scrolling strip of "featured on" badges (pauses on hover). */
export function FooterBadgeList({ className }: { className?: string }) {
  const { data } = usePublicConfig();
  const badges =
    data?.footer_badges === undefined
      ? DEFAULT_FOOTER_BADGES
      : parseStoredFooterBadges(data.footer_badges);

  if (badges.length === 0) return null;

  return (
    <div
      className={cn(
        'badge-marquee relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className
      )}
    >
      <div className="badge-marquee-track flex w-max">
        <BadgeRow badges={badges} />
        <BadgeRow badges={badges} hidden />
      </div>
    </div>
  );
}
