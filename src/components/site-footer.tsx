import type { ComponentType, CSSProperties, SVGProps } from 'react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { FooterBadgeList } from '@/components/footer-badge-list';

export interface FooterColumn {
  title: string;
  /** external: open in a new tab. Off-site (http) hrefs always open in a new tab. */
  links: { label: string; href: string; external?: boolean }[];
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export interface FooterSocial {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  label: string;
}

export function SiteFooter({
  columns,
  socials,
  copyright,
}: {
  columns?: FooterColumn[];
  socials?: FooterSocial[];
  copyright?: string;
}) {
  const year = new Date().getFullYear();
  const pages = columns?.flatMap((column) => column.links) ?? [];

  return (
    <footer className="relative w-full overflow-hidden border-t border-neutral-700 bg-neutral-800 px-4 py-14 text-neutral-100 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl text-sm text-neutral-400">
        <div className="flex w-full flex-col items-center justify-center">
          <Link
            href="/"
            aria-label={envConfigs.app_name}
            className="relative z-20 flex items-center gap-3 px-2 py-1 text-sm font-normal"
          >
            <img
              src={envConfigs.app_logo}
              alt=""
              width={30}
              height={30}
              className="size-[30px] rounded-md"
            />
            <span className="font-medium text-white">
              {envConfigs.app_name}
            </span>
          </Link>

          {pages.length > 0 && (
            <nav
              aria-label="Footer navigation"
              className="mt-6 flex list-none flex-wrap justify-center gap-x-6 gap-y-3 text-neutral-400"
            >
              {pages.map((link, index) => (
                <span key={`${link.href}-${link.label}-${index}`}>
                  {isExternalHref(link.href) ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}

          <GridLineHorizontal className="mx-auto mt-8 max-w-7xl" />
        </div>

        <div className="mt-8 flex w-full flex-col items-end justify-between gap-6 sm:flex-row">
          <span className="text-right text-sm text-neutral-400">
            {copyright ||
              `© ${year} ${envConfigs.app_name}. All rights reserved.`}
          </span>
          {socials && socials.length > 0 && (
            <div className="flex items-center gap-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 transition-colors hover:text-white"
                >
                  <social.icon className="size-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <FooterBadgeList className="mt-6" />
      </div>
    </footer>
  );
}

function GridLineHorizontal({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) {
  return (
    <div
      style={
        {
          '--background': '#262626',
          '--color': 'rgba(255, 255, 255, 0.18)',
          '--height': '1px',
          '--width': '5px',
          '--fade-stop': '90%',
          '--offset': offset || '200px',
        } as CSSProperties
      }
      className={cn(
        'z-30 h-[var(--height)] w-[calc(100%+var(--offset))]',
        'bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]',
        '[background-size:var(--width)_var(--height)]',
        '[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]',
        '[mask-composite:exclude]',
        className
      )}
    />
  );
}
