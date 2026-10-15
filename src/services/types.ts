export type UserRole = 'public' | 'entrepreneur' | 'officer' | 'admin' | 'auditor';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  organization?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt: string;
  avatarUrl?: string;
  permissions: string[];
}

export type ProductCategory = 'food' | 'drug' | 'cosmetic' | 'medical_device' | 'hazardous';

export type RegistrationStatus = 'active' | 'suspended' | 'revoked' | 'expired';

export type LabelStatus = 
  | 'draft'              // แบบร่าง
  | 'pending_review'     // ยื่นคำขอแล้ว รอเจ้าหน้าที่รับเรื่อง
  | 'in_review'          // อยู่ระหว่างการพิจารณา
  | 'revision_required'  // ส่งกลับแก้ไข
  | 'approved'           // ผ่านการอนุมัติ (รอผู้ประกอบการกดเผยแพร่)
  | 'published'          // เผยแพร่แล้ว (ประชาชนสแกนได้)
  | 'suspended'          // ถูกสั่งระงับชั่วคราว
  | 'rejected';          // ไม่อนุมัติ

export interface NutritionFact {
  servingSize: string;
  servingsPerContainer: string;
  totalEnergy: string;
  energyFromFat: string;
  nutrients: Array<{
    name: string;
    amount: string;
    percentDailyValue: string;
  }>;
}

export interface DrugSpecifics {
  genericName: string;
  dosageForm: string;
  strength: string;
  indications: string;
  contraindications: string;
  dosageAndAdministration: string;
  storageConditions: string;
  leafletPdfUrl: string;
}

export interface CosmeticSpecifics {
  ingredients: string[];
  usageInstructions: string;
  warnings: string;
  netVolume: string;
  batchNumber: string;
  mfgDate: string;
  expDate: string;
}

export interface LabelDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  size: string;
}

export interface DigitalLabel {
  id: string;
  productId: string;
  version: number;
  status: LabelStatus;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  imageUrl: string;
  additionalImages?: string[];
  nutritionFacts?: NutritionFact;
  drugDetails?: DrugSpecifics;
  cosmeticDetails?: CosmeticSpecifics;
  generalWarningTh: string;
  generalWarningEn: string;
  storageWarningTh: string;
  storageWarningEn: string;
  documents: LabelDocument[];
  qrCodeSvg?: string;
  qrCodePng?: string;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  suspendedReason?: string;
  revisionNotes?: string;
  currentOfficerId?: string;
  currentOfficerName?: string;
}

export interface Product {
  id: string;
  newcode: string;
  regNumber: string;
  productNameTh: string;
  productNameEn: string;
  category: ProductCategory;
  categoryNameTh: string;
  entrepreneurId: string;
  entrepreneurName: string;
  taxId: string;
  manufacturerName: string;
  manufacturerAddress: string;
  importerName?: string;
  importerAddress?: string;
  approvedDate: string;
  expiryDate: string;
  registrationStatus: RegistrationStatus;
  lastSyncedAt: string;
  eSubmissionRef: string;
  activeLabelId?: string;
  activeLabelStatus?: LabelStatus;
}

export interface ReviewChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  passed: boolean;
  notes?: string;
}

export interface LabelReview {
  id: string;
  labelId: string;
  officerId: string;
  officerName: string;
  reviewedAt: string;
  action: 'CLAIM' | 'SAVE_DRAFT' | 'REQUEST_REVISION' | 'APPROVE' | 'REJECT' | 'SUSPEND' | 'UNSUSPEND';
  notes: string;
  checklist: ReviewChecklistItem[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  result: 'SUCCESS' | 'FAILED' | 'WARNING';
  ipAddress: string;
  correlationId: string;
  details: string;
}

export interface ScanAnalyticsData {
  totalScans: number;
  todayScans: number;
  weeklyTrend: Array<{ date: string; scans: number }>;
  monthlyTrend: Array<{ month: string; scans: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  browserBreakdown: Array<{ name: string; value: number }>;
  topRegions: Array<{ region: string; count: number; percentage: number }>;
}

export interface Representative {
  id: string;
  entrepreneurId: string;
  fullName: string;
  idCardNumber: string;
  email: string;
  phoneNumber: string;
  scopeOfAuthority: string[];
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  verifiedFromDBD: boolean;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  serviceType: 'THAID' | 'SKYNET' | 'E_SUBMISSION' | 'SQL_SERVER' | 'GDCC' | 'NOTIFICATION';
  description: string;
  endpointUrl: string;
  status: 'NOT_CONNECTED' | 'PLACEHOLDER' | 'ERROR' | 'CONFIGURED';
  lastSyncAt: string | null;
  errorMessage: string | null;
  isMock: boolean;
  notes: string;
}

export interface SystemConfig {
  idleTimeoutMinutes: number;
  defaultLanguage: 'th' | 'en';
  enableAuditLogging: boolean;
  logRetentionDays: number;
  qrCodeDefaultCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  requireOfficerChecklistComplete: boolean;
  allowEntrepreneurSelfPublish: boolean;
  maintenanceMode: boolean;
}
