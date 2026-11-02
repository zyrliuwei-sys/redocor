'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Apple-style global nav — dark frosted bar, compact links, pill CTA.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const navLinks = [
    { href: '/room-design', label: m['landing.nav.create']() },
    { href: '/3d-room-planner-ai', label: m['landing.nav.planner3d']() },
    { href: '/#how', label: m['landing.nav.how']() },
    { href: '/#gallery', label: m['landing.nav.gallery']() },
    { href: '/pricing', label: m['landing.nav.pricing']() },
    { href: '/#faq', label: m['landing.nav.faq']() },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-600/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src={envConfigs.app_logo}
            alt={envConfigs.app_name}
            width={24}
            height={24}
            className="size-6 rounded-md"
          />
          <span className="text-sm font-semibold tracking-tight text-white">
            {envConfigs.app_name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-neutral-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* <LocaleSelector className="text-neutral-300 hover:text-white" /> */}
          <ThemeToggle className="text-neutral-300 hover:text-white" />
          {user ? (
            <SiteUserMenu
              name={user.name || 'User'}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-[#0071e3] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0077ed]"
            >
              {m['common.nav.sign_in']()}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="p-2 text-neutral-200 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-4 pt-2 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
            {/* <LocaleSelector className="text-neutral-300 hover:text-white" /> */}
            <ThemeToggle className="text-neutral-300 hover:text-white" />
            <div className="flex-1" />
            {user ? (
              <SiteUserMenu
                name={user.name || 'User'}
                email={user.email}
                image={user.image}
              />
            ) : (
              <Link
                href="/sign-in"
                className="rounded-full bg-[#0071e3] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#0077ed]"
                onClick={() => setMobileOpen(false)}
              >
                {m['common.nav.sign_in']()}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
