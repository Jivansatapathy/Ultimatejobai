import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Loader2, RefreshCw, MapPin, ArrowRight,
  Users, Building2, ExternalLink,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { careerService, JobFair } from "@/services/careerService";
import { Button } from "@/components/ui/button";
import { UsageMonitor } from "@/components/subscription/UsageMonitor";
import { useSubscription } from "@/context/SubscriptionContext";
import { getVenusBasePath } from "@/lib/venusBasePath";

interface Filters {
  country: string;
  state: string;
  city: string;
}

function getFilteredFairs(fairs: JobFair[], filters: Filters): JobFair[] {
  return fairs.filter(fair => {
    const loc = (fair.location || "").toLowerCase();
    return (
      (!filters.country || (fair.country || "").toLowerCase().includes(filters.country.toLowerCase())) &&
      (!filters.state || loc.includes(filters.state.toLowerCase())) &&
      (!filters.city || (fair.city || "").toLowerCase().includes(filters.city.toLowerCase()) || loc.includes(filters.city.toLowerCase()))
    );
  });
}

export default function VenusJobFairs() {
  const [fairs, setFairs] = useState<JobFair[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ country: "", state: "", city: "" });
  const { refreshSummary } = useSubscription();
  const navigate = useNavigate();
  const basePath = getVenusBasePath(useLocation().pathname);

  useEffect(() => { refreshSummary(); }, [refreshSummary]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await careerService.getJobFairs();
      setFairs(data);
    } catch {
      setFairs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const countries = [...new Set(fairs.map(f => f.country).filter(Boolean))].sort() as string[];
  const cities = [...new Set(fairs.map(f => f.city).filter(Boolean))].sort() as string[];
  const states = [
    ...new Set(
      fairs.map(f => {
        const parts = (f.location || "").split(",");
        return parts.length >= 2 ? parts[parts.length - 2].trim() : "";
      }).filter(Boolean)
    ),
  ].sort();

  const filtered = getFilteredFairs(fairs, filters);
  const hasFilters = !!(filters.country || filters.state || filters.city);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Venus AI · Events</p>
            <UsageMonitor featureKey="job_fairs_access" compact />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">Job Fairs</h1>
          <p className="text-sm text-gray-400 mt-1">
            Upcoming executive career fairs and recruiting events.
            {!loading && fairs.length > 0 && (
              <span className="ml-1 text-blue-600 font-semibold">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}
          className="shrink-0 border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-900">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      {fairs.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {([
            { field: "country" as const, label: "Country", options: countries },
            { field: "state" as const, label: "State / Region", options: states },
            { field: "city" as const, label: "City", options: cities },
          ]).map(({ field, label, options }) => (
            <div key={field} className="relative">
              <select
                value={filters[field]}
                onChange={e => setFilters(prev => ({ ...prev, [field]: e.target.value }))}
                className="h-9 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer min-w-[140px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                <option value="">All {label}s</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters({ country: "", state: "", city: "" })}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-400">Fetching latest job fair events…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((fair, idx) => (
            <motion.div
              key={fair.id || `fair-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                    <Building2 className="h-2.5 w-2.5" />
                    {fair.source || "General"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {fair.date_text || "Date TBA"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 leading-snug">{fair.title}</h3>

                {/* Location */}
                <p className="flex items-start gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
                  {fair.location || fair.city || "Online / Virtual"}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {fair.is_virtual && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">Virtual</span>
                  )}
                  {fair.country && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-[10px] font-medium border border-gray-100">{fair.country}</span>
                  )}
                  {fair.city && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-[10px] font-medium border border-gray-100">{fair.city}</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-4">
                {fair.link ? (
                  <a
                    href={fair.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    View Event Details
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <div className="w-full h-9 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-sm text-gray-400">
                    No link available
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 mb-4">
            <Calendar className="h-7 w-7 text-gray-300" />
          </div>
          <h3 className="text-base font-black text-gray-900 mb-1">
            {fairs.length === 0 ? "No Events Found" : "No Results Match Your Filters"}
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            {fairs.length === 0
              ? "Check back later for upcoming job fairs and executive recruiting events."
              : "Try adjusting or clearing your location filters."}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters({ country: "", state: "", city: "" })}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear all filters
            </button>
          )}
          {fairs.length === 0 && (
            <Button onClick={load} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 text-sm">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
            </Button>
          )}
        </div>
      )}

      {/* Info banner */}
      {!loading && fairs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Executive Networking Tip</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Before attending any event, update your Venus profile so your EOS™ score and branding materials are current. First impressions at these events can open board and C-suite pipelines.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/profile`)}
            className="shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap"
          >
            Update Profile <ArrowRight className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
