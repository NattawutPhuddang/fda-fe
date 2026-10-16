import { 
  Product, 
  DigitalLabel, 
  User, 
  Representative, 
  IntegrationStatus, 
  SystemConfig, 
  AuditLog, 
  ReviewChecklistItem,
  UserRole,
  SystemNotification,
  LabelTimelineEvent,
  DigitalLabelVersionRecord
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_LABELS, 
  INITIAL_USERS, 
  INITIAL_REPRESENTATIVES, 
  INITIAL_INTEGRATIONS, 
  INITIAL_SYSTEM_CONFIG, 
  INITIAL_AUDIT_LOGS,
  INITIAL_CHECKLIST_TEMPLATE,
  INITIAL_NOTIFICATIONS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_LABEL_VERSIONS
} from './seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'thai_fda_products_v1',
  LABELS: 'thai_fda_labels_v1',
  USERS: 'thai_fda_users_v1',
  REPRESENTATIVES: 'thai_fda_reps_v1',
  INTEGRATIONS: 'thai_fda_integrations_v1',
  CONFIG: 'thai_fda_config_v1',
  AUDIT_LOGS: 'thai_fda_audit_logs_v1',
  CHECKLISTS: 'thai_fda_checklists_v1',
  CURRENT_USER: 'thai_fda_current_user_v1',
  NOTIFICATIONS: 'thai_fda_notifications_v1',
  TIMELINE: 'thai_fda_timeline_v1',
  VERSIONS: 'thai_fda_versions_v1'
};

class StorageEngine {
  constructor() {
    this.initIfEmpty();
  }

  public initIfEmpty(forceReset = false): void {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(INITIAL_LABELS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.REPRESENTATIVES, JSON.stringify(INITIAL_REPRESENTATIVES));
      localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(INITIAL_INTEGRATIONS));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_SYSTEM_CONFIG));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(INITIAL_TIMELINE_EVENTS));
      localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(INITIAL_LABEL_VERSIONS));
    }
  }

  // --- Products ---
  public getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  }

  public saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  public getProductByNewcode(newcode: string): Product | undefined {
    const clean = newcode.trim().toUpperCase();
    return this.getProducts().find(p => 
      p.newcode.toUpperCase() === clean || 
      p.regNumber.toUpperCase() === clean ||
      p.id === newcode
    );
  }

  // --- Labels ---
  public getLabels(): DigitalLabel[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LABELS);
    return raw ? JSON.parse(raw) : INITIAL_LABELS;
  }

  public saveLabels(labels: DigitalLabel[]): void {
    localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
  }

  public getLabelById(id: string): DigitalLabel | undefined {
    return this.getLabels().find(l => l.id === id);
  }

  public getLabelByProductId(productId: string): DigitalLabel | undefined {
    return this.getLabels().find(l => l.productId === productId);
  }

  public saveLabel(label: DigitalLabel, currentUser?: User, timelineNotes?: string): void {
    const labels = this.getLabels();
    const existingIndex = labels.findIndex(l => l.id === label.id);
    const prevLabel = existingIndex >= 0 ? labels[existingIndex] : null;

    if (existingIndex >= 0) {
      labels[existingIndex] = { ...label, updatedAt: new Date().toISOString() };
    } else {
      labels.push({ ...label, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveLabels(labels);

    // Update product activeLabel reference
    const products = this.getProducts();
    const product = products.find(p => p.id === label.productId);
    if (product) {
      product.activeLabelId = label.id;
      product.activeLabelStatus = label.status;
      this.saveProducts(products);
    }

    // Status change timeline & notification detection
    const isNew = existingIndex < 0;
    const statusChanged = !prevLabel || prevLabel.status !== label.status;
    const versionChanged = prevLabel && prevLabel.version !== label.version;

    if (statusChanged || isNew || versionChanged) {
      let action = 'UPDATE_LABEL';
      let eventTitle = 'อัปเดตข้อมูลฉลาก';
      let notifType: 'info' | 'success' | 'warning' | 'error' = 'info';

      if (label.status === 'pending_review') {
        action = 'SUBMIT_REQUEST';
        eventTitle = isNew ? 'ยื่นคำขอฉลากใหม่' : `ยื่นส่งคำขอพิจารณาใหม่ (v${label.version}.0)`;
        notifType = 'info';
      } else if (label.status === 'in_review') {
        action = 'CLAIM_REQUEST';
        eventTitle = 'เจ้าหน้าที่ อย. รับเรื่องพิจารณา';
        notifType = 'info';
      } else if (label.status === 'revision_required') {
        action = 'REQUEST_REVISION';
        eventTitle = 'เจ้าหน้าที่ อย. ส่งกลับแก้ไข';
        notifType = 'warning';
      } else if (label.status === 'approved') {
        action = 'APPROVE';
        eventTitle = 'ผ่านการอนุมัติเนื้อหาฉลากจาก อย.';
        notifType = 'success';
      } else if (label.status === 'published') {
        action = 'PUBLISH';
        eventTitle = `เผยแพร่ฉลากดิจิทัลสู่สาธารณะ (v${label.version}.0)`;
        notifType = 'success';
        // Auto create snapshot
        this.createLabelVersionSnapshot(label, currentUser, timelineNotes || 'เผยแพร่ฉลากเวอร์ชันใช้งานจริง');
      } else if (label.status === 'suspended') {
        action = 'SUSPEND';
        eventTitle = 'คำสั่งระงับการใช้ฉลากดิจิทัลชั่วคราว';
        notifType = 'error';
      }

      this.addTimelineEvent({
        labelId: label.id,
        version: label.version,
        actorName: currentUser?.fullName || (label.status === 'revision_required' || label.status === 'approved' || label.status === 'in_review' ? 'เจ้าหน้าที่ อย.' : 'ผู้ประกอบการ'),
        actorRole: currentUser?.role || (label.status === 'revision_required' || label.status === 'approved' || label.status === 'in_review' ? 'officer' : 'entrepreneur'),
        action,
        status: label.status,
        notes: timelineNotes || label.revisionNotes || label.suspendedReason || eventTitle
      });

      this.addNotification({
        userId: currentUser?.role === 'entrepreneur' ? undefined : 'usr-entrepreneur-01',
        title: `${eventTitle}: ${label.titleTh.slice(0, 35)}...`,
        message: timelineNotes || label.revisionNotes || `สถานะของฉลาก "${label.titleTh}" เปลี่ยนเป็น ${label.status}`,
        type: notifType,
        link: `/entrepreneur/labels/${label.id}/edit`
      });
    }

    if (currentUser) {
      this.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: existingIndex >= 0 ? 'UPDATE_LABEL' : 'CREATE_LABEL',
        resourceType: 'DIGITAL_LABEL',
        resourceId: label.id,
        result: 'SUCCESS',
        details: `บันทึกข้อมูลฉลากดิจิทัล: ${label.titleTh} (สถานะ: ${label.status}, เวอร์ชัน: v${label.version})`
      });
    }
  }

  // --- Users ---
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.addAuditLog({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: 'USER_LOGIN',
        resourceType: 'AUTH_SESSION',
        resourceId: `session-${Date.now()}`,
        result: 'SUCCESS',
        details: `เข้าสู่ระบบสำเร็จในบทบาท: ${user.role} (${user.organization || user.department})`
      });
    } else {
      const current = this.getCurrentUser();
      if (current) {
        this.addAuditLog({
          userId: current.id,
          userName: current.fullName,
          userRole: current.role,
          action: 'USER_LOGOUT',
          resourceType: 'AUTH_SESSION',
          resourceId: `session-logout`,
          result: 'SUCCESS',
          details: `ออกจากระบบโดยผู้ใช้: ${current.fullName}`
        });
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'correlationId'> & { ipAddress?: string }): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: entry.ipAddress || '127.0.0.1 (Local Client)',
      correlationId: `corr-${Math.random().toString(36).substring(2, 9)}`,
      ...entry
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500))); // Keep last 500
  }

  // --- Representatives ---
  public getRepresentatives(): Representative[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPRESENTATIVES);
    return raw ? JSON.parse(raw) : INITIAL_REPRESENTATIVES;
  }

  public saveRepresentatives(reps: Representative[]): void {
    localStorage.setItem(STORAGE_KEYS.REPRESENTATIVES, JSON.stringify(reps));
  }

  // --- Integrations ---
  public getIntegrations(): IntegrationStatus[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    return raw ? JSON.parse(raw) : INITIAL_INTEGRATIONS;
  }

  public saveIntegrations(integrations: IntegrationStatus[]): void {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
  }

  // --- System Config ---
  public getSystemConfig(): SystemConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_SYSTEM_CONFIG;
  }

  public saveSystemConfig(config: SystemConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  // --- Review Checklists ---
  public getChecklistForLabel(labelId: string): ReviewChecklistItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    const map = raw ? JSON.parse(raw) : {};
    return map[labelId] || JSON.parse(JSON.stringify(INITIAL_CHECKLIST_TEMPLATE));
  }

  public saveChecklistForLabel(labelId: string, items: ReviewChecklistItem[]): void {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    const map = raw ? JSON.parse(raw) : {};
    map[labelId] = items;
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(map));
  }

  // --- Notifications ---
  public getNotifications(): SystemNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  }

  public saveNotifications(notifications: SystemNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  public addNotification(notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>): SystemNotification {
    const all = this.getNotifications();
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notif
    };
    all.unshift(newNotif);
    this.saveNotifications(all.slice(0, 100)); // Keep last 100
    return newNotif;
  }

  public markNotificationRead(id: string): void {
    const all = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications(all);
  }

  public markAllNotificationsRead(): void {
    const all = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(all);
  }

  // --- Timeline ---
  public getTimelineForLabel(labelId: string): LabelTimelineEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    const all: LabelTimelineEvent[] = raw ? JSON.parse(raw) : INITIAL_TIMELINE_EVENTS;
    return all
      .filter(t => t.labelId === labelId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public addTimelineEvent(event: Omit<LabelTimelineEvent, 'id' | 'timestamp'> & { timestamp?: string }): LabelTimelineEvent {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMELINE);
    const all: LabelTimelineEvent[] = raw ? JSON.parse(raw) : INITIAL_TIMELINE_EVENTS;
    const newEvent: LabelTimelineEvent = {
      id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      ...event
    };
    all.push(newEvent);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(all));
    return newEvent;
  }

  // --- Versions ---
  public getLabelVersions(labelId: string): DigitalLabelVersionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    const all: DigitalLabelVersionRecord[] = raw ? JSON.parse(raw) : INITIAL_LABEL_VERSIONS;
    return all
      .filter(v => v.labelId === labelId)
      .sort((a, b) => b.version - a.version);
  }

  public getLabelVersionById(versionId: string): DigitalLabelVersionRecord | undefined {
    const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    const all: DigitalLabelVersionRecord[] = raw ? JSON.parse(raw) : INITIAL_LABEL_VERSIONS;
    return all.find(v => v.id === versionId);
  }

  public saveLabelVersion(record: DigitalLabelVersionRecord): void {
    const raw = localStorage.getItem(STORAGE_KEYS.VERSIONS);
    const all: DigitalLabelVersionRecord[] = raw ? JSON.parse(raw) : INITIAL_LABEL_VERSIONS;
    const idx = all.findIndex(v => v.id === record.id);
    if (idx >= 0) {
      all[idx] = record;
    } else {
      all.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.VERSIONS, JSON.stringify(all));
  }

  public createLabelVersionSnapshot(label: DigitalLabel, user?: User, changeLog?: string): DigitalLabelVersionRecord {
    const record: DigitalLabelVersionRecord = {
      id: `ver-${label.id}-v${label.version}-${Date.now()}`,
      labelId: label.id,
      version: label.version,
      titleTh: label.titleTh,
      titleEn: label.titleEn,
      status: label.status,
      snapshot: JSON.parse(JSON.stringify(label)),
      changeLog: changeLog || (label.status === 'published' ? 'เผยแพร่ฉลากอย่างเป็นทางการ' : 'บันทึกประวัติการปรับปรุงฉลาก'),
      changedByName: user?.fullName || 'ผู้ประกอบการ',
      changedByRole: user?.role || 'entrepreneur',
      createdAt: new Date().toISOString()
    };
    this.saveLabelVersion(record);
    return record;
  }

  // --- Representative Authority Check ---
  public checkRepresentativeAuthority(requiredScope?: string): { allowed: boolean; reason?: string; representative?: Representative } {
    const reps = this.getRepresentatives();
    if (!reps || reps.length === 0) {
      return { allowed: true }; // Company owner
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    // Find representative for current entrepreneur
    const rep = reps[0];
    if (rep.status === 'REVOKED') {
      return {
        allowed: false,
        reason: `หนังสือมอบอำนาจของ ${rep.fullName} ถูกเพิกถอนสิทธิ์แล้ว (สถานะ: REVOKED) ไม่สามารถดำเนินการได้ตามกฎหมาย`,
        representative: rep
      };
    }

    if (rep.endDate && rep.endDate < todayStr) {
      return {
        allowed: false,
        reason: `หนังสือมอบอำนาจของ ${rep.fullName} สิ้นสุดอายุเมื่อ ${rep.endDate} (สถานะ: EXPIRED) กรุณาต่ออายุหนังสือมอบอำนาจในระบบ`,
        representative: rep
      };
    }

    if (requiredScope && rep.scopeOfAuthority) {
      const hasScope = rep.scopeOfAuthority.some(s => s.toLowerCase().includes(requiredScope.toLowerCase()));
      if (!hasScope) {
        return {
          allowed: false,
          reason: `ตัวแทนไม่มีขอบเขตอำนาจในส่วน: "${requiredScope}" (ขอบเขตที่ได้รับมอบ: ${rep.scopeOfAuthority.join(', ')})`,
          representative: rep
        };
      }
    }

    return { allowed: true, representative: rep };
  }
}

export const storage = new StorageEngine();
