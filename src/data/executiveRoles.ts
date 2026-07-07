export interface ExecRole {
  slug: string;
  title: string;
  abbr?: string;
  dept: "Finance" | "Technology" | "Sales" | "Marketing" | "Operations" | "HR" | "Legal" | "Security" | "Product";
  searchQ: string;
  description: string;
  salary: string;
  responsibilities: string[];
  skills: string[];
  related: string[];
}

export const EXEC_ROLES: ExecRole[] = [
  // ── Finance ──────────────────────────────────────────────────────────────
  {
    slug: "cfo",
    title: "Chief Financial Officer",
    abbr: "CFO",
    dept: "Finance",
    searchQ: "Chief Financial Officer",
    description:
      "The Chief Financial Officer (CFO) oversees all financial operations of an organisation, including financial planning, risk management, record-keeping, and financial reporting. CFOs partner with the CEO to drive strategic growth and ensure long-term fiscal health.",
    salary: "$180,000 – $450,000",
    responsibilities: [
      "Lead financial planning, budgeting, and forecasting",
      "Oversee audits, compliance, and regulatory reporting",
      "Manage investor relations and capital structure",
      "Drive M&A strategy and due diligence",
      "Partner with CEO and board on strategic decisions",
    ],
    skills: ["Financial Modelling", "FP&A", "GAAP / IFRS", "M&A", "Board Reporting", "Capital Markets"],
    related: ["controller", "vp-finance", "head-of-finance"],
  },
  {
    slug: "controller",
    title: "Controller",
    dept: "Finance",
    searchQ: "Controller",
    description:
      "The Controller manages the accounting department, ensures accurate financial reporting, and maintains internal controls. They are typically the top accounting officer in mid-size companies and report to the CFO in larger organisations.",
    salary: "$130,000 – $280,000",
    responsibilities: [
      "Manage monthly, quarterly, and annual close processes",
      "Oversee accounts payable and receivable",
      "Maintain internal controls and ensure GAAP compliance",
      "Prepare financial statements and reports for leadership",
      "Coordinate with external auditors",
    ],
    skills: ["GAAP", "General Ledger", "Financial Reporting", "NetSuite / SAP", "Audit Coordination", "Team Leadership"],
    related: ["cfo", "vp-finance", "head-of-finance"],
  },
  {
    slug: "vp-finance",
    title: "VP Finance",
    dept: "Finance",
    searchQ: "VP Finance",
    description:
      "The VP of Finance leads the finance function, developing financial strategies and supporting executive decision-making. They are responsible for FP&A, financial modeling, and ensuring business performance against targets.",
    salary: "$150,000 – $300,000",
    responsibilities: [
      "Lead FP&A and long-range financial planning",
      "Manage financial reporting and investor reporting",
      "Develop financial models for business decisions",
      "Oversee treasury and cash management",
      "Support M&A and strategic initiatives",
    ],
    skills: ["FP&A", "Financial Modelling", "Excel / BI Tools", "Strategic Planning", "Investor Relations"],
    related: ["cfo", "controller", "head-of-finance"],
  },
  {
    slug: "head-of-finance",
    title: "Head of Finance",
    dept: "Finance",
    searchQ: "Head of Finance",
    description:
      "The Head of Finance is the senior finance leader in many organisations, responsible for all financial operations, planning, and reporting. The title is common in tech startups, scale-ups, and international subsidiaries.",
    salary: "$140,000 – $280,000",
    responsibilities: [
      "Oversee all financial operations end-to-end",
      "Manage budgeting, forecasting, and variance analysis",
      "Ensure tax and regulatory compliance across jurisdictions",
      "Build and lead the finance team",
      "Report financial performance to executive leadership",
    ],
    skills: ["FP&A", "Accounting", "Compliance", "People Management", "Reporting"],
    related: ["cfo", "controller", "vp-finance"],
  },

  // ── Technology ────────────────────────────────────────────────────────────
  {
    slug: "cto",
    title: "Chief Technology Officer",
    abbr: "CTO",
    dept: "Technology",
    searchQ: "Chief Technology Officer",
    description:
      "The Chief Technology Officer sets the technical vision and strategy for an organisation. CTOs lead engineering teams, drive product innovation, and ensure technology aligns with business goals.",
    salary: "$200,000 – $500,000",
    responsibilities: [
      "Define and drive the technology roadmap",
      "Lead engineering, data, and infrastructure teams",
      "Evaluate and adopt emerging technologies",
      "Ensure security, scalability, and reliability of systems",
      "Partner with CEO and CPO on product strategy",
    ],
    skills: ["System Architecture", "Engineering Leadership", "Cloud Infrastructure", "AI/ML", "Product Strategy", "Hiring"],
    related: ["cio", "head-of-engineering", "head-of-ai"],
  },
  {
    slug: "cio",
    title: "Chief Information Officer",
    abbr: "CIO",
    dept: "Technology",
    searchQ: "Chief Information Officer",
    description:
      "The Chief Information Officer manages the information technology strategy and operations of an organisation. CIOs focus on IT systems, digital transformation, data governance, and enterprise technology.",
    salary: "$180,000 – $400,000",
    responsibilities: [
      "Define IT strategy and digital transformation roadmap",
      "Oversee enterprise systems, infrastructure, and cybersecurity",
      "Manage IT budget and vendor relationships",
      "Drive data governance and analytics capabilities",
      "Align IT investments with business objectives",
    ],
    skills: ["IT Strategy", "Digital Transformation", "ERP Systems", "Cybersecurity", "Cloud", "Vendor Management"],
    related: ["cto", "ciso", "head-of-technology"],
  },
  {
    slug: "head-of-engineering",
    title: "Head of Engineering",
    dept: "Technology",
    searchQ: "Head of Engineering",
    description:
      "The Head of Engineering leads software engineering teams, sets engineering standards, and is responsible for delivery, quality, and technical excellence. This role is common in product-led technology companies.",
    salary: "$160,000 – $350,000",
    responsibilities: [
      "Lead and grow engineering teams",
      "Set engineering standards, processes, and culture",
      "Drive technical roadmap and delivery cadence",
      "Partner with product and design on features",
      "Hire and retain top engineering talent",
    ],
    skills: ["Engineering Management", "Software Architecture", "Agile / Scrum", "Hiring", "Delivery"],
    related: ["cto", "head-of-ai", "head-of-devops"],
  },
  {
    slug: "head-of-ai",
    title: "Head of AI",
    dept: "Technology",
    searchQ: "Head of AI",
    description:
      "The Head of AI leads artificial intelligence and machine learning strategy and implementation. This emerging executive role is in high demand as companies integrate AI into their core products and operations.",
    salary: "$180,000 – $400,000",
    responsibilities: [
      "Define AI/ML strategy and roadmap",
      "Build and lead data science and ML engineering teams",
      "Identify high-impact AI use cases across the business",
      "Ensure responsible and ethical AI practices",
      "Partner with product and engineering on AI features",
    ],
    skills: ["Machine Learning", "LLMs", "Python", "MLOps", "Team Leadership", "Strategy"],
    related: ["cto", "head-of-data", "head-of-engineering"],
  },
  {
    slug: "head-of-data",
    title: "Head of Data",
    dept: "Technology",
    searchQ: "Head of Data",
    description:
      "The Head of Data leads data strategy, data engineering, analytics, and data governance. They ensure the organisation can make data-driven decisions and that data infrastructure is reliable and scalable.",
    salary: "$150,000 – $320,000",
    responsibilities: [
      "Define data strategy and governance framework",
      "Build and lead data engineering and analytics teams",
      "Oversee data warehouse, lake, and pipeline architecture",
      "Drive a data-driven culture across the business",
      "Partner with product and business on analytics needs",
    ],
    skills: ["Data Engineering", "SQL", "dbt", "Data Warehousing", "Analytics", "Team Leadership"],
    related: ["head-of-ai", "cto", "cio"],
  },
  {
    slug: "head-of-devops",
    title: "Head of DevOps",
    dept: "Technology",
    searchQ: "Head of DevOps",
    description:
      "The Head of DevOps leads the platform and DevOps engineering function, responsible for CI/CD, cloud infrastructure, reliability, and developer productivity.",
    salary: "$140,000 – $280,000",
    responsibilities: [
      "Lead DevOps and platform engineering teams",
      "Define and drive CI/CD and deployment strategy",
      "Manage cloud infrastructure (AWS / GCP / Azure)",
      "Improve developer experience and productivity",
      "Ensure system reliability, uptime, and incident response",
    ],
    skills: ["Kubernetes", "CI/CD", "Terraform", "AWS / GCP", "SRE", "Team Leadership"],
    related: ["cto", "head-of-engineering", "ciso"],
  },
  {
    slug: "ciso",
    title: "Chief Information Security Officer",
    abbr: "CISO",
    dept: "Security",
    searchQ: "Chief Information Security Officer",
    description:
      "The CISO is responsible for establishing and maintaining the enterprise vision, strategy, and programme to ensure information assets and technology are adequately protected.",
    salary: "$180,000 – $400,000",
    responsibilities: [
      "Define and execute cybersecurity strategy",
      "Manage security operations and incident response",
      "Ensure compliance with SOC 2, ISO 27001, GDPR, etc.",
      "Lead security awareness and training programmes",
      "Report risk posture to board and executive leadership",
    ],
    skills: ["Cybersecurity", "Risk Management", "Compliance", "SOC 2", "SIEM", "Cloud Security"],
    related: ["cio", "cto", "head-of-devops"],
  },

  // ── Sales ────────────────────────────────────────────────────────────────
  {
    slug: "cro",
    title: "Chief Revenue Officer",
    abbr: "CRO",
    dept: "Sales",
    searchQ: "Chief Revenue Officer",
    description:
      "The Chief Revenue Officer is responsible for all revenue-generating processes in an organisation, aligning sales, marketing, and customer success to drive predictable, scalable growth.",
    salary: "$180,000 – $450,000",
    responsibilities: [
      "Own revenue targets and GTM strategy",
      "Lead sales, marketing, and customer success alignment",
      "Build and scale revenue processes and playbooks",
      "Drive pipeline generation and forecast accuracy",
      "Partner with CEO and board on growth strategy",
    ],
    skills: ["Revenue Growth", "Sales Leadership", "GTM Strategy", "CRM (Salesforce)", "Pipeline Management"],
    related: ["vp-sales", "head-of-sales", "cmo"],
  },
  {
    slug: "vp-sales",
    title: "VP Sales",
    dept: "Sales",
    searchQ: "VP Sales",
    description:
      "The VP of Sales leads the sales organisation, sets sales strategy, manages sales teams, and is accountable for hitting revenue targets across enterprise, mid-market, or SMB segments.",
    salary: "$150,000 – $350,000",
    responsibilities: [
      "Lead and scale sales teams across segments",
      "Set and execute sales strategy and territories",
      "Drive pipeline generation and deal progression",
      "Develop sales playbooks and processes",
      "Recruit, coach, and retain top sales talent",
    ],
    skills: ["Sales Leadership", "Pipeline Management", "Salesforce", "Enterprise Sales", "Coaching"],
    related: ["cro", "head-of-sales", "cmo"],
  },
  {
    slug: "head-of-sales",
    title: "Head of Sales",
    dept: "Sales",
    searchQ: "Head of Sales",
    description:
      "The Head of Sales leads the sales function in growth-stage and scale-up companies. They are responsible for building the sales team, developing processes, and hitting revenue targets.",
    salary: "$130,000 – $280,000",
    responsibilities: [
      "Build and lead the sales team from the ground up",
      "Develop and iterate on the sales process",
      "Manage the full sales cycle and key accounts",
      "Set quotas and performance standards",
      "Collaborate with marketing on lead generation",
    ],
    skills: ["Sales Management", "Outbound / Inbound Sales", "CRM", "Pipeline Building", "Coaching"],
    related: ["vp-sales", "cro", "cmo"],
  },

  // ── Marketing ────────────────────────────────────────────────────────────
  {
    slug: "cmo",
    title: "Chief Marketing Officer",
    abbr: "CMO",
    dept: "Marketing",
    searchQ: "Chief Marketing Officer",
    description:
      "The Chief Marketing Officer leads all marketing activities, building brand awareness, demand generation, and customer acquisition. The CMO partners closely with the CEO and CRO to align marketing with revenue goals.",
    salary: "$160,000 – $400,000",
    responsibilities: [
      "Define and execute the overall marketing strategy",
      "Lead brand, demand generation, and content teams",
      "Own marketing budget and ROI across channels",
      "Drive customer acquisition and retention programmes",
      "Partner with sales on GTM and pipeline",
    ],
    skills: ["Brand Strategy", "Demand Generation", "Digital Marketing", "Content", "Analytics", "Budget Management"],
    related: ["cro", "vp-sales", "director-of-marketing"],
  },
  {
    slug: "director-of-marketing",
    title: "Director of Marketing",
    dept: "Marketing",
    searchQ: "Director of Marketing",
    description:
      "The Director of Marketing manages marketing programmes, campaigns, and teams. They execute on the marketing strategy set by the CMO and are often hands-on across channels including digital, events, and content.",
    salary: "$110,000 – $220,000",
    responsibilities: [
      "Execute marketing campaigns across digital and offline channels",
      "Manage and grow the marketing team",
      "Track and report on KPIs and marketing ROI",
      "Coordinate with sales on lead quality and pipeline",
      "Manage agencies, vendors, and marketing tech stack",
    ],
    skills: ["Campaign Management", "SEO / SEM", "Marketing Automation", "Analytics", "Team Leadership"],
    related: ["cmo", "cro", "head-of-sales"],
  },

  // ── Operations ───────────────────────────────────────────────────────────
  {
    slug: "coo",
    title: "Chief Operating Officer",
    abbr: "COO",
    dept: "Operations",
    searchQ: "Chief Operating Officer",
    description:
      "The Chief Operating Officer is responsible for the day-to-day operations of the company. The COO implements the CEO's vision, optimises business processes, and ensures the organisation runs efficiently and scales effectively.",
    salary: "$180,000 – $450,000",
    responsibilities: [
      "Oversee day-to-day business operations",
      "Implement strategic initiatives from the CEO",
      "Optimise processes and organisational structure",
      "Lead cross-functional teams and departments",
      "Drive operational KPIs and performance culture",
    ],
    skills: ["Operations Management", "Process Optimisation", "P&L Management", "Cross-functional Leadership", "Scaling"],
    related: ["cfo", "head-of-operations", "director-of-operations"],
  },
  {
    slug: "head-of-operations",
    title: "Head of Operations",
    dept: "Operations",
    searchQ: "Head of Operations",
    description:
      "The Head of Operations manages the operational functions of the business, ensuring efficient processes, resource allocation, and operational excellence. Common in tech, healthcare, logistics, and consulting.",
    salary: "$120,000 – $250,000",
    responsibilities: [
      "Manage day-to-day operations and team performance",
      "Identify and implement process improvements",
      "Oversee supply chain, logistics, or service delivery",
      "Manage vendor and partner relationships",
      "Report operational metrics to leadership",
    ],
    skills: ["Operations Management", "Process Improvement", "Lean / Six Sigma", "Team Leadership", "KPI Tracking"],
    related: ["coo", "director-of-operations", "cfo"],
  },
  {
    slug: "director-of-operations",
    title: "Director of Operations",
    dept: "Operations",
    searchQ: "Director of Operations",
    description:
      "The Director of Operations leads operational teams and programmes, focusing on efficiency, quality, and scaling business processes. They work closely with senior leadership to execute strategic initiatives.",
    salary: "$110,000 – $220,000",
    responsibilities: [
      "Lead operational teams and daily workflows",
      "Drive process standardisation and improvement",
      "Manage budgets and resource planning",
      "Collaborate with cross-functional stakeholders",
      "Report on operational performance and risk",
    ],
    skills: ["Operational Excellence", "Project Management", "Budget Management", "Team Leadership", "Stakeholder Management"],
    related: ["coo", "head-of-operations"],
  },

  // ── HR ────────────────────────────────────────────────────────────────────
  {
    slug: "chro",
    title: "Chief Human Resources Officer",
    abbr: "CHRO",
    dept: "HR",
    searchQ: "Chief Human Resources Officer",
    description:
      "The Chief Human Resources Officer leads the people strategy of the organisation, including talent acquisition, employee development, culture, compensation, and HR operations. The CHRO is a key strategic partner to the CEO.",
    salary: "$160,000 – $380,000",
    responsibilities: [
      "Define and drive people strategy and culture",
      "Oversee talent acquisition and retention",
      "Lead compensation, benefits, and HR operations",
      "Drive leadership development and succession planning",
      "Ensure compliance with employment law and policy",
    ],
    skills: ["People Strategy", "Talent Acquisition", "Organisational Design", "Compensation & Benefits", "HRIS"],
    related: ["director-of-hr", "head-of-talent", "coo"],
  },
  {
    slug: "director-of-hr",
    title: "Director of HR",
    dept: "HR",
    searchQ: "Director of HR",
    description:
      "The Director of HR manages HR programmes and teams, overseeing recruitment, employee relations, performance management, and HR compliance. They report to the CHRO or CEO depending on company size.",
    salary: "$100,000 – $200,000",
    responsibilities: [
      "Manage end-to-end HR operations",
      "Lead recruiting and onboarding programmes",
      "Oversee employee relations and performance reviews",
      "Ensure HR policy compliance and risk management",
      "Drive employee engagement and culture initiatives",
    ],
    skills: ["HRIS", "Recruiting", "Employee Relations", "Performance Management", "Compliance"],
    related: ["chro", "head-of-talent"],
  },
  {
    slug: "head-of-talent",
    title: "Head of Talent",
    dept: "HR",
    searchQ: "Head of Talent",
    description:
      "The Head of Talent leads the talent acquisition and people development functions. They build hiring strategies, manage recruiting teams, and develop programmes to grow and retain talent.",
    salary: "$110,000 – $220,000",
    responsibilities: [
      "Define talent acquisition strategy and process",
      "Lead and scale the recruiting team",
      "Build employer brand and sourcing pipelines",
      "Develop learning and development programmes",
      "Partner with hiring managers on workforce planning",
    ],
    skills: ["Talent Acquisition", "Employer Branding", "ATS Systems", "Workforce Planning", "L&D"],
    related: ["chro", "director-of-hr"],
  },

  // ── Product ────────────────────────────────────────────────────────────────
  {
    slug: "cpo",
    title: "Chief Product Officer",
    abbr: "CPO",
    dept: "Product",
    searchQ: "Chief Product Officer",
    description:
      "The Chief Product Officer leads the product vision, strategy, and execution. The CPO partners with engineering and design to deliver products that customers love and that drive business growth.",
    salary: "$180,000 – $420,000",
    responsibilities: [
      "Define and own the product vision and roadmap",
      "Lead product management, design, and UX teams",
      "Drive product-led growth strategies",
      "Align product priorities with business goals",
      "Represent the customer perspective in the executive team",
    ],
    skills: ["Product Strategy", "Product Roadmap", "User Research", "OKRs", "Cross-functional Leadership"],
    related: ["head-of-product", "cto", "head-of-engineering"],
  },
  {
    slug: "head-of-product",
    title: "Head of Product",
    dept: "Product",
    searchQ: "Head of Product",
    description:
      "The Head of Product leads product management for a company or product line, driving roadmap prioritisation, feature development, and cross-functional collaboration. Common in product-led growth companies.",
    salary: "$140,000 – $300,000",
    responsibilities: [
      "Own product roadmap and prioritisation",
      "Lead and grow the product management team",
      "Define OKRs and success metrics",
      "Collaborate with engineering, design, and sales",
      "Conduct user research and gather customer insights",
    ],
    skills: ["Product Management", "Roadmapping", "User Research", "Data Analysis", "Stakeholder Management"],
    related: ["cpo", "cto", "director-of-product"],
  },
  {
    slug: "director-of-product",
    title: "Director of Product",
    dept: "Product",
    searchQ: "Director of Product",
    description:
      "The Director of Product manages product managers and drives execution against the product roadmap. They are hands-on with discovery, delivery, and cross-functional collaboration.",
    salary: "$120,000 – $250,000",
    responsibilities: [
      "Lead product managers and set product direction",
      "Drive feature discovery, specification, and delivery",
      "Prioritise backlog and make trade-off decisions",
      "Work closely with engineering and design",
      "Measure and report on product metrics",
    ],
    skills: ["Product Management", "Agile", "Analytics", "User Stories", "Team Leadership"],
    related: ["head-of-product", "cpo"],
  },

  // ── Legal ────────────────────────────────────────────────────────────────
  {
    slug: "clo",
    title: "Chief Legal Officer",
    abbr: "CLO",
    dept: "Legal",
    searchQ: "Chief Legal Officer",
    description:
      "The Chief Legal Officer provides legal guidance and leadership to the organisation. The CLO manages legal risk, regulatory compliance, contracts, M&A, and the in-house legal team.",
    salary: "$200,000 – $500,000",
    responsibilities: [
      "Oversee all legal affairs of the organisation",
      "Manage regulatory compliance and risk",
      "Lead M&A transactions and due diligence",
      "Advise the board and executive team on legal matters",
      "Build and manage the in-house legal team",
    ],
    skills: ["Corporate Law", "Contract Management", "Regulatory Compliance", "M&A", "Board Advisory"],
    related: ["cfo", "coo", "ciso"],
  },
];

// Fractional versions (same role data but for fractional context)
export const FRACTIONAL_ROLES: ExecRole[] = EXEC_ROLES.filter(r =>
  ["cfo", "ceo", "coo", "cto", "cmo", "cio", "cro", "chro", "cpo", "clo"].includes(r.slug)
).map(r => ({
  ...r,
  slug: r.slug,
  title: `Fractional ${r.title}`,
  searchQ: `Fractional ${r.abbr || r.title}`,
  description: `A Fractional ${r.abbr || r.title} provides senior ${r.dept} leadership on a part-time or project basis — giving growing companies access to C-suite expertise without a full-time hire. ${r.description}`,
  salary: r.salary.replace(/,/g, ",").replace(/\$(\d)/g, "$$$1").split("–").map(s => `$${Math.round(parseInt(s.replace(/\D/g, "")) * 0.4 / 1000) * 1000}`).join(" – ") + "/yr (part-time equivalent)",
}));

export const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Finance:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  Technology: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200" },
  Sales:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Marketing:  { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200" },
  Operations: { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200" },
  HR:         { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200" },
  Legal:      { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
  Security:   { bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-200" },
  Product:    { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
};

export function getRoleBySlug(slug: string): ExecRole | undefined {
  return EXEC_ROLES.find(r => r.slug === slug);
}

export function getFractionalRoleBySlug(slug: string): ExecRole | undefined {
  return FRACTIONAL_ROLES.find(r => r.slug === slug);
}

export const DEPTS = ["Finance", "Technology", "Sales", "Marketing", "Operations", "HR", "Legal", "Security", "Product"] as const;
