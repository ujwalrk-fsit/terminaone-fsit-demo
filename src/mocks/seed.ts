import type { MockUser, FundOffering, Opportunity, Indication, InvestorAccount, Transfer, DocItem, SignatureRequest, Article, AuditItem, NoticeItem } from '../types';

export const users: MockUser[] = [
  { _id: 'u_admin', firstName: 'Asha', lastName: 'Admin', emailId: 'admin@demo.local', roleGroup: 'admin', roleId: 'r_admin', status: 'active', password: 'admin123' },
  { _id: 'u_adv', firstName: 'Ravi', lastName: 'Advisor', emailId: 'advisor@demo.local', roleGroup: 'advisor', roleId: 'r_advisor', status: 'active', password: 'advisor123' },
  { _id: 'u_aff', firstName: 'Mira', lastName: 'Affiliate', emailId: 'affiliate@demo.local', roleGroup: 'affiliate', roleId: 'r_affiliate', status: 'active', password: 'affiliate123' },
  { _id: 'u_fm', firstName: 'Karan', lastName: 'Manager', emailId: 'manager@demo.local', roleGroup: 'fund_manager', roleId: 'r_fm', status: 'active', password: 'manager123' },
  { _id: 'u_mon', firstName: 'Ira', lastName: 'Monitor', emailId: 'monitor@demo.local', roleGroup: 'monitor', roleId: 'r_monitor', status: 'active', password: 'monitor123' },
  { _id: 'u_inv1', firstName: 'Dev', lastName: 'Investor', emailId: 'investor@demo.local', roleGroup: 'investor', roleId: 'r_investor', status: 'active', investorStatus: 'ONBOARDED', password: 'investor123' },
  { _id: 'u_inv2', firstName: 'Nina', lastName: 'New', emailId: 'nina@demo.local', roleGroup: 'investor', roleId: 'r_investor', status: 'pending', investorStatus: 'PENDING_ONBOARDING', password: 'investor123' },
];

const q = (year: number, quarter: string, value: number) => ({ year, quarter, value });

export const opportunities: Opportunity[] = [
  { _id: 'o_anduril', name: 'Anduril', sector: 'Industrial', subSector: 'Aerospace & Defense', rank: 1, latestQoQ: 6.2, cumulativeChange: 42.5, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',108),q(2024,'Q3',115),q(2024,'Q4',126),q(2025,'Q1',134),q(2025,'Q2',142.5)], lastRound: { round: 'Series F', date: '2024-08-07', valuation: 14000000000, pps: 32.1 }, tsgPrice: 34.8, priceChange1Y: 31.4, activity: 'High', description: 'Defense autonomy platform. Synthetic mock profile for reference.', fundId: 'f_alpha_2' },
  { _id: 'o_anthropic', name: 'Anthropic', sector: 'Enterprise Software', subSector: 'Data Intelligence', rank: 2, latestQoQ: 8.1, cumulativeChange: 64.0, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',112),q(2024,'Q3',128),q(2024,'Q4',145),q(2025,'Q1',156),q(2025,'Q2',164)], lastRound: { round: 'Series E', date: '2024-03-27', valuation: 18400000000, pps: 28.4 }, tsgPrice: 31.2, priceChange1Y: 46.2, activity: 'High', description: 'AI safety and research company. Synthetic mock.', fundId: 'f_alpha_1' },
  { _id: 'o_stripe', name: 'Stripe', sector: 'Fintech', subSector: 'Payments', rank: 3, latestQoQ: 2.4, cumulativeChange: 15.9, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',102),q(2024,'Q3',106),q(2024,'Q4',110),q(2025,'Q1',113),q(2025,'Q2',115.9)], lastRound: { round: 'Tender Offer', date: '2024-02-24', valuation: 65000000000, pps: 27.5 }, tsgPrice: 29.1, priceChange1Y: 15.9, activity: 'Medium', description: 'Payments infrastructure. Synthetic mock.', fundId: 'f_income_1' },
  { _id: 'o_databricks', name: 'Databricks', sector: 'Enterprise Software', subSector: 'Data Intelligence', rank: 4, latestQoQ: 5.0, cumulativeChange: 34.0, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',107),q(2024,'Q3',116),q(2024,'Q4',124),q(2025,'Q1',130),q(2025,'Q2',134)], lastRound: { round: 'Series J', date: '2024-01-22', valuation: 43000000000, pps: 92.0 }, tsgPrice: 98.4, priceChange1Y: 34.0, activity: 'High', description: 'Lakehouse platform. Synthetic mock.', fundId: 'f_alpha_1' },
  { _id: 'o_openai', name: 'OpenAI', sector: 'Enterprise Software', subSector: 'Data Intelligence', rank: 5, latestQoQ: 7.3, cumulativeChange: 58.2, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',111),q(2024,'Q3',124),q(2024,'Q4',140),q(2025,'Q1',150),q(2025,'Q2',158.2)], lastRound: { round: 'Corporate Round', date: '2024-10-02', valuation: 157000000000, pps: 210.0 }, tsgPrice: 228.5, priceChange1Y: 52.0, activity: 'High', description: 'Frontier AI lab. Synthetic mock.', fundId: 'f_alpha_2' },
  { _id: 'o_spacex', name: 'SpaceX', sector: 'Industrial', subSector: 'Aerospace & Defense', rank: 6, latestQoQ: 4.1, cumulativeChange: 28.7, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',104),q(2024,'Q3',110),q(2024,'Q4',118),q(2025,'Q1',123),q(2025,'Q2',128.7)], lastRound: { round: 'Tender Offer', date: '2023-12-15', valuation: 180000000000, pps: 97.0 }, tsgPrice: 101.4, priceChange1Y: 22.6, activity: 'Medium', description: 'Launch and satellite network. Synthetic mock.' },
  { _id: 'o_bytedance', name: 'ByteDance', sector: 'Consumer & Lifestyle', subSector: 'Social', rank: 7, latestQoQ: -1.2, cumulativeChange: 4.4, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',101),q(2024,'Q3',102),q(2024,'Q4',103),q(2025,'Q1',105),q(2025,'Q2',104.4)], tsgPrice: undefined, priceChange1Y: undefined, activity: 'Limited', description: 'Short-video platform. Pricing not available in mock.' },
  { _id: 'o_ripple', name: 'Ripple', sector: 'Fintech', subSector: 'Payments', rank: 8, latestQoQ: -2.0, cumulativeChange: -9.6, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',96),q(2024,'Q3',94),q(2024,'Q4',92),q(2025,'Q1',91),q(2025,'Q2',90.4)], lastRound: { round: 'Series C', date: '2019-12-20', valuation: 10000000000, pps: 12.0 }, tsgPrice: 11.2, priceChange1Y: -9.6, activity: 'Low', description: 'Enterprise blockchain payments. Synthetic mock.' },
  { _id: 'o_neuralink', name: 'Neuralink', sector: 'Healthcare', subSector: 'Medical Devices', rank: 9, latestQoQ: 3.3, cumulativeChange: 12.1, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',102),q(2024,'Q3',105),q(2024,'Q4',108),q(2025,'Q1',110),q(2025,'Q2',112.1)], activity: 'Limited', description: 'Neural interfaces. Synthetic mock.' },
  { _id: 'o_figma', name: 'Figma', sector: 'Enterprise Software', subSector: 'Cloud/Networking Infrastructure', rank: 10, latestQoQ: 1.8, cumulativeChange: 9.9, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',101),q(2024,'Q3',104),q(2024,'Q4',107),q(2025,'Q1',108),q(2025,'Q2',109.9)], activity: 'Low', description: 'Design collaboration. Synthetic mock.', fundId: 'f_growth_1' },
  { _id: 'o_shein', name: 'Shein', sector: 'Consumer & Lifestyle', subSector: 'Social', rank: 11, latestQoQ: 0.6, cumulativeChange: 3.2, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',100),q(2024,'Q3',101),q(2024,'Q4',102),q(2025,'Q1',103),q(2025,'Q2',103.2)], activity: 'Limited', description: 'E-commerce. Synthetic mock.' },
  { _id: 'o_coreweave', name: 'CoreWeave', sector: 'Technology Hardware', subSector: 'Computing Hardware', rank: 12, latestQoQ: 9.4, cumulativeChange: 71.0, quarterlyData: [q(2024,'Q1',100),q(2024,'Q2',114),q(2024,'Q3',132),q(2024,'Q4',152),q(2025,'Q1',162),q(2025,'Q2',171)], activity: 'High', description: 'AI cloud infrastructure. Synthetic mock.', fundId: 'f_alpha_2' },
];

export const funds: FundOffering[] = [
  { _id: 'f_alpha_1', fundName: 'Alpha Private Growth I', fundType: 'private_equity', targetIrr: 18, minimumInvestment: 25000, offerPricePerUnit: 100,   offeringSize: 50000000, raised: 40500000, nav: 52.4, returnPercentage: 12.6, sector: 'Enterprise Software', subSector: 'Data Intelligence', headquarters: 'Mumbai', foundedOn: '2021', subscriptionStart: '2026-06-01', subscriptionEnd: '2026-12-31', status: 'live', managers: ['u_fm'], affiliates: ['u_aff'], faqs: [{ q: 'Who can invest?', a: 'Accredited investors (mock).' }], keyRisks: 'Private markets are illiquid (mock).', bankDetails: { bankName: 'HDFC Bank', accountName: 'TSG Alpha Escrow', accountNumber: '50200012345678', routingCode: 'HDFC0001234', swift: 'HDFCINBB', branch: 'Mumbai BKC', instructions: 'Transfer exact indication amount with reference ID. Upload proof to move to review.', uploadedBy: 'u_fm', updatedAt: '2026-09-01' }, opportunityId: 'o_anthropic' },
  { _id: 'f_alpha_2', fundName: 'Alpha AI & Defense II', fundType: 'equity', targetIrr: 22, minimumInvestment: 50000, offerPricePerUnit: 250,   offeringSize: 75000000, raised: 60000000, nav: 78.1, returnPercentage: 18.2, sector: 'Industrial', subSector: 'Aerospace & Defense', headquarters: 'Bengaluru', foundedOn: '2022', status: 'live', managers: ['u_fm'], affiliates: [], faqs: [], keyRisks: 'Concentration risk (mock).', bankDetails: { bankName: 'ICICI Bank', accountName: 'TSG Defense Escrow', accountNumber: '004405012345', routingCode: 'ICIC0000044', instructions: 'Use indication reference in remarks.', uploadedBy: 'u_admin', updatedAt: '2026-08-20' }, opportunityId: 'o_anduril' },
  { _id: 'f_income_1', fundName: 'Stable Income Notes', fundType: 'debt', minimumInvestment: 10000, offerPricePerUnit: 50, offeringSize: 20000000, raised: 12400000, sector: 'Fintech', subSector: 'Payments', status: 'live', managers: ['u_fm'], affiliates: ['u_aff'], faqs: [], keyRisks: 'Credit risk (mock).' },
  { _id: 'f_growth_1', fundName: 'SaaS Growth SPV', fundType: 'equity', minimumInvestment: 15000, offerPricePerUnit: 75, offeringSize: 15000000, raised: 3100000, sector: 'Enterprise Software', subSector: 'Cloud/Networking Infrastructure', status: 'upcoming', managers: ['u_fm'], affiliates: [], faqs: [], keyRisks: 'Mock.' },
  { _id: 'f_re_1', fundName: 'Logistics Parks RE', fundType: 'real_estate', minimumInvestment: 50000, offerPricePerUnit: 200, offeringSize: 40000000, raised: 2200000, sector: 'Industrial', subSector: 'Robotics', status: 'upcoming', managers: ['u_fm'], affiliates: [], faqs: [], keyRisks: 'Mock.' },
  { _id: 'f_alpha_0', fundName: 'Alpha Pilot (Closed)', fundType: 'private_equity', minimumInvestment: 25000, offerPricePerUnit: 100, offeringSize: 10000000, raised: 10000000, sector: 'Healthcare', subSector: 'Medical Devices', status: 'closed', managers: ['u_fm'], affiliates: [], faqs: [], keyRisks: 'Mock.' },
  { _id: 'f_draft_1', fundName: 'Defense Co-Invest (Draft)', fundType: 'equity', minimumInvestment: 100000, offerPricePerUnit: 500, offeringSize: 30000000, sector: 'Industrial', subSector: 'Aerospace & Defense', status: 'draft', managers: ['u_fm'], affiliates: [], faqs: [], keyRisks: 'Mock.' },
  { _id: 'f_draft_2', fundName: 'Fintech Yield (Draft)', fundType: 'debt', minimumInvestment: 20000, offerPricePerUnit: 100, offeringSize: 12000000, sector: 'Fintech', subSector: 'Digital Banking', status: 'draft', managers: ['u_fm'], affiliates: [], faqs: [], keyRisks: 'Mock.' },
];

export const accounts: InvestorAccount[] = [
  { _id: 'a_inv1', userId: 'u_inv1', accountType: 'INDIVIDUAL', status: 'ACTIVE', stepKey: 'DONE', kycName: 'Dev Investor' },
  { _id: 'a_inv2', userId: 'u_inv2', accountType: 'INDIVIDUAL', status: 'DRAFT', stepKey: 'PERSONAL' },
];

export const indications: Indication[] = [
  { _id: 'i_1', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_alpha_1', opportunityId: 'o_anthropic', numberOfUnits: 300, investmentAmount: 30000, status: 'ALLOCATED', createdAt: '2026-07-02', updatedAt: '2026-08-01' },
  { _id: 'i_2', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_alpha_2', opportunityId: 'o_anduril', numberOfUnits: 120, investmentAmount: 30000, status: 'APPROVED', createdAt: '2026-08-10', updatedAt: '2026-09-01' },
  { _id: 'i_3', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_income_1', opportunityId: 'o_stripe', numberOfUnits: 200, investmentAmount: 10000, status: 'AWAITING_SIGNATURE', createdAt: '2026-09-02', updatedAt: '2026-09-05' },
  { _id: 'i_4', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_alpha_1', numberOfUnits: 100, investmentAmount: 10000, status: 'AWAITING_APPROVAL', createdAt: '2026-09-06', updatedAt: '2026-09-07' },
  { _id: 'i_5', investorUserId: 'u_inv2', investorAccountId: 'a_inv2', fundId: 'f_growth_1', opportunityId: 'o_figma', numberOfUnits: 200, investmentAmount: 15000, status: 'DRAFT', createdAt: '2026-09-08', updatedAt: '2026-09-08' },
  { _id: 'i_6', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_alpha_2', numberOfUnits: 40, investmentAmount: 10000, status: 'SUBSCRIBED', createdAt: '2026-09-09', updatedAt: '2026-09-09' },
  { _id: 'i_7', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_income_1', numberOfUnits: 100, investmentAmount: 5000, status: 'PAYMENT_PROCESSING', createdAt: '2026-09-10', updatedAt: '2026-09-10' },
  { _id: 'i_8', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_alpha_0', numberOfUnits: 50, investmentAmount: 5000, status: 'REJECTED', createdAt: '2026-06-01', updatedAt: '2026-06-20' },
  { _id: 'i_9', investorUserId: 'u_inv2', investorAccountId: 'a_inv2', fundId: 'f_alpha_1', numberOfUnits: 250, investmentAmount: 25000, status: 'DRAFT', createdAt: '2026-09-11', updatedAt: '2026-09-11' },
  { _id: 'i_10', investorUserId: 'u_inv1', investorAccountId: 'a_inv1', fundId: 'f_alpha_1', numberOfUnits: 150, investmentAmount: 15000, status: 'AWAITING_APPROVAL', createdAt: '2026-09-12', updatedAt: '2026-09-12' },
];

export const transfers: Transfer[] = [
  { _id: 't_1', indicationId: 'i_2', investorUserId: 'u_inv1', totalAmount: 30000, currency: 'INR', status: 'SUCCEEDED', method: 'BANK_TRANSFER', reference: 'REF-I2-30000', createdAt: '2026-09-01' },
  { _id: 't_2', indicationId: 'i_7', investorUserId: 'u_inv1', totalAmount: 5000, currency: 'INR', status: 'PROCESSING', method: 'BANK_TRANSFER', reference: 'REF-I7-5000', createdAt: '2026-09-10' },
];

export const docs: DocItem[] = [
  { _id: 'd_1', title: 'Subscription Agreement — Alpha I', category: 'subscription', documentType: 'subscription', status: 'active', version: 3, updatedAt: '2026-08-28', requiresSignature: true },
  { _id: 'd_2', title: 'Offering Memorandum — AI & Defense II', category: 'offering', documentType: 'offering', status: 'active', version: 1, updatedAt: '2026-08-15', requiresSignature: false },
  { _id: 'd_3', title: 'KYC Checklist', category: 'compliance', documentType: 'compliance', status: 'awaiting_approval', version: 2, updatedAt: '2026-09-05', requiresSignature: true },
  { _id: 'd_4', title: 'Risk Disclosure (Draft)', category: 'legal', documentType: 'legal', status: 'draft', version: 1, updatedAt: '2026-09-01', requiresSignature: false },
];

export const signatures: SignatureRequest[] = [
  { _id: 's_1', documentId: 'd_1', indicationId: 'i_3', status: 'IN_PROGRESS', stage: 'WAITING_FOR_ADVISOR', recipients: [{ role: 'investor', order: 1, status: 'COMPLETED', signedAt: '2026-09-05' }, { role: 'advisor', order: 2, status: 'PENDING' }, { role: 'fund_manager', order: 3, status: 'PENDING' }], currentOrder: 2, expiresAt: '2026-10-05', reminderCount: 1 },
];

export const articles: Article[] = [
  { _id: 'a1', title: 'Pre-IPO Guide: Bids, Asks and Indications', status: 'published', category: 'GUIDES', bodyMarkdown: '# Pre-IPO Guide\n\nMock article. Submit an indication from an opportunity page, transfer via bank details, then e-sign.', updatedAt: '2026-08-01' },
  { _id: 'a2', title: 'Understanding NAV and Offer Price', status: 'published', category: 'EDUCATION', bodyMarkdown: '# NAV vs Offer Price\n\nMock explainer.', updatedAt: '2026-08-10' },
  { _id: 'a3', title: 'Q3 Private Market Update (Draft)', status: 'draft', category: 'UPDATES', bodyMarkdown: '# Draft\n\nNot visible publicly.', updatedAt: '2026-09-01' },
];

export const logs: AuditItem[] = [
  { _id: 'l1', module: 'Investment', action: 'INDICATION_SUBMITTED', performedBy: 'u_inv1', createdAt: '2026-09-12', status: 'SUCCESS' },
  { _id: 'l2', module: 'User', action: 'LOGIN', performedBy: 'u_admin', createdAt: '2026-09-12', status: 'SUCCESS' },
  { _id: 'l3', module: 'Fund', action: 'FUND_UPDATED', performedBy: 'u_fm', createdAt: '2026-09-10', status: 'SUCCESS' },
];

export const notices: NoticeItem[] = [
  { _id: 'n1', title: 'Alpha I is live', body: 'Subscription window open till Dec 31 (mock).', category: 'FUND_UPDATES', isRead: false, createdAt: '2026-09-01' },
  { _id: 'n2', title: 'Your signature is pending', body: 'Advisor signature pending on d_1 (mock).', category: 'PORTFOLIO_UPDATES', isRead: false, createdAt: '2026-09-06' },
];
