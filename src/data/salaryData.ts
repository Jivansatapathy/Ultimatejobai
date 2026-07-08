export interface SalaryLevel {
  label: string;
  range: string;
  description: string;
}

export interface SalaryRole {
  slug: string;
  title: string;
  abbr?: string;
  dept: string;
  baseRange: string;
  totalRange: string;
  equity: string;
  bonus: string;
  searchQ: string;
  description: string;
  levels: SalaryLevel[];
  topCompanies: string[];
  topLocations: { city: string; premium: string }[];
  negotiationTips: string[];
  factors: string[];
  related: string[];
}

export const SALARY_ROLES: SalaryRole[] = [
  {
    slug: "cfo",
    title: "Chief Financial Officer",
    abbr: "CFO",
    dept: "Finance",
    baseRange: "$180,000 – $450,000",
    totalRange: "$250,000 – $900,000+",
    equity: "0.1% – 1.5% (startups) / RSUs (public)",
    bonus: "30% – 100% of base",
    searchQ: "CFO",
    description: "CFO compensation varies significantly by company stage, industry, and geography. Startup CFOs trade lower base salary for equity, while public company CFOs earn higher base with RSU packages.",
    levels: [
      { label: "VP Finance / Controller", range: "$120,000 – $200,000", description: "Pre-CFO senior finance leader at mid-size company." },
      { label: "CFO (Private Company)", range: "$180,000 – $320,000", description: "Full P&L ownership at a private company or PE-backed business." },
      { label: "CFO (Pre-IPO / Series B+)", range: "$200,000 – $350,000", description: "Preparing a company for IPO or major funding round." },
      { label: "CFO (Public Company)", range: "$300,000 – $600,000+", description: "Public company CFO with SEC reporting, investor relations." },
    ],
    topCompanies: ["Goldman Sachs", "McKinsey", "Blackstone", "KKR", "Sequoia-backed startups"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+35%" },
      { city: "New York City", premium: "+30%" },
      { city: "London", premium: "+20%" },
      { city: "Austin", premium: "+10%" },
      { city: "Chicago", premium: "+5%" },
    ],
    negotiationTips: [
      "Benchmark against public company proxy filings — they're public record.",
      "Equity is often more valuable than base at Series A–C companies.",
      "Ask about change-of-control provisions and acceleration clauses.",
      "Board relationships and investor access can be as valuable as salary.",
    ],
    factors: [
      "Company stage (startup vs. public)", "Industry (fintech, SaaS, PE-backed)", "Revenue size",
      "Equity vs. cash preference", "Geographic market", "PE/IPO readiness",
    ],
    related: ["coo", "vp-finance", "controller"],
  },
  {
    slug: "cto",
    title: "Chief Technology Officer",
    abbr: "CTO",
    dept: "Technology",
    baseRange: "$200,000 – $500,000",
    totalRange: "$300,000 – $1,200,000+",
    equity: "0.25% – 3% (startups) / RSUs (public)",
    bonus: "20% – 60% of base",
    searchQ: "CTO",
    description: "CTO salaries are among the highest in the C-suite, driven by talent scarcity. Big Tech CTOs earn significantly more through equity, while startup CTOs may trade base for larger equity stakes.",
    levels: [
      { label: "VP Engineering / Head of Engineering", range: "$160,000 – $280,000", description: "Senior engineering leader managing multiple teams." },
      { label: "CTO (Startup, Seed–Series A)", range: "$130,000 – $220,000", description: "Founding or early-stage CTO with large equity upside." },
      { label: "CTO (Series B–D)", range: "$220,000 – $380,000", description: "Scaling engineering organisation through rapid growth." },
      { label: "CTO (Public / Large Enterprise)", range: "$350,000 – $600,000+", description: "Public company or enterprise CTO with full technology P&L." },
    ],
    topCompanies: ["Google", "Meta", "Apple", "OpenAI", "Stripe", "Databricks"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+50%" },
      { city: "Seattle", premium: "+35%" },
      { city: "New York City", premium: "+25%" },
      { city: "London", premium: "+20%" },
      { city: "Berlin", premium: "+5%" },
    ],
    negotiationTips: [
      "Negotiate vesting cliff and acceleration separately from base.",
      "Ask about preferred stock vs. common stock for options.",
      "At Big Tech, the equity refresh cycle matters as much as the initial grant.",
      "Level inflation is common — benchmark by scope and team size, not title.",
    ],
    factors: [
      "AI/ML expertise premium (currently +20–40%)", "Stack (AI companies pay more)", "Company stage",
      "Team size managed", "Geographic market", "Equity stake vs. cash balance",
    ],
    related: ["ceo", "head-of-engineering", "head-of-ai"],
  },
  {
    slug: "coo",
    title: "Chief Operating Officer",
    abbr: "COO",
    dept: "Operations",
    baseRange: "$170,000 – $450,000",
    totalRange: "$250,000 – $850,000+",
    equity: "0.1% – 1.5% (startups)",
    bonus: "30% – 80% of base",
    searchQ: "COO",
    description: "COO compensation is closely tied to company revenue and operational complexity. PE-backed COOs often have significant carry exposure, while startup COOs prioritise equity.",
    levels: [
      { label: "Director of Operations", range: "$100,000 – $160,000", description: "Senior ops leader managing a function or region." },
      { label: "COO (Startup / Scale-up)", range: "$150,000 – $260,000", description: "Early-stage COO building operations from the ground up." },
      { label: "COO (PE-backed / Mid-Market)", range: "$220,000 – $380,000", description: "PE portfolio company COO focused on value creation." },
      { label: "COO (Large Enterprise)", range: "$300,000 – $550,000+", description: "Enterprise COO with complex multi-division remit." },
    ],
    topCompanies: ["Amazon", "Palantir", "Airbnb", "DoorDash", "Warburg Pincus portfolio"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+30%" },
      { city: "New York City", premium: "+25%" },
      { city: "London", premium: "+20%" },
      { city: "Chicago", premium: "+10%" },
      { city: "Boston", premium: "+10%" },
    ],
    negotiationTips: [
      "COO scope varies widely — negotiate based on P&L size, not just title.",
      "Ask about equity vs. LTIP structure in PE-backed companies.",
      "Board observer rights are a common COO perk worth asking about.",
      "Bonus tied to EBITDA targets — understand the formula before signing.",
    ],
    factors: [
      "Revenue size of operation", "Number of employees managed", "PE vs. startup vs. public",
      "International scope", "Industry complexity", "Geographic market",
    ],
    related: ["ceo", "cfo", "vp-operations"],
  },
  {
    slug: "cmo",
    title: "Chief Marketing Officer",
    abbr: "CMO",
    dept: "Marketing",
    baseRange: "$160,000 – $400,000",
    totalRange: "$220,000 – $750,000+",
    equity: "0.1% – 1% (startups)",
    bonus: "25% – 60% of base",
    searchQ: "CMO",
    description: "CMO compensation is performance-driven, with pipeline generation and revenue attribution increasingly tied to bonus. Product-led growth companies often pay CMOs closer to engineering leaders.",
    levels: [
      { label: "VP Marketing", range: "$130,000 – $220,000", description: "Senior marketing leader managing a team and budget." },
      { label: "CMO (Startup / Series A–B)", range: "$150,000 – $250,000", description: "First CMO hire building the marketing function." },
      { label: "CMO (Series C – Pre-IPO)", range: "$220,000 – $350,000", description: "Scaling marketing to support significant revenue growth." },
      { label: "CMO (Enterprise / Public)", range: "$280,000 – $500,000+", description: "Enterprise CMO with global brand and demand-gen remit." },
    ],
    topCompanies: ["Salesforce", "HubSpot", "Canva", "Figma", "Shopify"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+30%" },
      { city: "New York City", premium: "+25%" },
      { city: "London", premium: "+15%" },
      { city: "Los Angeles", premium: "+10%" },
      { city: "Sydney", premium: "+5%" },
    ],
    negotiationTips: [
      "Tie bonus structure to pipeline, not just brand metrics.",
      "Ensure you have budget authority — not just title — before accepting.",
      "Ask about tech stack and MarTech budget; constrained budgets limit your impact.",
      "Equity acceleration on acquisition is critical for CMOs joining pre-exit.",
    ],
    factors: [
      "B2B vs. B2C focus", "PLG vs. sales-led motion", "Brand vs. demand-gen split",
      "Revenue attribution model", "Company stage", "Geographic market",
    ],
    related: ["cro", "vp-marketing", "head-of-growth"],
  },
  {
    slug: "cro",
    title: "Chief Revenue Officer",
    abbr: "CRO",
    dept: "Sales",
    baseRange: "$180,000 – $420,000",
    totalRange: "$300,000 – $900,000+",
    equity: "0.1% – 1.5%",
    bonus: "50% – 150% of base (OTE)",
    searchQ: "CRO Chief Revenue Officer",
    description: "CROs are typically the highest-earning C-suite executives in SaaS companies due to variable compensation tied to ARR growth. OTE packages can significantly exceed base when quotas are exceeded.",
    levels: [
      { label: "VP Sales", range: "$150,000 – $250,000", description: "Senior sales leader managing a quota-carrying team." },
      { label: "CRO (Early Stage)", range: "$160,000 – $280,000", description: "First sales/revenue leader building GTM from scratch." },
      { label: "CRO (Series B–D SaaS)", range: "$220,000 – $400,000", description: "Scaling revenue from $5M to $50M+ ARR." },
      { label: "CRO (Enterprise / Pre-IPO)", range: "$300,000 – $550,000+", description: "Running full revenue function at a large SaaS or tech company." },
    ],
    topCompanies: ["Salesforce", "HubSpot", "Gong", "Outreach", "Snowflake"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+35%" },
      { city: "New York City", premium: "+30%" },
      { city: "Chicago", premium: "+10%" },
      { city: "Boston", premium: "+10%" },
      { city: "London", premium: "+15%" },
    ],
    negotiationTips: [
      "OTE is more important than base — negotiate the ratio and cap carefully.",
      "Ask about ramp quota periods (typically 3–6 months).",
      "Understand what counts toward quota — new ARR only, or expansions too?",
      "Equity vesting accelerated by revenue milestones is increasingly common.",
    ],
    factors: [
      "ARR size and growth rate", "Sales motion (enterprise vs. SMB)", "Market (SaaS premium is real)",
      "OTE split ratio", "Ramp structure", "Company stage and growth trajectory",
    ],
    related: ["cmo", "vp-sales", "head-of-sales"],
  },
  {
    slug: "chro",
    title: "Chief Human Resources Officer",
    abbr: "CHRO",
    dept: "HR",
    baseRange: "$160,000 – $400,000",
    totalRange: "$220,000 – $700,000+",
    equity: "0.1% – 0.8%",
    bonus: "25% – 50% of base",
    searchQ: "CHRO Chief Human Resources Officer",
    description: "CHRO compensation has risen sharply post-2020 as talent became a strategic priority. CHROs at high-growth tech companies now earn close to CFOs, particularly where people costs dominate the P&L.",
    levels: [
      { label: "VP People / VP HR", range: "$130,000 – $210,000", description: "Senior HR leader managing the people function." },
      { label: "CHRO (Startup / Scale-up)", range: "$160,000 – $270,000", description: "First CHRO hire shaping culture and people systems." },
      { label: "CHRO (Mid-Market)", range: "$200,000 – $320,000", description: "CHRO managing HR for 500–5,000 person organisation." },
      { label: "CHRO (Large Enterprise)", range: "$280,000 – $500,000+", description: "Enterprise CHRO with global workforce responsibility." },
    ],
    topCompanies: ["LinkedIn", "Workday", "ServiceNow", "Stripe", "McKinsey"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+30%" },
      { city: "New York City", premium: "+25%" },
      { city: "London", premium: "+15%" },
      { city: "Seattle", premium: "+20%" },
      { city: "Chicago", premium: "+5%" },
    ],
    negotiationTips: [
      "Ask for a seat at the executive table — not just HR advisory access.",
      "LTIP vesting tied to employee retention metrics is increasingly common.",
      "Negotiate budget authority for L&D and comp bench programmes upfront.",
      "Ensure your scope includes total rewards, not just HR operations.",
    ],
    factors: [
      "Company headcount and growth rate", "Remote vs. on-site complexity", "Workforce type (tech vs. hourly)",
      "Geographic footprint", "M&A integration experience premium", "Company stage",
    ],
    related: ["coo", "ceo", "vp-people"],
  },
  {
    slug: "cpo",
    title: "Chief Product Officer",
    abbr: "CPO",
    dept: "Product",
    baseRange: "$180,000 – $450,000",
    totalRange: "$280,000 – $950,000+",
    equity: "0.2% – 2%",
    bonus: "20% – 50% of base",
    searchQ: "CPO Chief Product Officer",
    description: "CPO salaries have soared in the AI era. Product leaders who can drive AI-native product strategy command significant premiums, particularly at consumer and SaaS companies where product IS the moat.",
    levels: [
      { label: "Director of Product / VP Product", range: "$160,000 – $260,000", description: "Senior PM leader managing product teams and roadmap." },
      { label: "CPO (Series A–B)", range: "$180,000 – $300,000", description: "First product leader defining the product strategy." },
      { label: "CPO (Series C–D)", range: "$240,000 – $400,000", description: "Scaling product organisation through rapid user growth." },
      { label: "CPO (Public / Platform)", range: "$320,000 – $600,000+", description: "Platform CPO responsible for multiple product lines." },
    ],
    topCompanies: ["Apple", "Google", "Airbnb", "Linear", "Notion", "Figma"],
    topLocations: [
      { city: "San Francisco / Bay Area", premium: "+45%" },
      { city: "Seattle", premium: "+30%" },
      { city: "New York City", premium: "+25%" },
      { city: "London", premium: "+20%" },
      { city: "Amsterdam", premium: "+10%" },
    ],
    negotiationTips: [
      "AI product experience commands a 20–40% premium right now — leverage it.",
      "Ask for equity tied to product milestones, not just time vesting.",
      "Platform scope (multiple products vs. one) matters greatly for comp.",
      "RSU refresh cadence at public companies often exceeds the initial grant.",
    ],
    factors: [
      "AI/ML product experience", "B2B vs. consumer product", "Platform vs. single product scope",
      "Company revenue and growth", "Public vs. private", "Geographic market",
    ],
    related: ["cto", "ceo", "head-of-product"],
  },
  {
    slug: "ciso",
    title: "Chief Information Security Officer",
    abbr: "CISO",
    dept: "Security",
    baseRange: "$200,000 – $500,000",
    totalRange: "$280,000 – $900,000+",
    equity: "0.1% – 1%",
    bonus: "20% – 50% of base",
    searchQ: "CISO",
    description: "CISO compensation has surged following high-profile breaches. Personal liability concerns and talent scarcity mean top CISOs now command packages rivalling CFOs, especially in financial services and healthcare.",
    levels: [
      { label: "Head of Security / VP Security", range: "$160,000 – $260,000", description: "Senior security leader managing the security programme." },
      { label: "CISO (Mid-Market)", range: "$200,000 – $320,000", description: "CISO responsible for security at a 500–5,000 person company." },
      { label: "CISO (Enterprise)", range: "$280,000 – $500,000", description: "Large enterprise CISO with global security remit." },
      { label: "CISO (Regulated / Financial Services)", range: "$350,000 – $700,000+", description: "CISO in a bank, insurer, or healthcare system." },
    ],
    topCompanies: ["JPMorgan", "Goldman Sachs", "Microsoft", "Google", "CrowdStrike"],
    topLocations: [
      { city: "New York City", premium: "+35%" },
      { city: "San Francisco / Bay Area", premium: "+30%" },
      { city: "Washington DC", premium: "+20%" },
      { city: "London", premium: "+25%" },
      { city: "Chicago", premium: "+10%" },
    ],
    negotiationTips: [
      "Negotiate D&O (Directors & Officers) insurance coverage — personal liability is real.",
      "Ask about the board reporting structure — you want direct board access.",
      "Security budget authority matters as much as salary.",
      "Clearance and regulatory certifications can add 15–25% to your market rate.",
    ],
    factors: [
      "Industry (financial services premium is significant)", "Regulatory environment",
      "Security clearance", "Breach history and risk exposure", "Board reporting access",
      "Geographic market",
    ],
    related: ["cto", "head-of-cybersecurity", "head-of-information-security"],
  },
];

export const SALARY_ROLE_SLUGS = SALARY_ROLES.map(r => r.slug);

export function getSalaryRoleBySlug(slug: string): SalaryRole | undefined {
  return SALARY_ROLES.find(r => r.slug === slug);
}
