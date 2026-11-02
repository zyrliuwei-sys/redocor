import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { CreateHero, DesignStudio, DesignTips } from '@/blocks/design-studio';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { RoomDesignLinks } from '@/blocks/room-design-links';
import { Showcase } from '@/blocks/showcase';
import { SupportWidget } from '@/blocks/support-widget';

function RoomDesignPage() {
  const { room, style } = Route.useSearch();
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main>
        <CreateHero />
        <DesignStudio initialRoom={room} initialStyle={style} />
        <Showcase />
        <DesignTips />
        <RoomDesignLinks />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

export const Route = createFileRoute('/room-design')({
  // /room-design?room=bathroom&style=japandi — spoke pages and the 3D planner
  // generator preload the room and style pickers.
  validateSearch: (search: Record<string, unknown>) => ({
    room: typeof search.room === 'string' ? search.room : undefined,
    style: typeof search.style === 'string' ? search.style : undefined,
  }),
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/room-design`, {
        locale: loc as any,
      }).href;
    const title = m['create.metadata.title']({}, { locale: locale as any });
    const description = m['create.metadata.description'](
      {},
      { locale: locale as any }
    );
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
    };
  },
  component: RoomDesignPage,
});
