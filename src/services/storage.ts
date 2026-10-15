import { 
  Product, 
  DigitalLabel, 
  User, 
  Representative, 
  IntegrationStatus, 
  SystemConfig, 
  AuditLog, 
  ReviewChecklistItem,
  UserRole
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_LABELS, 
  INITIAL_USERS, 
  INITIAL_REPRESENTATIVES, 
  INITIAL_INTEGRATIONS, 
  INITIAL_SYSTEM_CONFIG, 
  INITIAL_AUDIT_LOGS,
  INITIAL_CHECKLIST_TEMPLATE
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
  CURRENT_USER: 'thai_fda_current_user_v1'
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

  public saveLabel(label: DigitalLabel, currentUser?: User): void {
    const labels = this.getLabels();
    const existingIndex = labels.findIndex(l => l.id === label.id);
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

    if (currentUser) {
      this.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: existingIndex >= 0 ? 'UPDATE_LABEL' : 'CREATE_LABEL',
        resourceType: 'DIGITAL_LABEL',
        resourceId: label.id,
        result: 'SUCCESS',
        details: `บันทึกข้อมูลฉลากดิจิทัล: ${label.titleTh} (สถานะ: ${label.status})`
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
}

export const storage = new StorageEngine();
