import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

/** Room spokes — each pill links to its dedicated landing page. */
const ROOMS = [
  { key: 'bathroom', href: '/ai-bathroom-design', hasDesc: true },
  { key: 'bedroom', href: '/ai-bedroom-design' },
  { key: 'living', href: '/ai-living-room-design' },
  { key: 'kitchen', href: '/ai-kitchen-design' },
  { key: 'dining', href: '/ai-dining-room-design' },
  { key: 'office', href: '/ai-home-office-design' },
  { key: 'kids', href: '/ai-kids-room-design' },
  { key: 'basement', href: '/ai-basement-design' },
  { key: 'attic', href: '/ai-attic-design' },
  { key: 'study', href: '/ai-study-room-design' },
] as const;

const TOOLS = [
  { key: 'planner', href: '/ai-room-planner' },
  { key: 'makeover', href: '/ai-room-makeover' },
] as const;

/**
 * Room types and styles — every item links to its spoke page, passing
 * homepage authority down to the long-tail room keywords.
 */
export function Rooms() {
  return (
    <section id="rooms" className="bg-background px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {m['landing.rooms.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            {m['landing.rooms.subtitle']()}
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-3">
          {ROOMS.map(({ key, href, hasDesc }) => (
            <li key={key} className="flex">
              <Link
                href={href}
                className="inline-flex items-center rounded-full bg-[#f5f5f7] px-5 py-2.5 text-base leading-normal font-medium transition-colors hover:bg-neutral-200"
              >
                {m[`landing.rooms.${key}` as 'landing.rooms.bedroom']()}
                {hasDesc && (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    — {m['landing.rooms.bathroom_desc']()}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-center">
          {TOOLS.map(({ key, href }) => (
            <li key={key}>
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground text-lg transition-colors hover:underline"
              >
                {m[`landing.rooms.${key}` as 'landing.rooms.planner']()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
