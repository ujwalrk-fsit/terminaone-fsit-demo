import type { FundingRound, Leader, NewsItem } from '../types';

export interface CompanyExt {
  website: string; hq: string; founded: string; overview: string;
  investors: string[]; leadership: Leader[]; board: string[];
  rounds: FundingRound[]; lastMatched?: number; tags: string[];
}

// Deterministic pseudo-random generator so charts are stable per company.
export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PricePoint { i: number; v: number; vol: number; }
// 260-point daily series ending at the company's reference price. Stable per id.
export function priceSeries(id: string, end: number, start: number): PricePoint[] {
  const rnd = mulberry(hashStr(id));
  const pts: PricePoint[] = [];
  let v = start;
  for (let i = 0; i < 260; i++) {
    v = v * (1 + (rnd() - 0.485) * 0.035);
    pts.push({ i, v: +v.toFixed(2), vol: Math.round(20 + rnd() * 180) });
  }
  const k = end / v; // anchor the last point exactly at the reference price
  return pts.map((p, j) => ({ i: j, v: +(p.v * (1 + ((k - 1) * (j + 1)) / 260)).toFixed(2), vol: p.vol }));
}

export const RANGES = [
  { k: '7D', n: 7 }, { k: '1M', n: 30 }, { k: '3M', n: 90 }, { k: '1Y', n: 260 }, { k: 'ALL', n: 260 },
] as const;

export const companyExt: Record<string, CompanyExt> = {
  o_anduril: {
    website: 'anduril.com', hq: 'Costa Mesa, CA', founded: '2017',
    overview: 'Anduril builds autonomous defense systems — unmanned aircraft, counter-drone platforms and a software-defined command layer now deployed across US and allied programs.',
    investors: ['Founders Fund', 'Andreessen Horowitz', 'General Catalyst', 'Valor Equity'],
    leadership: [{ name: 'Palmer Luckey', role: 'Founder' }, { name: 'Brian Schimpf', role: 'CEO' }, { name: 'Matt Grimm', role: 'COO' }],
    board: ['Trae Stephens', 'Elad Gil', 'Kathryn Griffin'],
    rounds: [
      { round: 'Series F', date: '2024-08-07', raised: 1500000000, pps: 32.10, valuation: 14000000000, investors: ['Founders Fund', 'Sands Capital'], liquidation: '1x non-participating' },
      { round: 'Series E', date: '2022-12-02', raised: 1480000000, pps: 18.40, valuation: 8460000000, investors: ['Valor Equity', 'General Catalyst'], liquidation: '1x non-participating' },
      { round: 'Series D', date: '2021-06-17', raised: 450000000, pps: 10.90, valuation: 4600000000, investors: ['Andreessen Horowitz', '8VC'], liquidation: '1x non-participating' },
    ],
    lastMatched: 33.40, tags: ['Actively Traded', 'Top Gainer', 'New Valuation', 'Unicorn'],
  },
  o_anthropic: {
    website: 'anthropic.com', hq: 'San Francisco, CA', founded: '2021',
    overview: 'Anthropic develops frontier AI systems with a safety-first research program, serving enterprises through its Claude model family and cloud partnerships.',
    investors: ['Google', 'Amazon', 'Spark Capital', 'Menlo Ventures'],
    leadership: [{ name: 'Dario Amodei', role: 'CEO & Co-founder' }, { name: 'Daniela Amodei', role: 'President' }, { name: 'Krishna Rao', role: 'CFO' }],
    board: ['Dario Amodei', 'Daniela Amodei', 'Jay Kreps'],
    rounds: [
      { round: 'Series E', date: '2024-03-27', raised: 750000000, pps: 28.40, valuation: 18400000000, investors: ['Amazon', 'Google'], liquidation: '1x non-participating' },
      { round: 'Series D', date: '2023-05-23', raised: 450000000, pps: 15.20, valuation: 5000000000, investors: ['Spark Capital', 'Google'], liquidation: '1x non-participating' },
      { round: 'Series C', date: '2022-04-29', raised: 580000000, pps: 9.80, valuation: 4100000000, investors: ['FTX (repurchased)', 'Caroline Ellison estate'], liquidation: '1x non-participating' },
    ],
    lastMatched: 30.10, tags: ['Actively Traded', 'Top Gainer', 'New Funding Round', 'Unicorn'],
  },
  o_stripe: {
    website: 'stripe.com', hq: 'San Francisco, CA', founded: '2010',
    overview: 'Stripe provides payments infrastructure for internet commerce — billing, payouts, fraud prevention and banking-as-a-service for millions of businesses.',
    investors: ['Sequoia Capital', 'Andreessen Horowitz', 'General Catalyst', 'Temasek'],
    leadership: [{ name: 'Patrick Collison', role: 'CEO & Co-founder' }, { name: 'John Collison', role: 'President & Co-founder' }, { name: 'Steffan Tomlinson', role: 'CFO' }],
    board: ['Patrick Collison', 'John Collison', 'Michael Moritz'],
    rounds: [
      { round: 'Tender Offer', date: '2024-02-24', raised: 0, pps: 27.50, valuation: 65000000000, investors: ['Employee liquidity'], liquidation: 'Common' },
      { round: 'Series I', date: '2023-03-15', raised: 6500000000, pps: 25.10, valuation: 50000000000, investors: ['GIC', 'Temasek', 'Sequoia'], liquidation: '1x non-participating' },
      { round: 'Series H', date: '2021-03-14', raised: 600000000, pps: 22.80, valuation: 95000000000, investors: ['Allianz X', 'Fidelity'], liquidation: '1x non-participating' },
    ],
    lastMatched: 28.60, tags: ['Actively Traded', 'New Valuation', 'Unicorn'],
  },
  o_databricks: {
    website: 'databricks.com', hq: 'San Francisco, CA', founded: '2013',
    overview: 'Databricks offers the data-intelligence lakehouse for analytics, ML and AI workloads, growing rapidly with enterprise data-mesh adoption.',
    investors: ['Andreessen Horowitz', 'T. Rowe Price', 'Morgan Stanley', 'Fidelity'],
    leadership: [{ name: 'Ali Ghodsi', role: 'CEO & Co-founder' }, { name: 'Dave Conte', role: 'CFO' }, { name: 'Andy Kofoid', role: 'CRO' }],
    board: ['Ali Ghodsi', 'Ben Horowitz', 'Ruth Porat'],
    rounds: [
      { round: 'Series J', date: '2024-01-22', raised: 500000000, pps: 92.00, valuation: 43000000000, investors: ['T. Rowe Price', 'Morgan Stanley'], liquidation: '1x non-participating' },
      { round: 'Series I', date: '2022-08-19', raised: 1600000000, pps: 73.50, valuation: 38000000000, investors: ['Fidelity', 'Franklin Templeton'], liquidation: '1x non-participating' },
      { round: 'Series H', date: '2021-08-31', raised: 1600000000, pps: 65.00, valuation: 38000000000, investors: ['Counterpoint Global', 'ClearBridge'], liquidation: '1x non-participating' },
    ],
    lastMatched: 96.20, tags: ['Actively Traded', 'Top Gainer', 'Unicorn'],
  },
  o_openai: {
    website: 'openai.com', hq: 'San Francisco, CA', founded: '2015',
    overview: 'OpenAI builds frontier AI models and consumer and enterprise products, capitalized through a capped-profit structure with major cloud backing.',
    investors: ['Microsoft', 'Thrive Capital', 'Khosla Ventures', 'Sequoia Capital'],
    leadership: [{ name: 'Sam Altman', role: 'CEO' }, { name: 'Greg Brockman', role: 'President' }, { name: 'Sarah Friar', role: 'CFO' }],
    board: ['Sam Altman', 'Bret Taylor', 'Larry Summers'],
    rounds: [
      { round: 'Corporate Round', date: '2024-10-02', raised: 6600000000, pps: 210.00, valuation: 157000000000, investors: ['Thrive Capital', 'Microsoft', 'Nvidia'], liquidation: 'Capped-profit units' },
      { round: 'Tender Offer', date: '2024-02-17', raised: 0, pps: 127.00, valuation: 86000000000, investors: ['Employee liquidity'], liquidation: 'Common' },
      { round: 'Corporate Round', date: '2023-01-23', raised: 10000000000, pps: 68.00, valuation: 29000000000, investors: ['Microsoft'], liquidation: 'Capped-profit units' },
    ],
    lastMatched: 224.00, tags: ['Actively Traded', 'Top Gainer', 'New Valuation', 'Unicorn'],
  },
  o_spacex: {
    website: 'spacex.com', hq: 'Hawthorne, CA', founded: '2002',
    overview: 'SpaceX operates reusable launch vehicles and the Starlink satellite network, with launch cadence and bandwidth growth driving secondary demand.',
    investors: ['Founders Fund', 'Fidelity', 'Google', 'Valor Equity'],
    leadership: [{ name: 'Elon Musk', role: 'CEO & Founder' }, { name: 'Gwynne Shotwell', role: 'President & COO' }, { name: 'Bret Johnsen', role: 'CFO' }],
    board: ['Elon Musk', 'Gwynne Shotwell', 'Luke Nosek'],
    rounds: [
      { round: 'Tender Offer', date: '2023-12-15', raised: 0, pps: 97.00, valuation: 180000000000, investors: ['Employee liquidity'], liquidation: 'Common' },
      { round: 'Equity Round', date: '2023-07-20', raised: 750000000, pps: 81.00, valuation: 150000000000, investors: ['Fidelity', 'Andreessen Horowitz'], liquidation: '1x non-participating' },
    ],
    lastMatched: 99.80, tags: ['Actively Traded', 'Unicorn'],
  },
  o_bytedance: {
    website: 'bytedance.com', hq: 'Beijing / Singapore', founded: '2012',
    overview: 'ByteDance operates short-video and content platforms at global scale. Transfers face regulatory review and extended settlement timelines.',
    investors: ['Sequoia Capital', 'SoftBank', 'General Atlantic', 'SIG'],
    leadership: [{ name: 'Liang Rubo', role: 'CEO' }, { name: 'Shou Zi Chew', role: 'CEO, TikTok' }, { name: 'Julie Gao', role: 'CFO' }],
    board: ['Liang Rubo', 'Neil Shen', 'Bill Ford'],
    rounds: [
      { round: 'Series E', date: '2020-12-20', raised: 5000000000, pps: 0, valuation: 180000000000, investors: ['Sequoia', 'SoftBank'], liquidation: '1x participating (capped)' },
    ],
    tags: ['New Valuation', 'Unicorn'],
  },
  o_ripple: {
    website: 'ripple.com', hq: 'San Francisco, CA', founded: '2012',
    overview: 'Ripple provides enterprise blockchain payment rails for cross-border settlement, with corridors across Asia, the Middle East and Latin America.',
    investors: ['Andreessen Horowitz', 'Google Ventures', 'IDG Capital', 'SBI Holdings'],
    leadership: [{ name: 'Brad Garlinghouse', role: 'CEO' }, { name: 'Monica Long', role: 'President' }, { name: 'Stuart Alderoty', role: 'General Counsel' }],
    board: ['Brad Garlinghouse', 'Chris Larsen', 'Yoshitaka Kitao'],
    rounds: [
      { round: 'Series C', date: '2019-12-20', raised: 200000000, pps: 12.00, valuation: 10000000000, investors: ['Tetragon', 'SBI Holdings'], liquidation: '1x non-participating' },
      { round: 'Series B', date: '2016-09-15', raised: 55000000, pps: 4.10, valuation: 4100000000, investors: ['Andreessen Horowitz', 'Google Ventures'], liquidation: '1x non-participating' },
    ],
    lastMatched: 10.90, tags: ['Unicorn'],
  },
  o_neuralink: {
    website: 'neuralink.com', hq: 'Fremont, CA', founded: '2016',
    overview: 'Neuralink develops implantable brain-computer interfaces, progressing through clinical milestones toward assisted-mobility indications.',
    investors: ['Founders Fund', 'Vy Capital', 'Google Ventures'],
    leadership: [{ name: 'Elon Musk', role: 'Co-founder' }, { name: 'Jared Birchall', role: 'CEO' }, { name: 'Dongjin Seo', role: 'President' }],
    board: ['Elon Musk', 'Jared Birchall', 'Sam Teller'],
    rounds: [
      { round: 'Series E', date: '2025-06-02', raised: 650000000, pps: 50.50, valuation: 9000000000, investors: ['Vy Capital', 'Founders Fund'], liquidation: '1x non-participating' },
      { round: 'Series D', date: '2023-08-07', raised: 280000000, pps: 32.00, valuation: 5000000000, investors: ['Vy Capital'], liquidation: '1x non-participating' },
    ],
    lastMatched: undefined, tags: ['New Funding Round', 'Unicorn'],
  },
  o_figma: {
    website: 'figma.com', hq: 'San Francisco, CA', founded: '2012',
    overview: 'Figma provides browser-based collaborative design tooling with strong net-retention across product and engineering teams.',
    investors: ['Andreessen Horowitz', 'Sequoia Capital', 'IVP', 'Kleiner Perkins'],
    leadership: [{ name: 'Dylan Field', role: 'CEO & Co-founder' }, { name: 'Evan Wallace', role: 'Co-founder' }, { name: 'Praveer Melwani', role: 'CFO' }],
    board: ['Dylan Field', 'John Lilly', 'Andrew Reed'],
    rounds: [
      { round: 'Series E', date: '2021-06-24', raised: 200000000, pps: 41.00, valuation: 10000000000, investors: ['Durable Capital', 'Morgan Stanley'], liquidation: '1x non-participating' },
      { round: 'Series D', date: '2020-04-30', raised: 50000000, pps: 18.00, valuation: 2000000000, investors: ['Andreessen Horowitz', 'Sequoia'], liquidation: '1x non-participating' },
    ],
    lastMatched: 44.60, tags: ['Unicorn'],
  },
  o_shein: {
    website: 'shein.com', hq: 'Singapore', founded: '2008',
    overview: 'Shein operates a data-driven fast-fashion marketplace with on-demand manufacturing and a pending public-listing pathway.',
    investors: ['Sequoia Capital', 'General Atlantic', 'Tiger Global'],
    leadership: [{ name: 'Chris Xu', role: 'Founder & CEO' }, { name: 'Donald Tang', role: 'Executive Vice Chairman' }, { name: 'Caroline Zheng', role: 'CFO' }],
    board: ['Chris Xu', 'Neil Shen', 'Bill Ford'],
    rounds: [
      { round: 'Series G', date: '2023-05-16', raised: 2000000000, pps: 0, valuation: 66000000000, investors: ['Sequoia', 'General Atlantic'], liquidation: '1x participating (capped)' },
    ],
    tags: ['Unicorn'],
  },
  o_coreweave: {
    website: 'coreweave.com', hq: 'Livingston, NJ', founded: '2017',
    overview: 'CoreWeave supplies GPU cloud infrastructure for AI training and inference, scaling data-center capacity against contracted demand.',
    investors: ['Magnetar Capital', 'Fidelity', 'BlackRock', 'Coatue'],
    leadership: [{ name: 'Michael Intrator', role: 'CEO & Co-founder' }, { name: 'Brian Venturo', role: 'CSO & Co-founder' }, { name: 'Augustin Marty', role: 'CFO' }],
    board: ['Michael Intrator', 'Brian Venturo', 'Jack Cogen'],
    rounds: [
      { round: 'Series D', date: '2024-05-16', raised: 1100000000, pps: 0, valuation: 19000000000, investors: ['Coatue', 'Fidelity'], liquidation: '1x non-participating' },
      { round: 'Series C', date: '2023-08-22', raised: 421000000, pps: 0, valuation: 7000000000, investors: ['Magnetar Capital'], liquidation: '1x non-participating' },
    ],
    lastMatched: undefined, tags: ['Actively Traded', 'New Funding Round', 'Unicorn'],
  },
};

export const buyerFaqs = [
  { q: 'How do I submit a buy interest?', a: 'Open the opportunity, choose Express interest, enter units, complete the bank transfer with the stated reference, then e-sign. Your indication moves to review once transfer proof is attached.' },
  { q: 'What is the minimum investment?', a: 'Each fund sets its own minimum — shown on the opportunity card and detail page. Amounts below the minimum cannot be submitted.' },
  { q: 'How long does settlement take?', a: 'After approval and countersignature, allocation typically completes within 5–10 business days, depending on transfer verification.' },
  { q: 'Can I cancel an indication?', a: 'Yes, while it is in DRAFT, SUBSCRIBED or AWAITING_APPROVAL status. Contact your advisor or use the indications list.' },
];

export const sellerFaqs = [
  { q: 'How is my holding valued?', a: 'Deal teams mark holdings against comparable multiples and recent secondary trades. The TSG Price shown is indicative, not a firm quote.' },
  { q: 'Can I list shares for sale?', a: 'Secondary listings open during scheduled liquidity windows. Join the watchlist to be notified when the window for your company opens.' },
  { q: 'What approvals are needed to sell?', a: 'Company right-of-first-refusal waivers and fund-manager consent are typically required before a matched trade can settle.' },
];

export interface NewsItemFull extends NewsItem { oppId?: string }
export const companyNews: NewsItemFull[] = [
  { oppId: 'o_anduril', title: 'Anduril wins next phase of autonomous interceptor program', source: 'Defense Brief', date: '2026-09-02' },
  { oppId: 'o_anduril', title: 'Analysts raise private marks on defense autonomy names', source: 'Market Desk', date: '2026-08-21' },
  { oppId: 'o_anthropic', title: 'Anthropic expands enterprise tier with usage-based pricing', source: 'Tech Wire', date: '2026-09-05' },
  { oppId: 'o_anthropic', title: 'Cloud partners deepen capacity commitments for AI labs', source: 'Market Desk', date: '2026-08-28' },
  { oppId: 'o_stripe', title: 'Stripe posts record payment volume as enterprise adoption grows', source: 'Fintech Today', date: '2026-08-30' },
  { oppId: 'o_databricks', title: 'Databricks reports accelerating data-intelligence bookings', source: 'Tech Wire', date: '2026-08-25' },
  { oppId: 'o_openai', title: 'Frontier labs race to secure next-generation compute supply', source: 'Market Desk', date: '2026-09-01' },
  { oppId: 'o_spacex', title: 'Launch cadence hits new monthly record', source: 'Space Review', date: '2026-08-19' },
  { oppId: 'o_coreweave', title: 'GPU cloud demand outpaces new data-center supply', source: 'Infra Watch', date: '2026-09-06' },
  { title: 'Secondary volumes climb as IPO window stays selective', source: 'Market Desk', date: '2026-09-08' },
  { title: 'Valuation discipline returns to late-stage rounds', source: 'Private Outlook', date: '2026-09-03' },
  { title: 'Tender offers become the default liquidity path', source: 'Fintech Today', date: '2026-08-27' },
];
