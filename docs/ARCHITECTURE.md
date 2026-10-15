# สถาปัตยกรรมระบบสารสนเทศฉลากดิจิทัล อย.
## (Thai FDA Digital Labeling Platform Architecture & Specification)

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (Multi-Tier Enterprise Architecture)

ระบบฉลากดิจิทัลของสำนักงานคณะกรรมการอาหารและยา (อย.) ได้รับการออกแบบตามมาตรฐานสถาปัตยกรรมรัฐบาลดิจิทัล (Digital Government Enterprise Architecture) รองรับการประมวลผลแบบกระจายตัว ความมั่นคงปลอดภัยระดับสูง และการขยายตัวเพื่อรองรับการสแกน QR Code จากผู้บริโภคพร้อมกันจำนวนมาก

```mermaid
flowchart TB
    subgraph Presentation ["Presentation Layer"]
        VercelClient["Frontend Web App (React 18 + TS + Tailwind CSS)"]
        MobileScan["Citizen Mobile QR Scanner"]
        Backoffice["Back-office Portal (5 Roles: RBAC)"]
    end

    subgraph APILayer ["API Layer (Target: ASP.NET Core Web API)"]
        Gateway["Reverse Proxy / API Gateway (IIS / YARP / WAF)"]
        AuthModule["Auth Controller (OAuth2 / ThaID / SKYNET Adapter)"]
        LabelModule["Digital Label Controller"]
        ReviewModule["Officer Review Workspace Controller"]
        PublicModule["Public Label Read-Optimized Controller"]
        AuditModule["Audit & Security Controller"]
    end

    subgraph DomainLayer ["Business Logic & Workflow Engine"]
        WorkflowEngine["Label State Machine Engine"]
        ChecklistEngine["Review Checklist Evaluator"]
        QRService["QR Code ISO/IEC 18004 Generator"]
        AuditService["Structured Audit Logger (Immutable)"]
    end

    subgraph DataLayer ["Data Access Layer (Entity Framework Core)"]
        DbContext["ThaiFdaDbContext (C# POCOs)"]
        CacheLayer["Distributed Cache (Redis / MemoryCache)"]
    end

    subgraph StorageLayer ["Database & Infrastructure"]
        SQLServer[("Microsoft SQL Server 2022 Enterprise")]
        GDCCCloud["Government Data Center and Cloud (GDCC)"]
        DocBlob["Secure PDF & Media Storage"]
    end

    subgraph Integrations ["External Integration Adapters"]
        ThaID["Digital ID / ThaID (DOPA)"]
        SKYNET["อย. SKYNET SSO"]
        ESubmission["อย. e-Submission Web Service"]
    end

    MobileScan --> Gateway
    Backoffice --> Gateway
    Gateway --> PublicModule & AuthModule & LabelModule & ReviewModule & AuditModule
    PublicModule --> CacheLayer
    LabelModule --> WorkflowEngine
    ReviewModule --> ChecklistEngine
    AuditModule --> AuditService
    WorkflowEngine & ChecklistEngine --> DbContext
    DbContext --> SQLServer
    AuthModule -.-> ThaID & SKYNET
    LabelModule -.-> ESubmission
```

---

## 2. ผังโครงสร้างฐานข้อมูล (Entity-Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : grants
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : contains

    ENTREPRENEURS ||--o{ ENTREPRENEUR_REPRESENTATIVES : authorizes
    ENTREPRENEURS ||--o{ PRODUCTS : owns
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : categorizes

    PRODUCTS ||--o{ DIGITAL_LABELS : has
    DIGITAL_LABELS ||--o{ DIGITAL_LABEL_VERSIONS : tracks
    DIGITAL_LABELS ||--o{ DIGITAL_LABEL_DOCUMENTS : contains
    DIGITAL_LABELS ||--o{ LABEL_REQUESTS : requested_in
    DIGITAL_LABELS ||--o{ QR_SCAN_EVENTS : generates
    
    LABEL_REQUESTS ||--o{ LABEL_REVIEWS : reviewed_by
    LABEL_REVIEWS ||--o{ REVIEW_CHECKLISTS : contains
    
    USERS ||--o{ AUDIT_LOGS : performs
```

---

## 3. ผังขั้นตอนการเปลี่ยนสถานะฉลาก (Label State Machine Workflow)

```mermaid
stateDiagram-v2
    [*] --> Draft : ผู้ประกอบการสร้างแบบร่าง
    Draft --> Draft : แก้ไขข้อมูล / แนบ PDF
    Draft --> PendingReview : ผู้ประกอบการกด "ยื่นคำขอ (Submit)"
    
    PendingReview --> InReview : เจ้าหน้าที่ อย. กด "รับเรื่องพิจารณา (Claim)"
    InReview --> RevisionRequired : ตรวจ Checklist ไม่ผ่าน / ส่งกลับแก้ไข
    RevisionRequired --> InReview : ผู้ประกอบการแก้ไขและยื่นใหม่
    
    InReview --> Approved : เจ้าหน้าที่ อย. ตรวจ Checklist ผ่านครบ 100%
    InReview --> Rejected : เจ้าหน้าที่ อย. สั่งไม่อนุมัติคำขอ
    
    Approved --> Published : ผู้ประกอบการกด "เผยแพร่ฉลาก (Publish)"
    Published --> Suspended : อย. สั่งระงับฉลากชั่วคราว (พบสารต้องห้าม)
    Suspended --> Published : อย. ยกเลิกคำสั่งระงับ
    Rejected --> [*]
```

---

## 4. แนวทางการนำขึ้นระบบ Production (Deployment Guide)

### 4.1 การ Deploy บน Vercel (Frontend Client)
1. **Repository Setup**: เชื่อมต่อ Git Repository เข้ากับ Vercel Dashboard
2. **Framework Preset**: เลือก `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **SPA Routing**: โปรเจกต์มีไฟล์ `vercel.json` กำหนด SPA URL Rewrites ไว้อย่างสมบูรณ์ ทำให้ URL เช่น `/verify/:newcode` สามารถ Refresh ได้โดยไม่ติด 404

### 4.2 การนำขึ้น Windows Server 2022 + IIS
สำหรับสภาพแวดล้อมเครือข่ายภายในภาครัฐ (Intranet) หรือเครือข่าย GDCC:
1. ติดตั้ง **IIS** พร้อมโมดูล **URL Rewrite Module 2.1**
2. ติดตั้ง **ASP.NET Core Hosting Bundle (v8.0 หรือ v9.0)**
3. นำไฟล์จากโฟลเดอร์ `dist/` วางใน `C:\inetpub\wwwroot\fda-digital-labeling`
4. สร้างไฟล์ `web.config` สำหรับ IIS URL Rewrite:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

### 4.3 การนำขึ้น Government Data Center and Cloud (GDCC)
- **Containerization**: มีแนวทางสร้าง Docker Container โดยใช้ Base Image `mcr.microsoft.com/dotnet/aspnet` สำหรับ API และ `nginx:alpine` สำหรับ Static Frontend
- **Private Subnet**: วาง SQL Server 2022 ไว้ใน Private Subnet ที่ไม่มี Public IP
- **Web Application Firewall (WAF)**: กำหนดกฎเกณฑ์ป้องกัน OWASP Top 10, SQL Injection และ Rate Limiting สำหรับ Public Scan API

---

## 5. นโยบายความมั่นคงปลอดภัยและการปฏิบัติตาม PDPA

1. **Authentication**: ออกแบบ Adapter สำหรับ Digital ID / ThaID (DOPA) และ SKYNET SSO ในโหมด Demo ได้แสดงสถานะ `Integration Placeholder` อย่างโปร่งใส ไม่มีการหลอกว่าเชื่อมต่อจริง
2. **Role-Based Access Control (RBAC)**: กำหนด 5 บทบาทแยกขาดจากกัน (Public, Entrepreneur, Officer, Admin, Auditor) และตรวจสอบสิทธิ์ทั้งในฝั่ง Frontend และ API Layer
3. **Data Minimization (PDPA)**: การสแกนฉลากสาธารณะจะไม่เก็บพิกัด GPS ละเอียดโดยอัตโนมัติ จะเก็บเพียงระดับกลุ่มจังหวัดและสถิติอุปกรณ์เพื่อความปลอดภัยของผู้บริโภค
4. **Immutable Audit Trail**: บันทึก Audit Log ทุกเหตุการณ์สำคัญ (Login, Draft, Submit, Approve, Suspend) ไม่เปิดให้ผู้ใช้หรือผู้ตรวจลบหรือแก้ไขย้อนหลัง
