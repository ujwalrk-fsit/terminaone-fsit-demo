// Central domain types — derived from TSG ER mapping.
// ObjectId represented as string. Single-DB Phase-2 name: tsg_app_db.
// NOTE: legacy vault entity from the ER docs is renamed to `opportunities` in all new code.

export type RoleGroup = 'admin' | 'advisor' | 'affiliate' | 'fund_manager' | 'monitor' | 'investor';

export interface Permission { module: string; actions: string[]; }
export interface Role { _id: string; name: string; roleGroup: RoleGroup; permissions: Permission[]; isActive: boolean; }

export interface MockUser {
  _id: string; firstName: string; lastName: string; emailId: string;
  roleGroup: RoleGroup; roleId: string; status: 'active' | 'pending' | 'deactivated';
  investorStatus?: string; password: string; // mock only (plaintext demo)
}

export interface JwtPayload { sub: string; email: string; roleGroup: RoleGroup; permissions: Permission[]; }

export type FundStatus = 'draft' | 'upcoming' | 'live' | 'closed';
export interface BankDetails {
  bankName: string; accountName: string; accountNumber: string;
  routingCode: string; swift?: string; branch?: string;
  instructions: string; uploadedBy: string; updatedAt: string;
}
export interface FundOffering {
  _id: string; fundName: string; fundType: 'equity' | 'debt' | 'real_estate' | 'private_equity';
  targetIrr?: number; minimumInvestment: number; offerPricePerUnit: number;
  offeringSize: number; nav?: number; returnPercentage?: number;
  sector: string; subSector: string; headquarters?: string; foundedOn?: string;
  subscriptionStart?: string; subscriptionEnd?: string;
  status: FundStatus; managers: string[]; affiliates: string[];
  faqs: { q: string; a: string }[]; keyRisks: string;
  bankDetails?: BankDetails; opportunityId?: string;
  raised?: number; // mock subscribed amount; progress = raised / offeringSize
}

export interface QuarterlyPoint { year: number; quarter: string; value: number; }
// Renamed entity: Opportunity (retired ER vault name removed). No legacy strings in code.
export interface Opportunity {
  _id: string; name: string; imageUrl?: string;
  sector: string; subSector: string; rank: number;
  latestQoQ?: number; cumulativeChange?: number;
  quarterlyData: QuarterlyPoint[];
  lastRound?: { round: string; date: string; valuation: number; pps: number };
  tsgPrice?: number; priceChange1Y?: number; activity: 'Limited' | 'Low' | 'Medium' | 'High';
  description: string; fundId?: string;
}

export type IndicationStatus =
  | 'DRAFT' | 'PAYMENT_PROCESSING' | 'SUBSCRIBED' | 'AWAITING_APPROVAL'
  | 'AWAITING_SIGNATURE' | 'APPROVED' | 'REJECTED' | 'ALLOCATED';
export interface Indication {
  _id: string; investorUserId: string; investorAccountId: string;
  fundId: string; opportunityId?: string;
  numberOfUnits: number; investmentAmount: number;
  status: IndicationStatus; createdAt: string; updatedAt: string;
  proofUrl?: string; transferredAt?: string;
}

export interface InvestorAccount {
  _id: string; userId: string;
  accountType: 'INDIVIDUAL' | 'JOINT' | 'LLC' | 'TRUST' | 'IRA' | 'PARTNERSHIP' | 'S_CORP' | 'C_CORP' | 'OTHER';
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
  stepKey?: string; kycName?: string;
}

export type TransferStatus = 'INITIATED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export interface Transfer {
  _id: string; indicationId: string; investorUserId: string;
  totalAmount: number; currency: string; status: TransferStatus;
  method: 'BANK_TRANSFER'; reference: string; createdAt: string;
}

export type DocStatus = 'draft' | 'active' | 'awaiting_approval' | 'approved' | 'rejected' | 'archived';
export interface DocItem {
  _id: string; title: string; category: string;
  documentType: 'subscription' | 'offering' | 'account' | 'compliance' | 'legal' | 'personal' | 'content';
  status: DocStatus; version: number; updatedAt: string; requiresSignature: boolean;
}

export type SignStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
export interface SignatureRequest {
  _id: string; documentId: string; indicationId?: string;
  status: SignStatus; stage: 'WAITING_FOR_INVESTOR' | 'WAITING_FOR_ADVISOR' | 'WAITING_FOR_FUND_MANAGER' | 'ALL_SIGNERS_DONE';
  recipients: { role: string; order: number; status: SignStatus; signedAt?: string; signatureDataUrl?: string }[];
  currentOrder: number; expiresAt: string; reminderCount: number;
}

export interface Article { _id: string; title: string; status: 'draft' | 'published'; category: string; bodyMarkdown: string; updatedAt: string; }

export interface AuditItem { _id: string; module: string; action: string; performedBy: string; createdAt: string; status: string; }
export interface NoticeItem { _id: string; title: string; body: string; category: string; isRead: boolean; createdAt: string; }
