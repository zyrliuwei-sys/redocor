import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Camera,
  Check,
  Download,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sofa,
  Sparkles,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

const ROOM_TYPES = [
  'living',
  'bedroom',
  'kitchen',
  'bathroom',
  'dining',
  'office',
  'kids',
  'study',
  'basement',
  'attic',
] as const;

const STYLES = [
  'modern',
  'minimalist',
  'scandinavian',
  'japandi',
  'industrial',
  'bohemian',
  'coastal',
  'midcentury',
] as const;

type RoomType = (typeof ROOM_TYPES)[number];
export type Style = (typeof STYLES)[number];

/** Thumbnail shown on each style card in the picker (and the style guide). */
export const STYLE_THUMBS: Record<Style, string> = {
  modern: '/imgs/demo/livingRoom-modern.avif',
  minimalist: '/imgs/demo/livingRoom-minimalist.avif',
  scandinavian: '/imgs/demo/livingRoom-scandinavian.avif',
  japandi: '/imgs/generated/work-office-japandi.png',
  industrial: '/imgs/generated/style-industrial.png',
  bohemian: '/imgs/generated/style-bohemian.png',
  coastal: '/imgs/generated/style-coastal.png',
  midcentury: '/imgs/generated/style-midcentury.png',
};

interface DesignResult {
  imageUrl: string;
  demo: boolean;
  provider: string;
  /** Anonymous free-tier result — watermarked preview, no download. */
  free?: boolean;
  id?: string;
  roomType?: RoomType;
  style?: Style;
  instructions?: string;
  createdAt?: string;
}

/** Keep image results renderable when a provider returns a bare CDN domain. */
function normalizeImageUrl(url: string): string {
  const value = url.trim();
  if (/^(?:https?:|data:|blob:|\/)/i.test(value)) return value;
  return `https://${value}`;
}

const MAX_DIMENSION = 1536;

/** Downscale + re-encode an image source to a compact JPEG data URL. */
async function processImage(source: Blob | string): Promise<string> {
  const objectUrl =
    typeof source === 'string' ? source : URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode failed'));
      el.src = objectUrl;
    });

    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(objectUrl);
  }
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        selected
          ? 'border-transparent bg-[#0071e3] text-white'
          : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Room design studio — upload a photo, pick room type + style, generate.
 * Apple-style layout: image canvas on the left, controls on the right.
 *
 * `initialRoom` preselects a room type (used by `?room=` links from the room
 * landing pages) and scrolls the studio into view. `initialStyle` preselects
 * a style (used by `?style=` links, e.g. the 3D planner generator).
 */
export function DesignStudio({
  initialRoom,
  initialStyle,
}: {
  initialRoom?: string;
  initialStyle?: string;
}) {
  const { data: session } = useSession();
  const [imageData, setImageData] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType>(
    (ROOM_TYPES as readonly string[]).includes(initialRoom ?? '')
      ? (initialRoom as RoomType)
      : 'living'
  );
  const [style, setStyle] = useState<Style>(
    (STYLES as readonly string[]).includes(initialStyle ?? '')
      ? (initialStyle as Style)
      : 'modern'
  );
  const [instructions, setInstructions] = useState('');
  const [view, setView] = useState<'result' | 'original'>('result');
  const [history, setHistory] = useState<DesignResult[]>([]);
  const [active, setActive] = useState<DesignResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep link (?room=bathroom) or a showcase tap — land on the studio preloaded.
  useEffect(() => {
    if (
      initialRoom &&
      (ROOM_TYPES as readonly string[]).includes(initialRoom)
    ) {
      setRoomType(initialRoom as RoomType);
    }
  }, [initialRoom]);

  // Deep link ?style=japandi — preselects the style picker.
  useEffect(() => {
    if (initialStyle && (STYLES as readonly string[]).includes(initialStyle)) {
      setStyle(initialStyle as Style);
    }
  }, [initialStyle]);

  // A showcase work was tapped — load its room + style and scroll into view.
  useEffect(() => {
    const onApply = (e: Event) => {
      const detail = (e as CustomEvent<{ room?: RoomType; style?: Style }>)
        .detail;
      if (detail?.room) setRoomType(detail.room);
      if (detail?.style) setStyle(detail.style);
      document
        .getElementById('design-studio')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast.success(m['create.showcase.applied']());
    };
    window.addEventListener('design:apply-look', onApply);
    return () => window.removeEventListener('design:apply-look', onApply);
  }, []);

  const statusQuery = useQuery({
    queryKey: ['design-status', session?.user?.id],
    queryFn: () =>
      apiGet<{
        aiConfigured: boolean;
        requiresAuth?: boolean;
        freeDesignAvailable?: boolean;
      }>('/api/design'),
  });
  const aiConfigured = statusQuery.data?.aiConfigured ?? true;
  const requiresAuth = statusQuery.data?.requiresAuth ?? false;
  const freeDesignAvailable = statusQuery.data?.freeDesignAvailable ?? false;

  const historyQuery = useQuery({
    queryKey: ['design-history', session?.user?.id],
    queryFn: () => apiGet<DesignResult[]>('/api/design-history'),
    enabled: Boolean(session?.user),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (historyQuery.data) {
      setHistory(
        historyQuery.data.map((item) => ({
          ...item,
          imageUrl: normalizeImageUrl(item.imageUrl),
        }))
      );
    }
  }, [historyQuery.data]);

  const acceptBlob = useCallback(async (blob: Blob) => {
    try {
      const dataUrl = await processImage(blob);
      setImageData(dataUrl);
      setView('result');
    } catch {
      toast.error(m['create.studio.error_image']());
    }
  }, []);

  const acceptImageUrl = useCallback(async (url: string) => {
    try {
      const dataUrl = await processImage(url);
      setImageData(dataUrl);
      setView('result');
    } catch {
      toast.error(m['create.studio.error_image']());
    }
  }, []);

  const onFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) acceptBlob(file);
  };

  const useSample = async () => {
    await acceptImageUrl('/imgs/demo/before-empty.avif');
  };

  const mutation = useMutation({
    mutationFn: (vars: {
      image: string;
      roomType: RoomType;
      style: Style;
      instructions: string;
    }) => apiPost<DesignResult>('/api/design', vars),
    onSuccess: (result) => {
      const normalizedResult = {
        ...result,
        imageUrl: normalizeImageUrl(result.imageUrl),
      };
      setHistory((prev) => [normalizedResult, ...prev].slice(0, 30));
      setActive(normalizedResult);
      setView('result');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generating = mutation.isPending;

  const generate = () => {
    if (!imageData) {
      toast.error(m['create.studio.need_photo']());
      return;
    }
    mutation.mutate({ image: imageData, roomType, style, instructions });
  };

  const shownImage = active && view === 'result' ? active.imageUrl : imageData;
  const hasDisplayImage = Boolean(shownImage);

  return (
    <section
      id="design-studio"
      className="bg-background scroll-mt-16 px-4 pb-24 sm:pb-32"
    >
      <div className="mx-auto max-w-6xl rounded-[28px] bg-[#f5f5f7] p-4 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Image canvas */}
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                onFileChange(e.dataTransfer.files);
              }}
              className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl transition-colors ${
                imageData ? 'bg-neutral-900' : 'bg-white'
              } ${dragOver && !imageData ? 'ring-2 ring-[#0071e3]' : ''}`}
            >
              {!hasDisplayImage ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-neutral-300 px-6 text-center transition-colors hover:border-neutral-400"
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[#0071e3]/10">
                    <Upload className="text-primary size-6" />
                  </span>
                  <span className="text-lg font-semibold tracking-tight">
                    {m['create.studio.upload_title']()}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {m['create.studio.upload_hint']()}
                  </span>
                </button>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shownImage || undefined}
                    alt={
                      active && view === 'result'
                        ? m['create.studio.result_alt']()
                        : m['create.studio.empty_alt']()
                    }
                    className="h-full w-full object-cover"
                  />
                  {active?.free && view === 'result' && (
                    <div
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                      aria-hidden="true"
                    >
                      <div className="absolute -inset-8 flex rotate-[-18deg] flex-wrap content-center justify-center gap-x-12 gap-y-8">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <span
                            key={i}
                            className="text-sm font-semibold tracking-[0.2em] text-white/35 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                          >
                            {envConfigs.app_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {generating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900/60 backdrop-blur-sm">
                      <Loader2 className="size-8 animate-spin text-white" />
                      <p className="text-sm font-medium text-white">
                        {m['create.studio.generating']()}
                      </p>
                    </div>
                  )}
                  {active && imageData && !generating && (
                    <div className="absolute top-3 left-3 flex rounded-full bg-neutral-900/70 p-1 backdrop-blur-md">
                      {(['result', 'original'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setView(v)}
                          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                            view === v
                              ? 'bg-white text-neutral-900'
                              : 'text-white hover:text-white/80'
                          }`}
                        >
                          {v === 'result'
                            ? m['create.studio.result']()
                            : m['create.studio.original']()}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setImageData(null);
                      setActive(null);
                      setView('result');
                    }}
                    className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-neutral-900/70 text-white backdrop-blur-md transition-colors hover:bg-neutral-900/90"
                    aria-label={m['create.studio.change_photo']()}
                  >
                    <X className="size-4" />
                  </button>
                </>
              )}
            </div>

            {/* Actions under the canvas */}
            {hasDisplayImage && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {active && !generating && (
                  <>
                    {active.free ? (
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077ed]"
                      >
                        <Download className="size-4" />
                        {m['create.studio.free_download_cta']()}
                      </Link>
                    ) : (
                      <a
                        href={
                          active.id
                            ? `/api/design-history?download=${encodeURIComponent(active.id)}`
                            : active.imageUrl
                        }
                        download="redocor-design"
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-neutral-400"
                      >
                        <Download className="size-4" />
                        {m['create.studio.download']()}
                      </a>
                    )}
                    {imageData && (
                      <button
                        type="button"
                        onClick={generate}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0077ed]"
                      >
                        <RefreshCw className="size-4" />
                        {m['create.studio.regenerate']()}
                      </button>
                    )}
                    {active.demo && (
                      <span className="text-muted-foreground text-xs">
                        {m['create.studio.demo_note']()}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* History strip */}
            {history.length > 0 && (
              <div className="mt-6">
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  {m['create.studio.history']()}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((h, i) => (
                    <button
                      key={`${h.imageUrl}-${i}`}
                      type="button"
                      onClick={() => {
                        setActive(h);
                        if (h.roomType) setRoomType(h.roomType);
                        if (h.style) setStyle(h.style);
                        setInstructions(h.instructions || '');
                        setView('result');
                      }}
                      className="shrink-0 overflow-hidden rounded-xl border-2 border-transparent transition-colors hover:border-[#0071e3]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={h.imageUrl}
                        alt=""
                        className="size-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files)}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {m['create.studio.room_label']()}
              </p>
              <div className="flex flex-wrap gap-2">
                {ROOM_TYPES.map((r) => (
                  <Chip
                    key={r}
                    selected={roomType === r}
                    onClick={() => setRoomType(r)}
                  >
                    {m[`create.room.${r}` as 'create.room.living']()}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {m['create.studio.style_label']()}
              </p>
              <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pt-1 pb-2.5">
                {STYLES.map((s) => {
                  const selected = style === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      aria-pressed={selected}
                      className="w-24 shrink-0"
                    >
                      <span
                        className={`relative block aspect-[4/3] overflow-hidden rounded-xl transition-all ${
                          selected
                            ? 'ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[#f5f5f7]'
                            : 'ring-1 ring-neutral-200 hover:ring-neutral-400'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={STYLE_THUMBS[s]}
                          alt={m[
                            `create.style.${s}` as 'create.style.modern'
                          ]()}
                          width={STYLE_THUMBS[s].endsWith('.avif') ? 1376 : 800}
                          height={STYLE_THUMBS[s].endsWith('.avif') ? 768 : 600}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-[#0071e3] text-white shadow">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span
                        className={`mt-1.5 block text-center text-xs ${
                          selected
                            ? 'font-semibold text-[#0071e3]'
                            : 'text-neutral-600'
                        }`}
                      >
                        {m[`create.style.${s}` as 'create.style.modern']()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="design-instructions"
                className="mb-2.5 block text-xs font-semibold tracking-wide text-neutral-500 uppercase"
              >
                {m['create.studio.instructions_label']()}
              </label>
              <textarea
                id="design-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={m['create.studio.instructions_placeholder']()}
                className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 focus:outline-none"
              />
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {!imageData && (
                <button
                  type="button"
                  onClick={useSample}
                  className="text-primary inline-flex items-center justify-center gap-1.5 text-sm transition-colors hover:underline"
                >
                  <ImagePlus className="size-4" />
                  {m['create.studio.upload_sample']()}
                </button>
              )}
              <button
                type="button"
                onClick={generate}
                disabled={generating || !imageData}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {generating ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Sparkles className="size-5" />
                )}
                {generating
                  ? m['create.studio.generating']()
                  : m['create.studio.generate']()}
              </button>
              {!aiConfigured ? (
                <p className="text-muted-foreground text-center text-xs">
                  {m['create.studio.demo_note']()}
                </p>
              ) : requiresAuth && !session?.user ? (
                <Link
                  href="/sign-up"
                  className="text-center text-xs font-medium text-[#0071e3] underline underline-offset-2"
                >
                  {m['create.studio.sign_up_hint']()}
                </Link>
              ) : freeDesignAvailable ? (
                <p className="text-muted-foreground text-center text-xs">
                  {m['create.studio.first_free_hint']()}
                </p>
              ) : (
                <p className="text-muted-foreground text-center text-xs">
                  {m['create.studio.free_hint']()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact page hero for /room-design. */
export function CreateHero() {
  return (
    <section className="bg-background px-4 pt-14 pb-10 text-center sm:pt-20 sm:pb-14">
      <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {m['create.hero.title']()}
      </h1>
      <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg text-balance">
        {m['create.hero.subtitle']()}
      </p>
    </section>
  );
}

const TIPS = [
  {
    icon: Camera,
    title: m['create.tips.t1_title'],
    desc: m['create.tips.t1_desc'],
  },
  {
    icon: Sun,
    title: m['create.tips.t2_title'],
    desc: m['create.tips.t2_desc'],
  },
  {
    icon: Sofa,
    title: m['create.tips.t3_title'],
    desc: m['create.tips.t3_desc'],
  },
] as const;

/** Photo tips below the studio — three Apple-style text columns. */
export function DesignTips() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {m['create.tips.title']()}
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {TIPS.map((tip) => (
            <div key={tip.title()} className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#0071e3]/10">
                <tip.icon className="text-primary size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {tip.title()}
              </h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                {tip.desc()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
