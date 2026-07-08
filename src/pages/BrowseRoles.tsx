import { useState } from "react";
import { Link } from "react-router-dom";
import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { EXEC_ROLES } from "@/data/executiveRoles";
import { STARTUP_ROLES, BOARD_ROLES, INVESTOR_ROLES } from "@/data/startupBoardRoles";
import { Search, ChevronRight } from "lucide-react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type BrowseRole = {
  title: string;
  href: string;
  category: string;
  letter: string;
};

function buildAllRoles(): BrowseRole[] {
  const roles: BrowseRole[] = [];

  // Executive roles
  EXEC_ROLES.forEach(r => {
    roles.push({ title: r.title, href: `/executive-roles/${r.slug}`, category: "Executive", letter: r.title[0].toUpperCase() });
    if (r.abbr) roles.push({ title: r.abbr, href: `/executive-roles/${r.slug}`, category: "Executive", letter: r.abbr[0].toUpperCase() });
  });

  // Fractional roles
  ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo"].forEach(slug => {
    const base = EXEC_ROLES.find(r => r.slug === slug);
    if (!base) return;
    const title = `Fractional ${base.abbr || base.title}`;
    roles.push({ title, href: `/fractional/${slug}`, category: "Fractional", letter: title[0].toUpperCase() });
  });

  // Interim roles
  ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo"].forEach(slug => {
    const base = EXEC_ROLES.find(r => r.slug === slug);
    if (!base) return;
    const title = `Interim ${base.abbr || base.title}`;
    roles.push({ title, href: `/interim/${slug}`, category: "Interim", letter: title[0].toUpperCase() });
  });

  // Startup roles
  STARTUP_ROLES.forEach(r => {
    roles.push({ title: r.title, href: `/startup/${r.slug}`, category: "Startup", letter: r.title[0].toUpperCase() });
  });

  // Board roles
  BOARD_ROLES.forEach(r => {
    roles.push({ title: r.title, href: `/board/${r.slug}`, category: "Board", letter: r.title[0].toUpperCase() });
  });

  // Investor roles
  INVESTOR_ROLES.forEach(r => {
    roles.push({ title: r.title, href: `/investors/${r.slug}`, category: "Investor/PE", letter: r.title[0].toUpperCase() });
  });

  // Deduplicate by href and sort alphabetically
  const seen = new Set<string>();
  return roles
    .filter(r => { if (seen.has(r.href + r.title)) return false; seen.add(r.href + r.title); return true; })
    .sort((a, b) => a.title.localeCompare(b.title));
}

const ALL_ROLES = buildAllRoles();

const CATEGORY_COLORS: Record<string, string> = {
  "Executive": "bg-blue-50 text-blue-700 border-blue-100",
  "Fractional": "bg-violet-50 text-violet-700 border-violet-100",
  "Interim": "bg-teal-50 text-teal-700 border-teal-100",
  "Startup": "bg-orange-50 text-orange-700 border-orange-100",
  "Board": "bg-slate-100 text-slate-700 border-slate-200",
  "Investor/PE": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function BrowseRoles() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = ALL_ROLES.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchLetter = !activeLetter || r.letter === activeLetter;
    const matchCat = !activeCategory || r.category === activeCategory;
    return matchSearch && matchLetter && matchCat;
  });

  const byLetter = ALPHABET.reduce<Record<string, BrowseRole[]>>((acc, l) => {
    const found = filtered.filter(r => r.letter === l);
    if (found.length > 0) acc[l] = found;
    return acc;
  }, {});

  return (
    <>
      <title>Browse All Executive Roles A–Z | Hizorex</title>
      <NavbarV2 />

      {/* Hero */}
      <section className="bg-gray-900 text-white py-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Browse All Roles A–Z</h1>
          <p className="text-gray-400 mb-6">Every executive, fractional, interim, startup, board, and investor role — searchable in one place.</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search any role…"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex gap-6 overflow-x-auto">
          {/* Category filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type:</span>
            {["Executive", "Fractional", "Interim", "Startup", "Board", "Investor/PE"].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat ? CATEGORY_COLORS[cat] + " border" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* A-Z */}
        <div className="mx-auto max-w-6xl px-4 pb-2 flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveLetter(null)}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${!activeLetter ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
          >
            ALL
          </button>
          {ALPHABET.filter(l => ALL_ROLES.some(r => r.letter === l)).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => { setActiveLetter(activeLetter === l ? null : l); setSearch(""); }}
              className={`px-2 py-1 rounded text-xs font-bold transition-all ${activeLetter === l ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {search ? (
          // Flat search results
          <div>
            <p className="text-sm text-gray-500 mb-6">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<strong>{search}</strong>"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r, i) => (
                <Link
                  key={i}
                  to={r.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-400 hover:shadow-sm transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${CATEGORY_COLORS[r.category]}`}>{r.category}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ) : Object.keys(byLetter).length === 0 ? (
          <p className="text-gray-400 text-center py-12">No roles found.</p>
        ) : (
          // A-Z grouped
          <div className="space-y-10">
            {Object.entries(byLetter).map(([letter, roles]) => (
              <div key={letter} id={`letter-${letter}`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-black text-gray-900">{letter}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs text-gray-400">{roles.length} role{roles.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {roles.map((r, i) => (
                    <Link
                      key={i}
                      to={r.href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-400 hover:shadow-sm transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${CATEGORY_COLORS[r.category]}`}>{r.category}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterV2 />
    </>
  );
}
