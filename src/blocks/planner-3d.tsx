import { useState } from 'react';
import {
  ArrowRight,
  Camera,
  Check,
  Layers,
  Lightbulb,
  Ruler,
  Sparkles,
  Wand2,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { STYLE_THUMBS, type Style } from '@/blocks/design-studio';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** FAQ keys — also drives the FAQPage JSON-LD on the route. */
export const PLANNER3D_FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'] as const;

/** Rooms offered in the mini planner (all have a demo image or style thumb). */
const GEN_ROOMS = [
  'living',
  'bedroom',
  'kitchen',
  'bathroom',
  'dining',
  'office',
] as const;
type GenRoom = (typeof GEN_ROOMS)[number];

const GEN_STYLES = Object.keys(STYLE_THUMBS) as Style[];

/** Exact room+style demo images that exist in the repo; other combos fall
 * back to STYLE_THUMBS (style preview on a living-room base). */
const ROOM_STYLE_IMG: Record<GenRoom, Partial<Record<Style, string>>> = {
  living: {
    modern: '/imgs/demo/livingRoom-modern.avif',
    minimalist: '/imgs/demo/livingRoom-minimalist.avif',
    scandinavian: '/imgs/demo/livingRoom-scandinavian.avif',
  },
  bedroom: {
    modern: '/imgs/demo/bedroom-modern.avif',
    minimalist: '/imgs/demo/bedroom-minimalist.avif',
    scandinavian: '/imgs/demo/bedroom-scandinavian.avif',
  },
  dining: {
    modern: '/imgs/demo/diningRoom-modern.avif',
    minimalist: '/imgs/demo/diningRoom-minimalist.avif',
    scandinavian: '/imgs/demo/diningRoom-scandinavian.avif',
  },
  kitchen: { scandinavian: '/imgs/generated/work-kitchen-scandinavian.png' },
  bathroom: { modern: '/imgs/generated/work-bathroom-modern.png' },
  office: { japandi: '/imgs/generated/work-office-japandi.png' },
};

function previewImage(room: GenRoom, style: Style): string {
  return ROOM_STYLE_IMG[room][style] ?? STYLE_THUMBS[style];
}

const HERO_IMG = {
  src: '/imgs/generated/planner3d-hero-1793598171620.png',
  width: 917,
  height: 642,
};

const DEMO_AVIF = { width: 1376, height: 768 };

const COMPARE_ROWS = [1, 2, 3, 4, 5, 6] as const;

const STEPS = [
  {
    icon: Camera,
    title: m['planner3d.step1.title'],
    desc: m['planner3d.step1.desc'],
  },
  {
    icon: Wand2,
    title: m['planner3d.step2.title'],
    desc: m['planner3d.step2.desc'],
  },
  {
    icon: Sparkles,
    title: m['planner3d.step3.title'],
    desc: m['planner3d.step3.desc'],
  },
] as const;

const TIPS = [
  {
    icon: Layers,
    title: m['planner3d.tip1.title'],
    desc: m['planner3d.tip1.desc'],
  },
  {
    icon: Lightbulb,
    title: m['planner3d.tip2.title'],
    desc: m['planner3d.tip2.desc'],
  },
  {
    icon: Ruler,
    title: m['planner3d.tip3.title'],
    desc: m['planner3d.tip3.desc'],
  },
] as const;

/** Styles featured under "styles that plan out beautifully". */
const FEATURED_STYLES: Style[] = ['japandi', 'industrial', 'midcentury'];

/** Sibling spokes for the related-links section (titles from their pages). */
const RELATED = [
  {
    href: '/ai-room-planner',
    title: m['roompage.planner.title'],
    intro: m['roompage.planner.intro'],
  },
  {
    href: '/ai-room-design-free',
    title: m['free.hero.title'],
    intro: m['free.hero.subtitle'],
  },
  {
    href: '/ai-room-makeover',
    title: m['roompage.makeover.title'],
    intro: m['roompage.makeover.intro'],
  },
  {
    href: '/ai-living-room-design',
    title: m['roompage.living.title'],
    intro: m['roompage.living.intro'],
  },
] as const;

function chipClass(active: boolean): string {
  return [
    'cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors',
    active
      ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
      : 'border-neutral-200 bg-background text-foreground hover:border-[#0071e3]/50',
  ].join(' ');
}

/**
 * Mini 3D-room-planner generator: pick a room + a style, get a preview and a
 * planning note, then deep-link into the studio with both preselected.
 */
function PlannerGenerator() {
  const [room, setRoom] = useState<GenRoom>('living');
  const [style, setStyle] = useState<Style>('modern');
  const preview = previewImage(room, style);
  const studioHref = `/room-design?room=${room}&style=${style}`;
  const previewAlt = m['roompage.alt']({
    room: m[`create.room.${room}` as 'create.room.living']().toLowerCase(),
    style: m[`create.style.${style}` as 'create.style.modern'](),
  });

  return (
    <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {m['planner3d.gen.title']()}
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed">
          {m['planner3d.gen.desc']()}
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* Controls */}
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
                {m['planner3d.gen.room_label']()}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {GEN_ROOMS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={room === r}
                    onClick={() => setRoom(r)}
                    className={chipClass(room === r)}
                  >
                    {m[`create.room.${r}` as 'create.room.living']()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
                {m['planner3d.gen.style_label']()}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {GEN_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={style === s}
                    onClick={() => setStyle(s)}
                    className={chipClass(style === s)}
                  >
                    {m[`create.style.${s}` as 'create.style.modern']()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {m['planner3d.gen.footnote']()}
            </p>
          </div>

          {/* Preview card */}
          <div className="bg-background overflow-hidden rounded-3xl shadow-lg">
            <div className="relative">
              <img
                src={preview}
                alt={previewAlt}
                width={preview.endsWith('.avif') ? DEMO_AVIF.width : 800}
                height={preview.endsWith('.avif') ? DEMO_AVIF.height : 600}
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                {m[`create.room.${room}` as 'create.room.living']()} ·{' '}
                {m[`create.style.${style}` as 'create.style.modern']()}
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-base font-semibold tracking-tight">
                {m['planner3d.gen.preview_label']()}
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                <li className="flex gap-2.5">
                  <Ruler className="text-primary mt-0.5 size-4 shrink-0" />
                  <span>
                    {m[
                      `planner3d.gen.roomnote.${room}` as 'planner3d.gen.roomnote.living'
                    ]()}
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Sparkles className="text-primary mt-0.5 size-4 shrink-0" />
                  <span>
                    {m[`landing.styles.${style}` as 'landing.styles.modern']()}
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Check className="text-primary mt-0.5 size-4 shrink-0" />
                  <span>{m['planner3d.gen.note_keep']()}</span>
                </li>
              </ul>
              <Link
                href={studioHref}
                className="bg-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-medium text-white shadow transition-all hover:bg-[#0077ed]"
              >
                {m['planner3d.gen.cta']()}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Landing page for the "3d room planner ai" intent — content + mini planner. */
export function Planner3D() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-background px-4 pt-16 pb-12 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
              {m['planner3d.hero.title']()}
            </h1>
            <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
              {m['planner3d.hero.subtitle']()}
            </p>
            <Link
              href="/room-design"
              className="bg-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
            >
              {m['planner3d.hero.cta']()}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[28px] shadow-xl">
            <img
              src={HERO_IMG.src}
              alt={m['planner3d.alt.hero']()}
              width={HERO_IMG.width}
              height={HERO_IMG.height}
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
            {/* Overlay copy — the image slot carries visible text even
                before the image paints. */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 pt-14 pb-6 text-white">
              <p className="text-xl leading-snug font-semibold tracking-tight sm:text-2xl">
                {m['planner3d.hero.overlay.title']()}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    'planner3d.hero.overlay.chip1',
                    'planner3d.hero.overlay.chip2',
                    'planner3d.hero.overlay.chip3',
                  ] as const
                ).map((key) => (
                  <li
                    key={key}
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                  >
                    {m[key]()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mini planner */}
      <PlannerGenerator />

      {/* Guide */}
      <section className="bg-background px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.guide.title']()}
          </h2>
          <figure className="mt-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src="/imgs/demo/before-empty.avif"
                alt={m['landing.gallery.before']()}
                width={DEMO_AVIF.width}
                height={DEMO_AVIF.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <img
                src="/imgs/demo/livingRoom-modern.avif"
                alt={m['landing.gallery.after']()}
                width={DEMO_AVIF.width}
                height={DEMO_AVIF.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
            </div>
            <figcaption className="text-muted-foreground mt-3 flex justify-between text-sm">
              <span>{m['landing.gallery.before']()}</span>
              <span>{m['landing.gallery.after']()}</span>
            </figcaption>
          </figure>
          {m['planner3d.guide.body']()
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

      {/* Comparison */}
      <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.compare.title']()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            {m['planner3d.compare.intro']()}
          </p>
          <div className="bg-background mt-10 overflow-x-auto rounded-2xl shadow-sm">
            <table className="w-full border-collapse text-left text-base">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th scope="col" className="p-4 font-semibold sm:p-5">
                    {m['planner3d.compare.row_header']()}
                  </th>
                  <th className="p-4 font-semibold sm:p-5">
                    {m['planner3d.compare.col1']()}
                  </th>
                  <th className="p-4 font-semibold sm:p-5">
                    {m['planner3d.compare.col2']()}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((n) => (
                  <tr
                    key={n}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <th
                      scope="row"
                      className="text-muted-foreground p-4 text-sm font-medium sm:p-5"
                    >
                      {m[`planner3d.compare.r${n}` as 'planner3d.compare.r1']()}
                    </th>
                    <td className="p-4 sm:p-5">
                      {m[
                        `planner3d.compare.r${n}c1` as 'planner3d.compare.r1c1'
                      ]()}
                    </td>
                    <td className="p-4 sm:p-5">
                      {m[
                        `planner3d.compare.r${n}c2` as 'planner3d.compare.r1c2'
                      ]()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-background px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.steps.title']()}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title()}>
                <span className="bg-primary/10 flex size-11 items-center justify-center rounded-2xl">
                  <step.icon className="text-primary size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {step.title()}
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {step.desc()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo tips */}
      <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.tips.title']()}
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {TIPS.map((tip) => (
              <li
                key={tip.title()}
                className="bg-background rounded-2xl p-6 leading-relaxed shadow-sm"
              >
                <span className="bg-primary/10 flex size-11 items-center justify-center rounded-2xl">
                  <tip.icon className="text-primary size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {tip.title()}
                </h3>
                <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                  {tip.desc()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Styles */}
      <section className="bg-background px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.styles.title']()}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {FEATURED_STYLES.map((s) => (
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

      {/* FAQ */}
      <section className="bg-[#f5f5f7] px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.faq.title']()}
          </h2>
          <Accordion className="w-full">
            {PLANNER3D_FAQ_KEYS.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="cursor-pointer py-6 text-left text-lg font-medium hover:no-underline">
                  {m[`planner3d.faq.${key}` as 'planner3d.faq.q1']()}
                </AccordionTrigger>
                {/* keepMounted: answer stays in the served HTML so it
                    matches the FAQPage JSON-LD verbatim. */}
                <AccordionContent
                  keepMounted
                  className="text-muted-foreground pb-6 text-base leading-relaxed"
                >
                  {m[`planner3d.faq.a${key.slice(1)}` as 'planner3d.faq.a1']()}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related spokes */}
      <section className="bg-background px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {m['roompage.related.title']()}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RELATED.map(({ href, title, intro }) => (
              <article
                key={href}
                className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 transition-colors hover:border-[#0071e3]"
              >
                <Link
                  href={href}
                  className="group block text-base font-semibold tracking-tight hover:text-[#0071e3]"
                >
                  {title()}
                </Link>
                <span className="text-muted-foreground mt-1.5 line-clamp-2 block text-sm leading-relaxed">
                  {intro()}
                </span>
              </article>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 text-sm">
            {m['roompage.related.home_before']()}{' '}
            <Link href="/" className="text-primary font-medium hover:underline">
              {m['roompage.related.home_anchor']()}
            </Link>
            {m['roompage.related.home_after']()}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background px-4 pt-4 pb-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {m['planner3d.cta.title']()}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {m['planner3d.cta.desc']()}
          </p>
          <Link
            href="/room-design"
            className="bg-primary mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#0077ed]"
          >
            {m['planner3d.cta.button']()}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
