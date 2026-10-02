import { ArrowRight, Camera, Sparkles, Wand2 } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { STYLE_THUMBS, type Style } from '@/blocks/design-studio';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

/** Spoke keys — rooms preselect the studio, tools leave it untouched. */
export type RoomLandingKey =
  | 'bathroom'
  | 'bedroom'
  | 'living'
  | 'kitchen'
  | 'dining'
  | 'office'
  | 'basement'
  | 'attic'
  | 'study'
  | 'kids'
  | 'planner'
  | 'makeover';

type RoomLanding = {
  /** ?room= value handed to the studio (room keys only). */
  studioRoom?: string;
  /** Hero image + intrinsic size + style name for the alt text. */
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageStyle: Style;
  /** Three styles showcased under "styles that suit a {room}". */
  featuredStyles: Style[];
};

const AVIF = { imageWidth: 1376, imageHeight: 768 };
const GEN = { imageWidth: 886, imageHeight: 665 };
const STYLE_PNG = { imageWidth: 800, imageHeight: 600 };

export const ROOM_LANDINGS: Record<RoomLandingKey, RoomLanding> = {
  bathroom: {
    studioRoom: 'bathroom',
    image: '/imgs/generated/work-bathroom-modern.png',
    ...GEN,
    imageStyle: 'modern',
    featuredStyles: ['modern', 'minimalist', 'scandinavian'],
  },
  bedroom: {
    studioRoom: 'bedroom',
    image: '/imgs/demo/bedroom-scandinavian.avif',
    ...AVIF,
    imageStyle: 'scandinavian',
    featuredStyles: ['scandinavian', 'midcentury', 'minimalist'],
  },
  living: {
    studioRoom: 'living',
    image: '/imgs/demo/livingRoom-modern.avif',
    ...AVIF,
    imageStyle: 'modern',
    featuredStyles: ['modern', 'scandinavian', 'bohemian'],
  },
  kitchen: {
    studioRoom: 'kitchen',
    image: '/imgs/generated/work-kitchen-scandinavian.png',
    ...GEN,
    imageStyle: 'scandinavian',
    featuredStyles: ['scandinavian', 'minimalist', 'industrial'],
  },
  dining: {
    studioRoom: 'dining',
    image: '/imgs/demo/diningRoom-minimalist.avif',
    ...AVIF,
    imageStyle: 'minimalist',
    featuredStyles: ['midcentury', 'minimalist', 'modern'],
  },
  office: {
    studioRoom: 'office',
    image: '/imgs/generated/work-office-japandi.png',
    ...GEN,
    imageStyle: 'japandi',
    featuredStyles: ['japandi', 'minimalist', 'industrial'],
  },
  basement: {
    studioRoom: 'basement',
    image: '/imgs/generated/style-industrial.png',
    ...STYLE_PNG,
    imageStyle: 'industrial',
    featuredStyles: ['industrial', 'modern', 'scandinavian'],
  },
  attic: {
    studioRoom: 'attic',
    image: '/imgs/demo/bedroom-minimalist.avif',
    ...AVIF,
    imageStyle: 'minimalist',
    featuredStyles: ['scandinavian', 'japandi', 'minimalist'],
  },
  study: {
    studioRoom: 'study',
    image: '/imgs/generated/style-midcentury.png',
    ...STYLE_PNG,
    imageStyle: 'midcentury',
    featuredStyles: ['midcentury', 'japandi', 'minimalist'],
  },
  kids: {
    studioRoom: 'kids',
    image: '/imgs/generated/style-bohemian.png',
    ...STYLE_PNG,
    imageStyle: 'bohemian',
    featuredStyles: ['scandinavian', 'bohemian', 'modern'],
  },
  planner: {
    image: '/imgs/demo/livingRoom-minimalist.avif',
    ...AVIF,
    imageStyle: 'minimalist',
    featuredStyles: ['modern', 'minimalist', 'scandinavian'],
  },
  makeover: {
    image: '/imgs/demo/livingRoom-scandinavian.avif',
    ...AVIF,
    imageStyle: 'scandinavian',
    featuredStyles: ['modern', 'bohemian', 'midcentury'],
  },
} as const;

/** Display name substituted into the shared {room} params. */
function roomLabel(key: RoomLandingKey): string {
  if (key === 'planner' || key === 'makeover') {
    return m['roompage.generic_room']();
  }
  return m[`create.room.${key}` as 'create.room.living']().toLowerCase();
}

/**
 * Spoke "kind" — rooms share the design wording, while planner/makeover get
 * their own verbs so the makeover page reads like a makeover page.
 */
type SpokeKind = 'rooms' | 'planner' | 'makeover';

function spokeKind(key: RoomLandingKey): SpokeKind {
  if (key === 'planner') return 'planner';
  if (key === 'makeover') return 'makeover';
  return 'rooms';
}

/**
 * The shared heading templates take verb phrases as params, and the values
 * themselves come from message keys — so "How to organize a room with AI"
 * localizes correctly instead of hardcoding English into the factory.
 */
function spokeParams(key: RoomLandingKey, room: string) {
  const kind = spokeKind(key);
  // English articles: "an attic", never "a attic". The zh templates don't
  // reference {article}, so the value there is simply unused.
  const article = /^[aeiou]/i.test(room) ? 'an' : 'a';
  const verbPhrase = m[
    `roompage.steps.verb.${kind}` as 'roompage.steps.verb.rooms'
  ]({ article, room });
  const changeVerb =
    m[`roompage.changes.verb.${kind}` as 'roompage.changes.verb.rooms']();
  // "in your bathroom" for rooms, "in a makeover" for the makeover spoke.
  const changeWhere =
    kind === 'rooms'
      ? m['roompage.changes.where.rooms']({ room })
      : m[
          `roompage.changes.where.${kind}` as 'roompage.changes.where.makeover'
        ]();
  const styleSubject =
    kind === 'rooms'
      ? m['roompage.styles.subject.rooms']({ article, room })
      : m[
          `roompage.styles.subject.${kind}` as 'roompage.styles.subject.makeover'
        ]();
  const tipsFor =
    kind === 'rooms'
      ? m['roompage.tips.for.rooms']({ room })
      : m[`roompage.tips.for.${kind}` as 'roompage.tips.for.makeover']();
  const ctaVerb = m[`roompage.cta.verb.${kind}` as 'roompage.cta.verb.rooms']();
  const buttonVerb =
    m[`roompage.button.verb.${kind}` as 'roompage.button.verb.rooms']();
  return {
    article,
    room,
    verbPhrase,
    changeVerb,
    changeWhere,
    styleSubject,
    tipsFor,
    ctaVerb,
    buttonVerb,
  };
}

const STEPS = [
  {
    icon: Camera,
    title: m['roompage.step1.title'],
    desc: m['roompage.step1.desc'],
  },
  {
    icon: Wand2,
    title: m['roompage.step2.title'],
    desc: m['roompage.step2.desc'],
  },
  {
    icon: Sparkles,
    title: m['roompage.step3.title'],
    desc: m['roompage.step3.desc'],
  },
] as const;

const TIPS = [1, 2, 3] as const;

/** Room spokes in a fixed order — drives the related-links rotation. */
const ROOM_SPOKES: RoomLandingKey[] = [
  'living',
  'bedroom',
  'kitchen',
  'bathroom',
  'dining',
  'office',
  'basement',
  'attic',
  'study',
  'kids',
];

/** Rotating phrasings of the "what changes" paragraph (anti-duplicate copy). */
const CHANGE_DESCS = [
  m['roompage.changes.desc.a'],
  m['roompage.changes.desc.b'],
  m['roompage.changes.desc.c'],
] as const;

/** Sibling spokes to link at the bottom — 4 rooms, never the page itself. */
function relatedRoomsFor(key: RoomLandingKey): RoomLandingKey[] {
  const idx = ROOM_SPOKES.indexOf(key);
  const start = idx >= 0 ? idx + 1 : 0;
  return Array.from(
    { length: 4 },
    (_, i) => ROOM_SPOKES[(start + i) % ROOM_SPOKES.length]
  ).filter((k) => k !== key);
}

function RoomLandingPage({ roomKey }: { roomKey: RoomLandingKey }) {
  const config = ROOM_LANDINGS[roomKey];
  const room = roomLabel(roomKey);
  const p = spokeParams(roomKey, room);
  const relatedRooms = relatedRoomsFor(roomKey);
  const changeDesc = CHANGE_DESCS[
    Object.keys(ROOM_LANDINGS).indexOf(roomKey) % CHANGE_DESCS.length
  ]({ room });
  const studioHref = config.studioRoom
    ? `/room-design?room=${config.studioRoom}`
    : '/room-design';

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-background px-4 pt-16 pb-12 sm:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
                {m[`roompage.${roomKey}.title` as 'roompage.bathroom.title']()}
              </h1>
              <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
                {m[`roompage.${roomKey}.intro` as 'roompage.bathroom.intro']()}
              </p>
              <Link
                href={studioHref}
                className="bg-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
              >
                {m['roompage.cta.button']({ button_verb: p.buttonVerb, room })}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-[28px] shadow-xl">
              <img
                src={config.image}
                alt={m['roompage.alt']({
                  room,
                  style:
                    m[
                      `create.style.${config.imageStyle}` as 'create.style.modern'
                    ](),
                })}
                width={config.imageWidth}
                height={config.imageHeight}
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['roompage.steps.title']({ verb_phrase: p.verbPhrase })}
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.title({ room })}>
                  <span className="bg-primary/10 flex size-11 items-center justify-center rounded-2xl">
                    <step.icon className="text-primary size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    {step.title({ room })}
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {step.desc({ room })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles */}
        <section className="bg-background px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['roompage.styles.title']({ style_subject: p.styleSubject })}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {config.featuredStyles.map((s) => (
                <article
                  key={s}
                  className="overflow-hidden rounded-2xl bg-[#f5f5f7]"
                >
                  <img
                    src={STYLE_THUMBS[s]}
                    alt={m[`create.style.${s}` as 'create.style.modern']()}
                    width={STYLE_THUMBS[s].endsWith('.avif') ? 1376 : 800}
                    height={STYLE_THUMBS[s].endsWith('.avif') ? 768 : 600}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-base font-semibold tracking-tight">
                      {m[`create.style.${s}` as 'create.style.modern']()}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                      {m[`landing.styles.${s}` as 'landing.styles.modern']()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* What changes */}
        <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['roompage.changes.title']({
                change_verb: p.changeVerb,
                change_where: p.changeWhere,
              })}
            </h2>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              {changeDesc}
            </p>
          </div>
        </section>

        {/* Photo tips */}
        <section className="bg-background px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['roompage.tips.title']({ tips_for: p.tipsFor })}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {TIPS.map((n) => (
                <li
                  key={n}
                  className="rounded-2xl border border-neutral-200 p-6 leading-relaxed"
                >
                  <span className="text-primary text-sm font-semibold">
                    0{n}
                  </span>
                  <p className="mt-2">
                    {m[
                      `roompage.${roomKey}.tip${n}` as 'roompage.bathroom.tip1'
                    ]()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* In-depth guide — unique per room; the anti-thin-content section */}
        <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m[
                `roompage.${roomKey}.guide.title` as 'roompage.living.guide.title'
              ]()}
            </h2>
            {m[
              `roompage.${roomKey}.guide.body` as 'roompage.living.guide.body'
            ]()
              .split('\n\n')
              .map((paragraph, i) => (
                <p
                  key={i}
                  className="text-muted-foreground mt-5 text-lg leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </section>

        {/* Related rooms — sibling links so authority flows between spokes */}
        <section className="bg-background px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {m['roompage.related.title']()}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedRooms.map((key) => (
                <article
                  key={key}
                  className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 transition-colors hover:border-[#0071e3]"
                >
                  <Link
                    href={ROOM_PATHS[key]}
                    className="group block text-base font-semibold tracking-tight hover:text-[#0071e3]"
                  >
                    {m[`roompage.${key}.title` as 'roompage.bathroom.title']()}
                  </Link>
                  <span className="text-muted-foreground mt-1.5 line-clamp-2 block text-sm leading-relaxed">
                    {m[`roompage.${key}.intro` as 'roompage.bathroom.intro']()}
                  </span>
                </article>
              ))}
            </div>
            <p className="text-muted-foreground mt-8 text-sm">
              {m['roompage.related.home_before']()}{' '}
              <Link
                href="/"
                className="text-primary font-medium hover:underline"
              >
                {m['roompage.related.home_anchor']()}
              </Link>
              {m['roompage.related.home_after']()}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background px-4 py-20 text-center sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {m['roompage.cta.title']({ cta_verb: p.ctaVerb, room })}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {m['roompage.cta.desc']()}
            </p>
            <Link
              href={studioHref}
              className="bg-primary mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
            >
              {m['roompage.cta.button']({ button_verb: p.buttonVerb, room })}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Shared route options for the room landing pages. Each page gets its own
 * explicit route file so static segments always outrank dynamic ones —
 * add a new spoke by creating a thin route file using this factory.
 */
export function roomLandingRouteOptions(key: RoomLandingKey) {
  return {
    loader: () => ({ locale: getLocale() }),
    head: ({ loaderData }: { loaderData?: { locale: string } }) => {
      const locale = loaderData?.locale ?? 'en';
      const L = locale as any;
      const path = ROOM_PATHS[key];
      const urlFor = (loc: string) =>
        localizeUrl(`${envConfigs.app_url}${path}`, { locale: loc as any })
          .href;
      const title = m[
        `roompage.${key}.meta_title` as 'roompage.bathroom.meta_title'
      ]({}, { locale: L });
      const description = m[
        `roompage.${key}.meta_description` as 'roompage.bathroom.meta_description'
      ]({}, { locale: L });
      return {
        meta: [
          { title },
          { name: 'description', content: description },
          { name: 'robots', content: 'index,follow' },
          ...socialMeta({ title, description, url: urlFor(locale), locale }),
        ],
        links: [
          { rel: 'canonical', href: urlFor(locale) },
          ...locales.map((loc) => ({
            rel: 'alternate',
            hrefLang: loc,
            href: urlFor(loc),
          })),
          { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
        ],
        scripts: [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: localizeUrl(`${envConfigs.app_url}/`, { locale: L })
                    .href,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: m[`roompage.${key}.title` as 'roompage.bathroom.title'](
                    {},
                    { locale: L }
                  ),
                  item: urlFor(locale),
                },
              ],
            }),
          },
        ],
      };
    },
    component: () => <RoomLandingPage roomKey={key} />,
  };
}

/** URL path per spoke — kept next to the factory that serves them. */
export const ROOM_PATHS: Record<RoomLandingKey, string> = {
  bathroom: '/ai-bathroom-design',
  bedroom: '/ai-bedroom-design',
  living: '/ai-living-room-design',
  kitchen: '/ai-kitchen-design',
  dining: '/ai-dining-room-design',
  office: '/ai-home-office-design',
  basement: '/ai-basement-design',
  attic: '/ai-attic-design',
  study: '/ai-study-room-design',
  kids: '/ai-kids-room-design',
  planner: '/ai-room-planner',
  makeover: '/ai-room-makeover',
};
