import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Loader2, TrendingUp, History, Search, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { venusService, CompBenchmark } from "@/services/venusService";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROLES = ["CEO","COO","CTO","CFO","CPO","CMO","CRO","CHRO","VP Engineering","VP Sales","VP Product","VP Finance","VP Operations","CISO","CIO","General Counsel","Chief of Staff","President","Managing Director"];
const STAGES = ["Pre-seed","Seed","Series A","Series B","Series C","Late Stage","Public","PE-backed","Bootstrapped"];

const USA_CITIES: { state: string; cities: string[] }[] = [
  { state: "Alabama",        cities: ["Birmingham, AL","Montgomery, AL","Huntsville, AL","Mobile, AL"] },
  { state: "Alaska",         cities: ["Anchorage, AK","Fairbanks, AK","Juneau, AK"] },
  { state: "Arizona",        cities: ["Phoenix, AZ","Tucson, AZ","Scottsdale, AZ","Tempe, AZ","Mesa, AZ","Chandler, AZ"] },
  { state: "Arkansas",       cities: ["Little Rock, AR","Fayetteville, AR","Fort Smith, AR"] },
  { state: "California",     cities: ["San Francisco, CA","Los Angeles, CA","San Diego, CA","San Jose, CA","Sacramento, CA","Oakland, CA","Irvine, CA","Fresno, CA","Long Beach, CA","Riverside, CA","Santa Barbara, CA","Santa Clara, CA","Palo Alto, CA","Menlo Park, CA","Burlingame, CA","Redwood City, CA","Pasadena, CA"] },
  { state: "Colorado",       cities: ["Denver, CO","Colorado Springs, CO","Boulder, CO","Aurora, CO","Fort Collins, CO","Broomfield, CO"] },
  { state: "Connecticut",    cities: ["Hartford, CT","New Haven, CT","Stamford, CT","Bridgeport, CT","Greenwich, CT","Norwalk, CT"] },
  { state: "Delaware",       cities: ["Wilmington, DE","Dover, DE","Newark, DE"] },
  { state: "Florida",        cities: ["Miami, FL","Orlando, FL","Tampa, FL","Jacksonville, FL","Fort Lauderdale, FL","Boca Raton, FL","West Palm Beach, FL","Fort Myers, FL","Sarasota, FL","Gainesville, FL","Tallahassee, FL","St. Petersburg, FL","Naples, FL"] },
  { state: "Georgia",        cities: ["Atlanta, GA","Savannah, GA","Augusta, GA","Columbus, GA","Alpharetta, GA","Sandy Springs, GA","Roswell, GA"] },
  { state: "Hawaii",         cities: ["Honolulu, HI","Kailua, HI","Hilo, HI"] },
  { state: "Idaho",          cities: ["Boise, ID","Nampa, ID","Meridian, ID","Idaho Falls, ID"] },
  { state: "Illinois",       cities: ["Chicago, IL","Naperville, IL","Rockford, IL","Aurora, IL","Evanston, IL","Schaumburg, IL","Downers Grove, IL"] },
  { state: "Indiana",        cities: ["Indianapolis, IN","Fort Wayne, IN","Carmel, IN","South Bend, IN","Bloomington, IN"] },
  { state: "Iowa",           cities: ["Des Moines, IA","Cedar Rapids, IA","Iowa City, IA","Davenport, IA"] },
  { state: "Kansas",         cities: ["Wichita, KS","Kansas City, KS","Overland Park, KS","Olathe, KS"] },
  { state: "Kentucky",       cities: ["Louisville, KY","Lexington, KY","Bowling Green, KY"] },
  { state: "Louisiana",      cities: ["New Orleans, LA","Baton Rouge, LA","Shreveport, LA","Lafayette, LA"] },
  { state: "Maine",          cities: ["Portland, ME","Bangor, ME","Augusta, ME"] },
  { state: "Maryland",       cities: ["Baltimore, MD","Bethesda, MD","Rockville, MD","Annapolis, MD","Silver Spring, MD","Gaithersburg, MD"] },
  { state: "Massachusetts",  cities: ["Boston, MA","Cambridge, MA","Worcester, MA","Springfield, MA","Waltham, MA","Burlington, MA","Woburn, MA"] },
  { state: "Michigan",       cities: ["Detroit, MI","Grand Rapids, MI","Ann Arbor, MI","Lansing, MI","Troy, MI","Auburn Hills, MI","Kalamazoo, MI"] },
  { state: "Minnesota",      cities: ["Minneapolis, MN","St. Paul, MN","Rochester, MN","Bloomington, MN","Plymouth, MN","Minnetonka, MN"] },
  { state: "Mississippi",    cities: ["Jackson, MS","Gulfport, MS","Southaven, MS"] },
  { state: "Missouri",       cities: ["Kansas City, MO","St. Louis, MO","Springfield, MO","Columbia, MO","Chesterfield, MO"] },
  { state: "Montana",        cities: ["Billings, MT","Missoula, MT","Great Falls, MT","Bozeman, MT"] },
  { state: "Nebraska",       cities: ["Omaha, NE","Lincoln, NE","Bellevue, NE"] },
  { state: "Nevada",         cities: ["Las Vegas, NV","Reno, NV","Henderson, NV","North Las Vegas, NV","Sparks, NV"] },
  { state: "New Hampshire",  cities: ["Manchester, NH","Nashua, NH","Concord, NH","Portsmouth, NH"] },
  { state: "New Jersey",     cities: ["Newark, NJ","Jersey City, NJ","Trenton, NJ","Princeton, NJ","Hoboken, NJ","Edison, NJ","Parsippany, NJ","Morristown, NJ"] },
  { state: "New Mexico",     cities: ["Albuquerque, NM","Santa Fe, NM","Las Cruces, NM"] },
  { state: "New York",       cities: ["New York City, NY","Buffalo, NY","Rochester, NY","Albany, NY","Syracuse, NY","Yonkers, NY","White Plains, NY","Ithaca, NY","Long Island, NY"] },
  { state: "North Carolina", cities: ["Charlotte, NC","Raleigh, NC","Durham, NC","Greensboro, NC","Chapel Hill, NC","Cary, NC","Winston-Salem, NC","Asheville, NC"] },
  { state: "North Dakota",   cities: ["Fargo, ND","Bismarck, ND","Grand Forks, ND"] },
  { state: "Ohio",           cities: ["Columbus, OH","Cleveland, OH","Cincinnati, OH","Toledo, OH","Akron, OH","Dayton, OH","Dublin, OH","Westerville, OH"] },
  { state: "Oklahoma",       cities: ["Oklahoma City, OK","Tulsa, OK","Norman, OK","Edmond, OK"] },
  { state: "Oregon",         cities: ["Portland, OR","Eugene, OR","Salem, OR","Bend, OR","Hillsboro, OR","Beaverton, OR"] },
  { state: "Pennsylvania",   cities: ["Philadelphia, PA","Pittsburgh, PA","Allentown, PA","Erie, PA","King of Prussia, PA","Malvern, PA","Harrisburg, PA"] },
  { state: "Rhode Island",   cities: ["Providence, RI","Cranston, RI","Warwick, RI"] },
  { state: "South Carolina", cities: ["Charleston, SC","Columbia, SC","Greenville, SC","Rock Hill, SC"] },
  { state: "South Dakota",   cities: ["Sioux Falls, SD","Rapid City, SD"] },
  { state: "Tennessee",      cities: ["Nashville, TN","Memphis, TN","Knoxville, TN","Chattanooga, TN","Franklin, TN","Brentwood, TN"] },
  { state: "Texas",          cities: ["Houston, TX","Dallas, TX","Austin, TX","San Antonio, TX","Fort Worth, TX","El Paso, TX","Plano, TX","Irving, TX","Frisco, TX","McKinney, TX","Arlington, TX","Addison, TX","The Woodlands, TX"] },
  { state: "Utah",           cities: ["Salt Lake City, UT","Provo, UT","Ogden, UT","St. George, UT","Lehi, UT","Sandy, UT"] },
  { state: "Vermont",        cities: ["Burlington, VT","Montpelier, VT","South Burlington, VT"] },
  { state: "Virginia",       cities: ["Arlington, VA","Richmond, VA","Virginia Beach, VA","Norfolk, VA","Alexandria, VA","Tysons, VA","McLean, VA","Reston, VA","Herndon, VA","Charlottesville, VA"] },
  { state: "Washington",     cities: ["Seattle, WA","Tacoma, WA","Bellevue, WA","Spokane, WA","Redmond, WA","Kirkland, WA","Bothell, WA","Everett, WA"] },
  { state: "Washington D.C.", cities: ["Washington, D.C."] },
  { state: "West Virginia",  cities: ["Charleston, WV","Huntington, WV","Morgantown, WV"] },
  { state: "Wisconsin",      cities: ["Milwaukee, WI","Madison, WI","Green Bay, WI","Waukesha, WI","Racine, WI"] },
  { state: "Wyoming",        cities: ["Cheyenne, WY","Casper, WY"] },
  { state: "Remote",         cities: ["Remote (US)"] },
];

const CANADA_CITIES: { province: string; cities: string[] }[] = [
  { province: "Alberta",             cities: ["Calgary, AB","Edmonton, AB","Red Deer, AB","Lethbridge, AB","Medicine Hat, AB"] },
  { province: "British Columbia",    cities: ["Vancouver, BC","Victoria, BC","Kelowna, BC","Surrey, BC","Burnaby, BC","Richmond, BC","Abbotsford, BC","Kamloops, BC","Prince George, BC"] },
  { province: "Manitoba",            cities: ["Winnipeg, MB","Brandon, MB","Steinbach, MB"] },
  { province: "New Brunswick",       cities: ["Fredericton, NB","Saint John, NB","Moncton, NB"] },
  { province: "Newfoundland",        cities: ["St. John's, NL","Mount Pearl, NL","Corner Brook, NL"] },
  { province: "Nova Scotia",         cities: ["Halifax, NS","Dartmouth, NS","Sydney, NS","Truro, NS"] },
  { province: "Ontario",             cities: ["Toronto, ON","Ottawa, ON","Mississauga, ON","Hamilton, ON","Brampton, ON","London, ON","Windsor, ON","Waterloo, ON","Kitchener, ON","Markham, ON","Vaughan, ON","Oakville, ON","Burlington, ON","Barrie, ON","Kingston, ON","Thunder Bay, ON"] },
  { province: "Prince Edward Island", cities: ["Charlottetown, PE","Summerside, PE"] },
  { province: "Quebec",              cities: ["Montreal, QC","Quebec City, QC","Laval, QC","Gatineau, QC","Longueuil, QC","Sherbrooke, QC","Saguenay, QC","Levis, QC","Trois-Rivières, QC"] },
  { province: "Saskatchewan",        cities: ["Saskatoon, SK","Regina, SK","Prince Albert, SK"] },
  { province: "Remote",              cities: ["Remote (Canada)"] },
];

// Flat list for search
const ALL_LOCATIONS = [
  ...USA_CITIES.flatMap(g => g.cities.map(c => ({ city: c, group: g.state, country: "USA" }))),
  ...CANADA_CITIES.flatMap(g => g.cities.map(c => ({ city: c, group: g.province, country: "Canada" }))),
];

// ─── City Picker ──────────────────────────────────────────────────────────────

function CityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim().length < 1
    ? ALL_LOCATIONS
    : ALL_LOCATIONS.filter(l =>
        l.city.toLowerCase().includes(query.toLowerCase()) ||
        l.group.toLowerCase().includes(query.toLowerCase())
      );

  // Group filtered results
  const grouped: { label: string; country: string; cities: string[] }[] = [];
  for (const item of filtered.slice(0, 80)) {
    const existing = grouped.find(g => g.label === item.group);
    if (existing) existing.cities.push(item.city);
    else grouped.push({ label: item.group, country: item.country, cities: [item.city] });
  }

  const select = (city: string) => { onChange(city); setQuery(city); setOpen(false); };
  const clear = () => { onChange(""); setQuery(""); };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(""); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => e.key === "Escape" && setOpen(false)}
          placeholder="Search city or state…"
          className="w-full rounded-xl border border-gray-300 bg-gray-100 pl-8 pr-8 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
        />
        {query && (
          <button type="button" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-gray-300 bg-white shadow-xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-1">
              {grouped.map(group => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 px-2 py-1.5 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      group.country === "USA" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    }`}>{group.country}</span>
                    <span className="text-[10px] font-bold text-gray-400">{group.label}</span>
                  </div>
                  {group.cities.map(city => (
                    <button key={city} type="button" onClick={() => select(city)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        value === city ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}>
                      {city}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {open && query.trim().length > 0 && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-gray-300 bg-white p-4 text-center shadow-xl">
            <Search className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">No cities match "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Result display ───────────────────────────────────────────────────────────

function FmtK(n: number) { return `$${(n / 1000).toFixed(0)}K`; }

function BenchmarkResult({ b }: { b: CompBenchmark }) {
  const rows = [
    { label: "Base Salary",   min: b.base_min,  max: b.base_max },
    { label: "Bonus",         min: Math.round(b.base_min * b.bonus_percent_min / 100), max: Math.round(b.base_max * b.bonus_percent_max / 100) },
    { label: "RSUs / Year",   min: b.rsu_min,   max: b.rsu_max },
    { label: "Total Package", min: b.total_min, max: b.total_max },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">
            {b.stage} · {b.location}{b.years_experience ? ` · ${b.years_experience} yrs exp` : ""}
          </p>
          <h3 className="text-xl font-black text-gray-900">{b.role}</h3>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-900">{FmtK(b.p50_total)}</p>
          <p className="text-xs text-gray-400 font-semibold">Market P50</p>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, min, max }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">{label}</span>
            <span className="text-base font-black text-gray-900">{FmtK(min)} – {FmtK(max)}</span>
          </div>
        ))}
      </div>

      {b.equity_min > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-blue-700">Equity Grant</span>
          <span className="text-base font-black text-blue-700">{b.equity_min}% – {b.equity_max}%</span>
        </div>
      )}

      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-1">Your Ask</p>
        <p className="text-sm text-teal-700">
          Negotiate for <strong>{FmtK(Math.round(b.p50_total * 1.12 / 1000) * 1000)}</strong> total — that's 12% above market median, standard for candidates with strong exit history.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CompensationIntelligence() {
  const [role, setRole] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompBenchmark | null>(null);
  const [history, setHistory] = useState<CompBenchmark[]>([]);

  const handleBenchmark = async () => {
    if (!role || !stage || !location) { toast.error("Select role, stage, and location."); return; }
    const years_experience = experience ? Number(experience) : undefined;
    setLoading(true);
    try {
      const data = await venusService.benchmarkCompensation({ role, stage, location, years_experience });
      setResult(data);
      setHistory(h => [data, ...h.slice(0, 4)]);
    } catch {
      toast.error("API not connected — showing demo data.");
      const demo: CompBenchmark = {
        role, stage, location, years_experience,
        base_min: 320000, base_max: 420000,
        bonus_percent_min: 20, bonus_percent_max: 30,
        equity_min: 0.5, equity_max: 1.5,
        rsu_min: 200000, rsu_max: 600000,
        total_min: 720000, total_max: 1200000,
        p50_total: 890000,
      };
      setResult(demo);
      setHistory(h => [demo, ...h.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Phase 2 · Intelligence</p>
        <h1 className="text-2xl font-black text-gray-900 mt-0.5">Compensation Intelligence</h1>
        <p className="text-sm text-gray-400 mt-1">Benchmark base, bonus, RSUs & equity for any executive role across 300+ US & Canadian cities.</p>
      </div>

      {/* Inputs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 transition-colors">
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Company Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 transition-colors">
              <option value="">Select stage</option>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Location</label>
            <CityPicker value={location} onChange={setLocation} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Years of Experience</label>
            <input
              type="number" min={0} max={60} value={experience}
              onChange={e => setExperience(e.target.value)}
              placeholder="e.g. 12"
              className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Selected city display */}
        {location && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3 text-blue-600" />
            <span>Benchmarking for <span className="text-gray-900 font-semibold">{location}</span></span>
          </div>
        )}

        <Button onClick={handleBenchmark} disabled={loading || !role || !stage || !location}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 disabled:opacity-50">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Benchmarking...</>
            : <><DollarSign className="h-4 w-4 mr-2" />Benchmark Compensation</>}
        </Button>
      </div>

      {result && <BenchmarkResult b={result} />}

      {history.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-gray-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Benchmarks</p>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button key={i} type="button" onClick={() => setResult(h)}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 px-4 py-3 transition-all text-left">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{h.role}</p>
                  <p className="text-xs text-gray-400">{h.stage} · {h.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{FmtK(h.p50_total)}</p>
                  <p className="text-[10px] text-gray-400">P50</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">Select role, stage & location to benchmark</p>
          <p className="text-xs text-gray-400 mt-1">300+ cities across the US and Canada · Groq AI-powered</p>
        </div>
      )}
    </div>
  );
}
