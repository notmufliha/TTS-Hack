import type { ReactNode, SVGProps } from "react";
import type { Outcome } from "@/lib/format";
import type { CriterionStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Icons (24px stroke icons, sized with className)
// ---------------------------------------------------------------------------

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const icons = {
  dashboard: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Icon>
  ),
  queue: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 14 2 2 4-4" />
    </Icon>
  ),
  report: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 15v2M12 11v6M17 7v10" />
    </Icon>
  ),
  records: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </Icon>
  ),
  family: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.9" />
    </Icon>
  ),
  check: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  ),
  x: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  ),
  alert: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Icon>
  ),
  clock: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Icon>
  ),
  minus: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </Icon>
  ),
  search: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  ),
  refresh: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </Icon>
  ),
  download: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </Icon>
  ),
  shield: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  ),
  arrowRight: (p: SVGProps<SVGSVGElement>) => (
    <Icon {...p}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </Icon>
  ),
};

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const OUTCOME_STYLES: Record<Outcome, { className: string; icon: keyof typeof icons }> = {
  "To screen": { className: "bg-sky-50 text-sky-800 ring-sky-200", icon: "clock" },
  Escalated: { className: "bg-amber-50 text-amber-800 ring-amber-200", icon: "alert" },
  Accepted: { className: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: "check" },
  Rejected: { className: "bg-rose-50 text-rose-800 ring-rose-200", icon: "x" },
  Withdrawn: { className: "bg-slate-100 text-slate-700 ring-slate-200", icon: "minus" },
  Cancelled: { className: "bg-slate-100 text-slate-700 ring-slate-200", icon: "minus" },
};

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const style = OUTCOME_STYLES[outcome];
  const BadgeIcon = icons[style.icon];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      <BadgeIcon className="h-3.5 w-3.5" />
      {outcome === "Escalated" ? "Awaiting clinician" : outcome}
    </span>
  );
}

const CRITERION_STYLES: Record<CriterionStatus, { className: string; icon: keyof typeof icons; label: string }> = {
  PASS: { className: "text-emerald-700", icon: "check", label: "Pass" },
  FAIL: { className: "text-rose-700", icon: "x", label: "Fail" },
  REVIEW: { className: "text-amber-700", icon: "alert", label: "Review" },
};

export function CriterionMark({ status }: { status: CriterionStatus }) {
  const style = CRITERION_STYLES[status];
  const MarkIcon = icons[style.icon];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${style.className}`}>
      <MarkIcon className="h-4 w-4" />
      {style.label}
    </span>
  );
}

export function Chip({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "rose" | "amber" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-800",
  };
  return <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Layout pieces
// ---------------------------------------------------------------------------

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={tab.value === value}
            onClick={() => onChange(tab.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab.value === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  tab.value === value ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{placeholder}</span>
      <icons.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
      />
    </label>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
      {label}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span className="flex items-center gap-2">
        <icons.alert className="h-4 w-4 shrink-0" />
        {message}
      </span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-sky-300",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
  success:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50",
  attention:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100",
};

export const tableStyles = {
  table: "min-w-full divide-y divide-slate-200 text-sm",
  th: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500",
  td: "px-4 py-3 align-top text-slate-700",
};
