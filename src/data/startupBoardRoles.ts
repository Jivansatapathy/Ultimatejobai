export interface SpecialRole {
  slug: string;
  title: string;
  abbr?: string;
  searchQ: string;
  description: string;
  salary: string;
  responsibilities: string[];
  skills: string[];
  related: string[];
  category: "startup" | "board" | "investor";
}

// ─── Startup Roles ────────────────────────────────────────────────────────────
export const STARTUP_ROLES: SpecialRole[] = [
  {
    slug: "ceo",
    title: "Startup CEO",
    searchQ: "Startup CEO",
    category: "startup",
    description:
      "The Startup CEO sets the vision, builds the team, and drives the company from zero to growth. Unlike corporate CEOs, startup CEOs wear many hats — fundraising, product, sales, hiring, and culture — all at once.",
    salary: "$80,000 – $250,000 + equity",
    responsibilities: [
      "Define product vision and company strategy",
      "Lead fundraising rounds (pre-seed to Series B and beyond)",
      "Build and hire the founding team",
      "Drive early sales and customer development",
      "Represent the company to investors and media",
      "Set culture and values from day one",
    ],
    skills: ["Fundraising", "Product Vision", "Team Building", "Sales", "Storytelling", "Execution"],
    related: ["cto", "coo", "cfo"],
  },
  {
    slug: "cto",
    title: "Startup CTO",
    searchQ: "Startup CTO",
    category: "startup",
    description:
      "The Startup CTO builds the product from scratch, makes early technology decisions, and leads the engineering team. In early-stage companies the CTO often writes code alongside setting technical strategy.",
    salary: "$100,000 – $280,000 + equity",
    responsibilities: [
      "Make foundational technology and architecture decisions",
      "Build the MVP and iterate fast based on user feedback",
      "Hire and lead the engineering team",
      "Balance technical debt with speed of delivery",
      "Partner with CEO on product roadmap",
      "Represent technical vision to investors",
    ],
    skills: ["Software Architecture", "Full-Stack Development", "Hiring", "Product Sense", "Cloud Infrastructure"],
    related: ["ceo", "head-of-engineering", "head-of-ai"],
  },
  {
    slug: "cfo",
    title: "Startup CFO",
    searchQ: "Startup CFO",
    category: "startup",
    description:
      "The Startup CFO manages finances, prepares the company for fundraising, and builds the financial infrastructure. Early-stage startup CFOs focus on runway management, investor reporting, and preparing for VC due diligence.",
    salary: "$90,000 – $220,000 + equity",
    responsibilities: [
      "Manage cash flow and extend runway",
      "Build financial models for fundraising",
      "Lead investor relations and reporting",
      "Set up accounting, payroll, and compliance",
      "Support M&A and secondary transactions",
      "Advise CEO on burn rate and growth investments",
    ],
    skills: ["Financial Modelling", "Fundraising", "FP&A", "Investor Relations", "Runway Management"],
    related: ["ceo", "coo", "vp-finance"],
  },
  {
    slug: "coo",
    title: "Startup COO",
    searchQ: "Startup COO",
    category: "startup",
    description:
      "The Startup COO turns the CEO's vision into operational reality. They build processes, manage teams, and ensure the company can scale without breaking. Often the first operational hire after the founding team.",
    salary: "$90,000 – $220,000 + equity",
    responsibilities: [
      "Build operational processes and playbooks",
      "Manage cross-functional teams and delivery",
      "Own OKRs and company performance tracking",
      "Hire and scale the team as the company grows",
      "Coordinate between product, engineering, and GTM",
    ],
    skills: ["Operations", "Process Building", "Team Management", "OKRs", "Scaling"],
    related: ["ceo", "cfo", "head-of-operations"],
  },
  {
    slug: "cmo",
    title: "Startup CMO",
    searchQ: "Startup CMO",
    category: "startup",
    description:
      "The Startup CMO builds the brand, drives demand generation, and acquires the first customers. At early stage they do hands-on work; at growth stage they build and lead a marketing team.",
    salary: "$90,000 – $200,000 + equity",
    responsibilities: [
      "Define the brand identity and go-to-market strategy",
      "Drive early customer acquisition across channels",
      "Build content, SEO, paid, and community programmes",
      "Own pipeline generation and marketing metrics",
      "Partner with sales on ICP and messaging",
    ],
    skills: ["Brand Strategy", "Demand Generation", "Growth Marketing", "Content", "Paid Media"],
    related: ["ceo", "cro", "head-of-sales"],
  },
  {
    slug: "cro",
    title: "Startup CRO",
    searchQ: "Startup CRO",
    category: "startup",
    description:
      "The Startup Chief Revenue Officer owns all revenue — sales, marketing, and customer success. Common at Series A+ stage when the company needs to scale from founder-led sales to a repeatable revenue engine.",
    salary: "$120,000 – $260,000 + equity",
    responsibilities: [
      "Build the first sales team and process",
      "Create and execute GTM playbooks",
      "Own revenue targets and forecasting",
      "Align marketing and sales on pipeline",
      "Drive customer success and expansion revenue",
    ],
    skills: ["Revenue Growth", "Sales Leadership", "GTM Strategy", "Pipeline Management", "CRM"],
    related: ["ceo", "cmo", "vp-sales"],
  },
  {
    slug: "founding-engineer",
    title: "Founding Engineer",
    searchQ: "Founding Engineer",
    category: "startup",
    description:
      "Founding Engineers are the first engineers at a startup — they build the core product, shape the technical culture, and often receive significant equity. They work closely with the CTO and founders to go from idea to product.",
    salary: "$100,000 – $220,000 + equity",
    responsibilities: [
      "Build the core product from scratch",
      "Make early architecture decisions with long-term impact",
      "Wear many hats — front-end, back-end, infra, DevOps",
      "Help hire and shape the early engineering team",
      "Work directly with founders on product decisions",
    ],
    skills: ["Full-Stack", "Systems Design", "Fast Delivery", "Product Sense", "Adaptability"],
    related: ["cto", "head-of-engineering"],
  },
  {
    slug: "startup-advisor",
    title: "Startup Advisor",
    searchQ: "Startup Advisor",
    category: "startup",
    description:
      "Startup Advisors provide strategic guidance to founders in exchange for equity (typically 0.1–0.5%). They offer domain expertise, introductions, and mentorship without the commitment of a full-time role.",
    salary: "Equity-based (0.1% – 0.5%)",
    responsibilities: [
      "Provide strategic advice on product, GTM, or fundraising",
      "Make introductions to investors, customers, and talent",
      "Review and give feedback on pitch decks and strategy",
      "Attend monthly or quarterly advisory sessions",
      "Lend credibility to the founding team",
    ],
    skills: ["Domain Expertise", "Networking", "Strategic Thinking", "Mentorship"],
    related: ["ceo", "board-member"],
  },
  {
    slug: "co-founder",
    title: "Co-Founder",
    searchQ: "Co-Founder",
    category: "startup",
    description:
      "Co-founders build a company from the ground up alongside the founding CEO. They take on a specific domain (technical, product, operations, commercial) and co-own the business through equity.",
    salary: "Equity-based (5% – 40%)",
    responsibilities: [
      "Co-own company strategy and direction",
      "Lead a specific function (CTO, CPO, CMO, etc.)",
      "Fundraise and recruit alongside the CEO",
      "Build company culture and values",
      "Make key product and business decisions",
    ],
    skills: ["Entrepreneurship", "Domain Expertise", "Leadership", "Resilience", "Vision"],
    related: ["ceo", "cto", "coo"],
  },
];

// ─── Board Roles ───────────────────────────────────────────────────────────────
export const BOARD_ROLES: SpecialRole[] = [
  {
    slug: "board-member",
    title: "Board Member",
    searchQ: "Board Member",
    category: "board",
    description:
      "Board Members provide oversight, strategic guidance, and governance to a company. They are elected by shareholders and meet regularly to review performance, approve major decisions, and support executive leadership.",
    salary: "$50,000 – $250,000/yr + equity",
    responsibilities: [
      "Provide strategic oversight and governance",
      "Review company performance against targets",
      "Approve major financial and operational decisions",
      "Support CEO hiring and executive compensation",
      "Represent shareholder interests",
    ],
    skills: ["Corporate Governance", "Strategic Oversight", "Financial Acumen", "Leadership", "Risk Management"],
    related: ["board-chair", "board-advisor", "independent-director"],
  },
  {
    slug: "board-chair",
    title: "Board Chair",
    searchQ: "Board Chair",
    category: "board",
    description:
      "The Board Chair leads the board of directors, facilitates meetings, and ensures effective governance. They serve as the link between the board and executive management and often play a role in major strategic decisions.",
    salary: "$80,000 – $350,000/yr",
    responsibilities: [
      "Lead and facilitate board meetings",
      "Set the board agenda and priorities",
      "Build effective relationships with the CEO",
      "Ensure the board fulfils its governance duties",
      "Lead CEO performance reviews and succession planning",
    ],
    skills: ["Corporate Governance", "Leadership", "Stakeholder Management", "Strategic Thinking"],
    related: ["board-member", "independent-director"],
  },
  {
    slug: "independent-director",
    title: "Independent Director",
    searchQ: "Independent Director",
    category: "board",
    description:
      "Independent Directors are non-executive board members with no material relationship with the company. They provide unbiased oversight and are critical for audit, compensation, and nomination committees.",
    salary: "$40,000 – $200,000/yr + equity",
    responsibilities: [
      "Provide independent perspective on strategic decisions",
      "Chair or serve on board committees (Audit, Compensation)",
      "Challenge executive management where necessary",
      "Represent minority shareholder interests",
      "Ensure compliance with regulations and best practices",
    ],
    skills: ["Corporate Governance", "Financial Literacy", "Independence", "Critical Thinking", "Industry Expertise"],
    related: ["board-member", "board-chair"],
  },
  {
    slug: "board-advisor",
    title: "Board Advisor",
    searchQ: "Board Advisor",
    category: "board",
    description:
      "Board Advisors provide expert guidance to the board and executive team. Unlike directors, they don't have fiduciary responsibilities but offer domain expertise, networks, and strategic counsel.",
    salary: "Equity or retainer ($30,000 – $120,000/yr)",
    responsibilities: [
      "Advise the board and leadership on specific domains",
      "Provide industry, regulatory, or technical expertise",
      "Support strategic planning sessions",
      "Make key introductions and open doors",
      "Attend advisory board meetings quarterly",
    ],
    skills: ["Domain Expertise", "Strategic Advisory", "Networking", "Communication"],
    related: ["board-member", "startup-advisor"],
  },
  {
    slug: "audit-committee-chair",
    title: "Audit Committee Chair",
    searchQ: "Audit Committee Chair",
    category: "board",
    description:
      "The Audit Committee Chair oversees financial reporting, internal controls, and the audit process. They work closely with the CFO, internal auditors, and external auditors to ensure financial integrity.",
    salary: "$60,000 – $200,000/yr",
    responsibilities: [
      "Chair audit committee meetings",
      "Oversee external and internal audit processes",
      "Review financial statements and risk disclosures",
      "Manage relationship with external auditors",
      "Ensure compliance with accounting standards",
    ],
    skills: ["Financial Expertise", "Audit", "GAAP / IFRS", "Risk Management", "Corporate Governance"],
    related: ["board-member", "independent-director"],
  },
];

// ─── Investor / PE Roles ───────────────────────────────────────────────────────
export const INVESTOR_ROLES: SpecialRole[] = [
  {
    slug: "managing-partner",
    title: "Managing Partner",
    searchQ: "Managing Partner",
    category: "investor",
    description:
      "The Managing Partner leads a venture capital or private equity firm, making investment decisions, managing the fund, and supporting portfolio companies. They raise capital from LPs and deploy it across investments.",
    salary: "$300,000 – $1,000,000+ (base + carry)",
    responsibilities: [
      "Lead investment strategy and deal sourcing",
      "Raise capital from limited partners (LPs)",
      "Make final investment decisions",
      "Sit on portfolio company boards",
      "Manage and mentor the investment team",
    ],
    skills: ["Venture Capital", "Deal Sourcing", "Portfolio Management", "LP Relations", "Financial Analysis"],
    related: ["general-partner", "venture-partner", "operating-partner"],
  },
  {
    slug: "general-partner",
    title: "General Partner",
    searchQ: "General Partner VC",
    category: "investor",
    description:
      "General Partners manage a VC or PE fund, source and evaluate deals, and support portfolio companies post-investment. They earn management fees and carried interest on returns.",
    salary: "$200,000 – $800,000 (base + carry)",
    responsibilities: [
      "Source, evaluate, and execute investment deals",
      "Lead due diligence on potential investments",
      "Represent the firm on portfolio company boards",
      "Build relationships with founders and co-investors",
      "Report fund performance to LPs",
    ],
    skills: ["Deal Evaluation", "Due Diligence", "Portfolio Support", "Financial Modelling", "Networking"],
    related: ["managing-partner", "venture-partner"],
  },
  {
    slug: "venture-partner",
    title: "Venture Partner",
    searchQ: "Venture Partner",
    category: "investor",
    description:
      "Venture Partners work with a VC firm on a part-time or deal-by-deal basis, sourcing investments in their area of expertise and often supporting portfolio companies as advisors or operators.",
    salary: "Deal-based carry + retainer ($80,000 – $300,000)",
    responsibilities: [
      "Source deals in a specific sector or geography",
      "Lead or co-lead select investments",
      "Advise and support portfolio companies",
      "Represent the firm at industry events",
      "Mentor founders in their domain",
    ],
    skills: ["Domain Expertise", "Deal Sourcing", "Founder Relationships", "Strategic Advisory"],
    related: ["general-partner", "managing-partner", "operating-partner"],
  },
  {
    slug: "operating-partner",
    title: "Operating Partner",
    searchQ: "Operating Partner PE",
    category: "investor",
    description:
      "Operating Partners at PE firms work hands-on with portfolio companies to improve operations, drive growth, and create value. They typically have deep C-suite operating experience and parachute into companies post-acquisition.",
    salary: "$250,000 – $700,000 + carried interest",
    responsibilities: [
      "Work directly with portfolio company management teams",
      "Lead operational improvement initiatives (100-day plans)",
      "Drive cost reduction and revenue growth",
      "Recruit and replace C-suite executives as needed",
      "Report to PE sponsors on portfolio performance",
    ],
    skills: ["Operations", "Value Creation", "C-Suite Leadership", "PE Ecosystem", "Turnaround Management"],
    related: ["managing-partner", "portfolio-ceo", "portfolio-cfo"],
  },
  {
    slug: "portfolio-ceo",
    title: "Portfolio Company CEO",
    searchQ: "Portfolio Company CEO",
    category: "investor",
    description:
      "Portfolio Company CEOs lead PE or VC-backed companies, working closely with their investment sponsors to deliver growth and returns. They operate with board oversight and are expected to hit aggressive KPIs.",
    salary: "$200,000 – $600,000 + equity",
    responsibilities: [
      "Lead the portfolio company's strategy and operations",
      "Deliver financial performance against sponsor targets",
      "Work closely with PE/VC board and operating partners",
      "Build and manage the executive team",
      "Drive value creation initiatives for exit",
    ],
    skills: ["P&L Leadership", "PE Dynamics", "M&A", "Operational Excellence", "Board Relations"],
    related: ["portfolio-cfo", "operating-partner", "managing-partner"],
  },
  {
    slug: "portfolio-cfo",
    title: "Portfolio Company CFO",
    searchQ: "Portfolio Company CFO",
    category: "investor",
    description:
      "Portfolio Company CFOs manage the finances of PE or VC-backed companies, with a focus on reporting to investors, managing leverage, and preparing for exit. Deep PE/VC literacy is essential.",
    salary: "$180,000 – $450,000 + equity",
    responsibilities: [
      "Manage financial reporting to PE sponsors",
      "Oversee debt management and covenant compliance",
      "Support M&A and bolt-on acquisition analysis",
      "Prepare the company for exit (IPO or strategic sale)",
      "Lead FP&A and investor relations",
    ],
    skills: ["PE Finance", "Debt Management", "Exit Preparation", "Financial Reporting", "M&A"],
    related: ["portfolio-ceo", "operating-partner", "cfo"],
  },
  {
    slug: "private-equity-principal",
    title: "Private Equity Principal",
    searchQ: "Private Equity Principal",
    category: "investor",
    description:
      "PE Principals are senior deal professionals responsible for originating, executing, and monitoring investments. They lead deal teams and sit on portfolio company boards.",
    salary: "$200,000 – $500,000 (base + bonus + carry)",
    responsibilities: [
      "Lead deal origination and execution end-to-end",
      "Manage due diligence and investment committee presentations",
      "Sit on portfolio company boards",
      "Mentor junior deal team members",
      "Track and report on portfolio performance",
    ],
    skills: ["LBO Modelling", "Due Diligence", "Deal Execution", "Portfolio Monitoring", "Stakeholder Management"],
    related: ["managing-partner", "general-partner", "operating-partner"],
  },
  {
    slug: "growth-equity-partner",
    title: "Growth Equity Partner",
    searchQ: "Growth Equity",
    category: "investor",
    description:
      "Growth Equity Partners invest in high-growth companies at the Series B–D stage, helping them scale to market leadership. They provide capital and strategic support without taking majority control.",
    salary: "$250,000 – $700,000 + carry",
    responsibilities: [
      "Source and evaluate growth-stage investment opportunities",
      "Lead due diligence and term sheet negotiations",
      "Sit on portfolio company boards",
      "Support founders on GTM, hiring, and M&A strategy",
      "Report fund performance and manage LP relationships",
    ],
    skills: ["Growth Investing", "SaaS Metrics", "Due Diligence", "Founder Relationships", "Portfolio Support"],
    related: ["general-partner", "venture-partner", "managing-partner"],
  },
];

export function getStartupRoleBySlug(slug: string): SpecialRole | undefined {
  return STARTUP_ROLES.find(r => r.slug === slug);
}

export function getBoardRoleBySlug(slug: string): SpecialRole | undefined {
  return BOARD_ROLES.find(r => r.slug === slug);
}

export function getInvestorRoleBySlug(slug: string): SpecialRole | undefined {
  return INVESTOR_ROLES.find(r => r.slug === slug);
}
