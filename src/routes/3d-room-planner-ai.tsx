import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Planner3D, PLANNER3D_FAQ_KEYS } from '@/blocks/planner-3d';

const PATH = '/3d-room-planner-ai';

function seoSchema(locale: string, pageUrl: string) {
  const L = locale as any;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `${envConfigs.app_name} — 3D Room Planner AI`,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        url: pageUrl,
        description: m['planner3d.metadata.description']({}, { locale: L }),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: PLANNER3D_FAQ_KEYS.map((key) => ({
          '@type': 'Question',
          name: m[`planner3d.faq.${key}` as 'planner3d.faq.q1'](
            {},
            { locale: L }
          ),
          acceptedAnswer: {
            '@type': 'Answer',
            text: m[`planner3d.faq.a${key.slice(1)}` as 'planner3d.faq.a1'](
              {},
              { locale: L }
            ),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: localizeUrl(`${envConfigs.app_url}/`, { locale: L }).href,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: m['planner3d.hero.title']({}, { locale: L }),
            item: pageUrl,
          },
        ],
      },
    ],
  };
}

export const Route = createFileRoute('/3d-room-planner-ai')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const L = locale as any;
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}${PATH}`, { locale: loc as any }).href;
    const title = m['planner3d.metadata.title']({}, { locale: L });
    const description = m['planner3d.metadata.description']({}, { locale: L });
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
          children: JSON.stringify(seoSchema(locale, urlFor(locale))),
        },
      ],
    };
  },
  component: function Planner3DPage() {
    return (
      <div className="bg-background text-foreground flex min-h-screen flex-col">
        <Header />
        <Planner3D />
        <Footer />
      </div>
    );
  },
});
