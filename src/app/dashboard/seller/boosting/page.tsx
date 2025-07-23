"use client";

/* ──────────────────────────────────────────────────────────────
   File: src/app/dashboard/seller/boosting/page.tsx
   Description:
   - Single-file client page (no extra client module)
   - Fetches data from server action getBoostPageData() on mount
   - Preserves your full hero + cards styling
   - Opens BoostingModal (expects { listing }) when user selects a plan
   - Handles loading + error states cleanly
   ────────────────────────────────────────────────────────────── */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Zap,
  Crown,
  Star,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import BoostingModal from "@/shared/components/ui/BoostingModal";
import { getBoostPageData } from "@/features/boosting/actions";

/* ------------------------------------------------------------------
   Types inferred from the server action for source-of-truth safety.
   NOTE: These are *type-only* — they disappear at build time.
------------------------------------------------------------------- */
type BoostPageData = Awaited<ReturnType<typeof getBoostPageData>>;
type Plan        = BoostPageData["plans"][number];
type Listing     = BoostPageData["listings"][number];
type ActiveBoost = BoostPageData["activeBoosts"][number];

/* ------------------------------------------------------------------
   Page Component (Client)
   We load everything on mount because the whole file is client-side.
------------------------------------------------------------------- */
export default function BoostingPage() {
  /* ---------- data state ---------- */
  const [plans,        setPlans]        = useState<Plan[]>([]);
  const [listings,     setListings]     = useState<Listing[]>([]);
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);

  /* ---------- UI state ---------- */
  const [isLoading, setIsLoading]               = useState(true);
  const [selectedListing, setSelectedListing]   = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen]           = useState(false);

  /* ---------- fetch on mount ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { plans, listings, activeBoosts } = await getBoostPageData();
        if (cancelled) return;
        setPlans(plans ?? []);
        setListings(listings ?? []);
        setActiveBoosts(activeBoosts ?? []);
      } catch (err: any) {
        console.error("Boosting data load failed:", err);
        toast.error("Failed to load boosting data.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- derived counts ---------- */
  const boostedCount   = useMemo(
    () => listings.filter(l => (l.boost_priority ?? 0) > 0).length,
    [listings]
  );
  const unboostedCount = useMemo(
    () => listings.length - boostedCount,
    [listings, boostedCount]
  );

  /* ---------- helper fns ---------- */
  const getPlanIcon = useCallback((p: Plan) => {
    if (p.priority_level === 3) return Crown;
    if (p.priority_level === 2) return Zap;
    return TrendingUp;
  }, []);

  const getStatusColor = useCallback((s: ActiveBoost["status"]) =>
    s === "active"       ? "text-green-600 bg-green-50"
  : s === "ending_soon"  ? "text-orange-600 bg-orange-50"
  : s === "expired"      ? "text-red-600 bg-red-50"
                         : "text-gray-600 bg-gray-50"
  , []);

  const daysLeft = useCallback((d: string | null) =>
    d ? Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)) : 0
  , []);

  /* When a plan card is clicked:
     - Pick the *first* unboosted published listing by default.
       (You told me not to change styling; so we don't introduce
        a listing selector UI here.)
     - Open BoostingModal with that listing.
     - If no unboosted listing exists, we warn + do not open.
  */
  const openModalForPlan = useCallback((plan: Plan) => {
    const target = listings.find(l => (l.boost_priority ?? 0) === 0) ?? null;
    if (!target) {
      toast.error("All your published listings are already boosted.");
      return;
    }
    setSelectedListing(target);
    setIsModalOpen(true);
  }, [listings]);

  /* ---------- loading gate ---------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="ml-4 text-gray-600">Loading Boosting Dashboard…</p>
      </div>
    );
  }

  /* ---------- render (styling preserved from your current version) ---------- */
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* header / hero */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Boost Your Listings
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Increase your visibility and get more bookings with our premium boosting options
            </p>
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-1 w-12 bg-teal-600 rounded-full" />
              <div className="h-2 w-2 bg-teal-600 rounded-full" />
              <div className="h-1 w-12 bg-teal-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="py-8 px-6 sm:px-8 flex-1 w-full">
        <div className="max-w-7xl mx-auto">
          {/* stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard icon={TrendingUp} label="Active Boosts" value={activeBoosts.length} />
            <StatCard icon={Star}       label="Boosted Listings" value={boostedCount} />
            <StatCard icon={Clock}      label="Unboosted Listings" value={unboostedCount} />
          </div>

          {/* plans */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Choose Your Boost Plan"
                subtitle="Select the perfect plan based on duration and number of listings"
              />
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map(plan => {
                    const Icon = getPlanIcon(plan);
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        Icon={Icon}
                        onSelect={() => openModalForPlan(plan)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* active boosts */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Your Active Boosts"
                subtitle="Monitor your currently boosted listings and their remaining time"
              />
              <div className="p-8">
                {activeBoosts.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-6">
                    {activeBoosts.map(b => (
                      <BoostCard
                        key={b.id}
                        boost={b}
                        color={getStatusColor(b.status as ActiveBoost["status"])}
                        days={daysLeft((b as any).expires_at ?? null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      <BoostingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={selectedListing}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   Presentational helpers (copied from your current version; unchanged
   styling except for minor TS type additions).
------------------------------------------------------------------- */

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-teal-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">{subtitle}</p>
  </div>
);

const PlanCard = ({
  plan,
  Icon,
  onSelect,
}: {
  plan: Plan;
  Icon: React.ElementType;
  onSelect: () => void;
}) => (
  <div
    className="relative bg-white border-2 border-teal-600 rounded-2xl p-8 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:scale-105 hover:border-teal-700"
    onClick={onSelect}
  >
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-teal-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
      <p className="text-3xl font-bold text-gray-900">${plan.price}</p>
      <p className="text-gray-500">for {plan.duration_days} days</p>
      {(plan as any).max_listings && (
        <p className="text-sm text-gray-600 mt-1">
          Up to {(plan as any).max_listings} listings
        </p>
      )}
    </div>
    <div className="space-y-3 mb-8">
      {((plan as any).features ?? []).map((feat: string, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-gray-700">{feat}</span>
        </div>
      ))}
    </div>
    <Button className="w-full py-3 font-semibold cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
      Start Boosting
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <TrendingUp className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Boosts</h3>
    <p className="text-gray-500 mb-6">
      Start boosting your listings to increase visibility and bookings
    </p>
    <Button
      className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105"
      onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
    >
      Choose a Boost Plan
    </Button>
  </div>
);

const BoostCard = ({
  boost,
  color,
  days,
}: {
  boost: ActiveBoost;
  color: string;
  days: number;
}) => (
  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {(boost as any).listings?.title ?? "Unknown Listing"}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
            {String(boost.status).replace("_", " ").toUpperCase()}
          </span>
        </div>
        <p className="text-gray-600 mb-3">
          {(boost as any).boost_plans?.name ?? "Unknown Plan"}
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {boost.activated_at
                ? new Date(boost.activated_at).toLocaleDateString()
                : "—"}{" "}
              -{" "}
              {boost.expires_at
                ? new Date(boost.expires_at).toLocaleDateString()
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{days > 0 ? `${days} days remaining` : "Expired"}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white transition-all duration-200 transform hover:scale-105"
          onClick={() => toast.info("Extend boost coming soon!")}
        >
          Extend Boost
        </Button>
      </div>
    </div>
  </div>
);
