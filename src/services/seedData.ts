import { 
  Product, 
  DigitalLabel, 
  User, 
  Representative, 
  IntegrationStatus, 
  SystemConfig, 
  AuditLog, 
  ReviewChecklistItem,
  ChecklistTemplateItem,
  SystemNotification,
  LabelTimelineEvent,
  DigitalLabelVersionRecord
} from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-entrepreneur-01',
    username: 'somsak.ent',
    fullName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    email: 'somsak@siambiotech.co.th',
    role: 'entrepreneur',
    department: 'ฝ่ายขึ้นทะเบียนและพัฒนาผลิตภัณฑ์',
    organization: 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด',
    phoneNumber: '02-555-8900',
    isActive: true,
    lastLoginAt: '2026-10-15T09:30:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    permissions: ['VIEW_OWN_PRODUCTS', 'CREATE_LABEL', 'EDIT_LABEL', 'SUBMIT_LABEL', 'PUBLISH_LABEL', 'DOWNLOAD_QR']
  },
  {
    id: 'usr-officer-01',
    username: 'officer.fda',
    fullName: 'ภญ. วรรณภา สิริกุล',
    email: 'wannapa.s@fda.moph.go.th',
    role: 'officer',
    department: 'กองกำกับและตรวจสอบผลิตภัณฑ์ (อย.)',
    organization: 'สำนักงานคณะกรรมการอาหารและยา',
    phoneNumber: '02-590-7000 ต่อ 7123',
    isActive: true,
    lastLoginAt: '2026-10-15T11:15:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    permissions: ['VIEW_ALL_REQUESTS', 'CLAIM_REQUEST', 'REVIEW_CHECKLIST', 'REQUEST_REVISION', 'APPROVE_LABEL', 'REJECT_LABEL', 'SUSPEND_LABEL', 'EXPORT_REPORTS']
  },
  {
    id: 'usr-admin-01',
    username: 'admin.fda',
    fullName: 'นายธนกร รัตนชัย',
    email: 'thanakorn.r@fda.moph.go.th',
    role: 'admin',
    department: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร',
    organization: 'สำนักงานคณะกรรมการอาหารและยา',
    phoneNumber: '02-590-7999',
    isActive: true,
    lastLoginAt: '2026-10-15T13:00:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    permissions: ['MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_MASTER_DATA', 'MANAGE_CONFIG', 'MANAGE_INTEGRATION', 'VIEW_AUDIT_LOGS']
  },
  {
    id: 'usr-auditor-01',
    username: 'auditor.gov',
    fullName: 'นางสาวกุลธิดา ประเสริฐสุข',
    email: 'kuntida.audit@oag.go.th',
    role: 'auditor',
    department: 'สำนักตรวจสอบระบบเทคโนโลยีสารสนเทศภาครัฐ',
    organization: 'สำนักงานการตรวจเงินแผ่นดิน (สตง.)',
    phoneNumber: '02-618-5700',
    isActive: true,
    lastLoginAt: '2026-10-14T16:45:00Z',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    permissions: ['VIEW_AUDIT_LOGS', 'EXPORT_AUDIT_LOGS', 'VIEW_READONLY_OVERSIGHT']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    newcode: 'U1FD0001012345678901234567C',
    regNumber: '10-1-04760-5-0012',
    productNameTh: 'เครื่องดื่มรังนกแท้สำเร็จรูป ผสมโสมสกัด ตรา เฮลท์โกลด์',
    productNameEn: 'HealthGold Instant Bird\'s Nest Beverage with Ginseng Extract',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม',
    entrepreneurId: 'ent-01',
    entrepreneurName: 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด',
    taxId: '0105556012345',
    manufacturerName: 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด (โรงงานบางปู)',
    manufacturerAddress: '123 นิคมอุตสาหกรรมบางปู ซอย 8 ตำบลบางปูใหม่ อำเภอเมือง จังหวัดสมุทรปราการ 10280',
    approvedDate: '2024-03-15',
    expiryDate: '2029-03-14',
    registrationStatus: 'active',
    lastSyncedAt: '2026-10-15T03:00:00Z',
    eSubmissionRef: 'ESUB-FD-2024-009842',
    activeLabelId: 'lbl-001',
    activeLabelStatus: 'published'
  },
  {
    id: 'prod-002',
    newcode: 'U1DR0002012345678901234567C',
    regNumber: '1A 45/65',
    productNameTh: 'ยาเม็ดพาราเซตามอล 500 มิลลิกรัม ตรา สยามฟาร์มา',
    productNameEn: 'SiamPharma Paracetamol Tablets 500 mg',
    category: 'drug',
    categoryNameTh: 'ยาแผนปัจจุบัน',
    entrepreneurId: 'ent-01',
    entrepreneurName: 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด',
    taxId: '0105556012345',
    manufacturerName: 'บริษัท สยามฟาร์มาซูติคอล แลบอราทอรี่ส์ จำกัด',
    manufacturerAddress: '88/1 ถนนรังสิต-นครนายก ตำบลรังสิต อำเภอธัญบุรี จังหวัดปทุมธานี 12110',
    approvedDate: '2022-08-10',
    expiryDate: '2027-08-09',
    registrationStatus: 'active',
    lastSyncedAt: '2026-10-15T03:00:00Z',
    eSubmissionRef: 'ESUB-DR-2022-004512',
    activeLabelId: 'lbl-002',
    activeLabelStatus: 'pending_review'
  },
  {
    id: 'prod-003',
    newcode: 'U1CM0003012345678901234567C',
    regNumber: '10-1-6600123',
    productNameTh: 'ครีมบำรุงผิวหน้า ไวท์เทนนิ่ง ออร่า โกลว์ สกิน',
    productNameEn: 'Whitening Aura Glow Skin Face Cream',
    category: 'cosmetic',
    categoryNameTh: 'เครื่องสำอาง',
    entrepreneurId: 'ent-01',
    entrepreneurName: 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด',
    taxId: '0105556012345',
    manufacturerName: 'บิวตี้คอสเมติก อินเตอร์เนชั่นแนล บจก.',
    manufacturerAddress: '45 หมู่ 4 ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120',
    approvedDate: '2023-05-20',
    expiryDate: '2026-05-19',
    registrationStatus: 'suspended',
    lastSyncedAt: '2026-10-15T03:00:00Z',
    eSubmissionRef: 'ESUB-CM-2023-018231',
    activeLabelId: 'lbl-003',
    activeLabelStatus: 'suspended'
  },
  {
    id: 'prod-004',
    newcode: 'U1FD0004012345678901234567C',
    regNumber: '11-1-08862-5-0034',
    productNameTh: 'ผลิตภัณฑ์เสริมอาหาร น้ำมันปลา โอเมก้า 3 พลัส วิตามินอี',
    productNameEn: 'Omega-3 Fish Oil Plus Vitamin E Dietary Supplement',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม (เสริมอาหาร)',
    entrepreneurId: 'ent-01',
    entrepreneurName: 'บริษัท สยามไบโอเทค เฮลท์แคร์ จำกัด',
    taxId: '0105556012345',
    manufacturerName: 'ไบโอเฮลท์ โปรดักส์ชั่น จำกัด',
    manufacturerAddress: '99/5 ตำบลบึงคำพร้อย อำเภอลำลูกกา จังหวัดปทุมธานี 12150',
    approvedDate: '2024-01-11',
    expiryDate: '2029-01-10',
    registrationStatus: 'active',
    lastSyncedAt: '2026-10-15T03:00:00Z',
    eSubmissionRef: 'ESUB-FD-2024-012904',
    activeLabelId: 'lbl-004',
    activeLabelStatus: 'revision_required'
  }
];

export const INITIAL_LABELS: DigitalLabel[] = [
  {
    id: 'lbl-001',
    productId: 'prod-001',
    version: 1,
    status: 'published',
    titleTh: 'เครื่องดื่มรังนกแท้สำเร็จรูป ผสมโสมสกัด ตรา เฮลท์โกลด์ (ขวด 70 มล.)',
    titleEn: 'HealthGold Instant Bird\'s Nest Beverage with Ginseng Extract (70 ml Bottle)',
    descriptionTh: 'เครื่องดื่มรังนกแท้ 100% คัดสรรรังนกเกรดพรีเมียมจากแหล่งธรรมชาติ ผสมผสานสารสกัดโสมเกาหลีแท้ ปรุงรสด้วยน้ำตาลกรวดออร์แกนิก รสชาติกลมกล่อม ดื่มง่าย ผ่านกระบวนการฆ่าเชื้อด้วยระบบสเตอริไลซ์ ปราศจากสารกันเสียและสีสังเคราะห์',
    descriptionEn: '100% genuine premium bird\'s nest harvested from natural sources, blended with authentic Korean ginseng extract. Lightly sweetened with organic rock sugar. Sterilized with modern technology. Free from preservatives and artificial coloring.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
    ],
    nutritionFacts: {
      servingSize: '1 ขวด (70 มิลลิลิตร)',
      servingsPerContainer: '1',
      totalEnergy: '45 กิโลแคลอรี',
      energyFromFat: '0 กิโลแคลอรี',
      nutrients: [
        { name: 'ไขมันทั้งหมด (Total Fat)', amount: '0 ก.', percentDailyValue: '0%' },
        { name: 'โปรตีน (Protein)', amount: '1 ก.', percentDailyValue: '2%' },
        { name: 'คาร์โบไฮเดรตทั้งหมด (Total Carbohydrate)', amount: '10 ก.', percentDailyValue: '3%' },
        { name: 'น้ำตาล (Sugars)', amount: '9 ก.', percentDailyValue: '14%' },
        { name: 'โซเดียม (Sodium)', amount: '15 มก.', percentDailyValue: '1%' },
        { name: 'แคลเซียม (Calcium)', amount: '35 มก.', percentDailyValue: '4%' }
      ]
    },
    generalWarningTh: 'เขย่าขวดก่อนดื่ม เมื่อเปิดฝาแล้วควรดื่มให้หมดทันทีหรือเก็บในตู้เย็นและดื่มให้หมดภายใน 24 ชั่วโมง ผู้ที่มีประวัติแพ้รังนกหรือโสมควรปรึกษาแพทย์ก่อนรับประทาน',
    generalWarningEn: 'Shake well before drinking. Consume immediately after opening or refrigerate and consume within 24 hours. Persons with known allergy to bird\'s nest or ginseng should consult a physician.',
    storageWarningTh: 'เก็บในที่แห้งและเย็น หลีกเลี่ยงแสงแดดและความร้อนโดยตรง',
    storageWarningEn: 'Store in a cool dry place, away from direct sunlight and heat.',
    documents: [
      {
        id: 'doc-001',
        name: 'เอกสารอนุมัติฉลากอาหาร_อย_10-1-04760-5-0012.pdf',
        url: '/sample-label-approval.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-09-01T10:00:00Z',
        size: '1.4 MB'
      },
      {
        id: 'doc-002',
        name: 'ผลการตรวจวิเคราะห์สารอาหาร_LabReport.pdf',
        url: '/sample-lab-report.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-09-01T10:15:00Z',
        size: '850 KB'
      }
    ],
    scanCount: 14820,
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
    submittedAt: '2026-08-20T10:00:00Z',
    approvedAt: '2026-09-02T16:00:00Z',
    publishedAt: '2026-09-05T14:30:00Z',
    currentOfficerId: 'usr-officer-01',
    currentOfficerName: 'ภญ. วรรณภา สิริกุล'
  },
  {
    id: 'lbl-002',
    productId: 'prod-002',
    version: 1,
    status: 'pending_review',
    titleTh: 'ยาเม็ดพาราเซตามอล 500 มก. ตรา สยามฟาร์มา (แผง 10 เม็ด)',
    titleEn: 'SiamPharma Paracetamol Tablets 500 mg (Blister Pack of 10 Tablets)',
    descriptionTh: 'ยาสามัญประจำบ้านแผนปัจจุบัน บรรเทาอาการปวด ลดไข้ สำหรับผู้ใหญ่และเด็กอายุ 12 ปีขึ้นไป ใน 1 เม็ด ประกอบด้วยตัวยาสำคัญ Paracetamol 500 mg',
    descriptionEn: 'Household remedy medicine. Pain reliever and fever reducer. Each tablet contains Paracetamol 500 mg.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    drugDetails: {
      genericName: 'Paracetamol 500 mg',
      dosageForm: 'ยาเม็ดกลมสีขาว (White Round Tablet)',
      strength: '500 mg / เม็ด',
      indications: 'บรรเทาอาการปวดระดับเล็กน้อยถึงปานกลาง เช่น ปวดศีรษะ ปวดฟัน ปวดกล้ามเนื้อ และลดไข้',
      contraindications: 'ห้ามใช้ในผู้ที่แพ้ยาพาราเซตามอล หรือผู้ป่วยโรคตับรุนแรง',
      dosageAndAdministration: 'ผู้ใหญ่และเด็กอายุมากกว่า 12 ปี: รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ (ห้ามรับประทานเกิน 8 เม็ด หรือ 4,000 มก. ต่อวัน)',
      storageConditions: 'เก็บที่อุณหภูมิต่ำกว่า 30 องศาเซลเซียส ป้องกันแสงแดดและความชื้น เก็บให้พ้นมือเด็ก',
      leafletPdfUrl: '/sample-drug-leaflet.pdf'
    },
    generalWarningTh: 'คำเตือน: 1. ถ้าใช้ยานี้เกินขนาดที่ระบุไว้บนฉลาก อาจทำให้เป็นพิษต่อตับได้ และไม่ควรใช้ยานี้ติดต่อกันเกิน 5 วัน 2. ผู้ที่เป็นโรคตับ โรคไต ควรปรึกษาแพทย์หรือเภสัชกรก่อนใช้ยานี้ 3. หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ในระหว่างรับประทานยานี้',
    generalWarningEn: 'Warning: 1. Overdose may cause severe liver damage. Do not exceed recommended dose or use for more than 5 consecutive days. 2. Patients with liver or kidney disease should consult a doctor before use. 3. Avoid alcohol consumption while taking this medication.',
    storageWarningTh: 'เก็บที่อุณหภูมิต่ำกว่า 30°C ในภาชนะปิดสนิท พ้นจากแสงแดดและความชื้น',
    storageWarningEn: 'Store below 30°C in a well-closed container protected from light and moisture.',
    documents: [
      {
        id: 'doc-003',
        name: 'เอกสารกำกับยาฉบับทางการ_1A-45-65.pdf',
        url: '/sample-drug-leaflet.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-10-12T11:00:00Z',
        size: '2.1 MB'
      }
    ],
    scanCount: 320,
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-12T11:00:00Z',
    submittedAt: '2026-10-12T11:30:00Z',
    currentOfficerId: 'usr-officer-01',
    currentOfficerName: 'ภญ. วรรณภา สิริกุล'
  },
  {
    id: 'lbl-003',
    productId: 'prod-003',
    version: 1,
    status: 'suspended',
    titleTh: 'ครีมบำรุงผิวหน้า ไวท์เทนนิ่ง ออร่า โกลว์ สกิน (ขนาด 50 กรัม)',
    titleEn: 'Whitening Aura Glow Skin Face Cream (50g)',
    descriptionTh: 'ครีมบำรุงผิวหน้าเพื่อความกระจ่างใส ช่วยลดเลือนจุดด่างดำ',
    descriptionEn: 'Facial brightening cream for dark spot reduction and skin radiance.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    cosmeticDetails: {
      ingredients: [
        'Aqua/Water',
        'Niacinamide',
        'Glycerin',
        'Cetyl Alcohol',
        'Dimethicone',
        'Titanium Dioxide',
        'Fragrance',
        'Phenoxyethanol'
      ],
      usageInstructions: 'ทาบำรุงผิวหน้าเป็นประจำทุกเช้าและก่อนนอน',
      warnings: 'หากเกิดอาการระคายเคือง ผื่นแดง หรือคัน ให้หยุดใช้ทันทีและพบแพทย์',
      netVolume: '50 g',
      batchNumber: 'LOT-2023-B12',
      mfgDate: '2024-02-01',
      expDate: '2026-02-01'
    },
    generalWarningTh: 'ผลิตภัณฑ์นี้ถูกสำนักงานคณะกรรมการอาหารและยา (อย.) มีคำสั่งระงับการจำหน่ายและเผยแพร่ฉลากชั่วคราว เนื่องจากอยู่ระหว่างตรวจสอบสารต้องห้ามตามประกาศกระทรวงสาธารณสุข',
    generalWarningEn: 'This product has been temporarily suspended by the Thai Food and Drug Administration (FDA) pending safety investigation for non-compliant prohibited substances.',
    storageWarningTh: 'เก็บในที่ร่ม หลีกเลี่ยงความร้อน',
    storageWarningEn: 'Store in cool place away from heat.',
    documents: [
      {
        id: 'doc-004',
        name: 'คำสั่งระงับฉลากและเรียกตรวจ_อย_2026.pdf',
        url: '/sample-suspension-order.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-10-01T15:00:00Z',
        size: '1.1 MB'
      }
    ],
    scanCount: 3890,
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-10-01T15:00:00Z',
    submittedAt: '2026-05-15T09:00:00Z',
    approvedAt: '2026-05-25T11:00:00Z',
    publishedAt: '2026-06-01T08:00:00Z',
    suspendedReason: 'พบผลตรวจวิเคราะห์เบื้องต้นมีสารปรอทและสารประกอบไฮโดรควิโนนปนเปื้อนเกินมาตรฐานความปลอดภัย อยู่ระหว่างดำเนินคดีและเรียกเก็บคืนจากท้องตลาด',
    currentOfficerId: 'usr-officer-01',
    currentOfficerName: 'ภญ. วรรณภา สิริกุล'
  },
  {
    id: 'lbl-004',
    productId: 'prod-004',
    version: 1,
    status: 'revision_required',
    titleTh: 'ผลิตภัณฑ์เสริมอาหาร น้ำมันปลา โอเมก้า 3 พลัส วิตามินอี (60 ซอฟท์เจล)',
    titleEn: 'Omega-3 Fish Oil Plus Vitamin E Dietary Supplement (60 Softgels)',
    descriptionTh: 'ผลิตภัณฑ์เสริมอาหารน้ำมันปลาทะเลน้ำลึก อุดมด้วยกรดไขมันไม่อิ่มตัว EPA 180 มก. และ DHA 120 มก. พร้อมวิตามินอีธรรมชาติ',
    descriptionEn: 'Deep-sea fish oil dietary supplement containing EPA 180 mg, DHA 120 mg with natural Vitamin E.',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    generalWarningTh: 'คำเตือน: เด็กและสตรีมีครรภ์ไม่ควรรับประทาน ห้ามใช้ในผู้ที่แพ้ปลาทะเลหรือน้ำมันปลา ควรระวังในผู้ที่เลือดแข็งตัวช้า หรือผู้ที่ใช้ยาต้านการแข็งตัวของเลือดหรือแอสไพริน ไม่มีผลในการป้องกันหรือรักษาโรค',
    generalWarningEn: 'Warning: Children and pregnant women should not consume. Not suitable for individuals with seafood allergy. Patients taking anticoagulants or aspirin should consult physician. This product does not prevent or cure disease.',
    storageWarningTh: 'เก็บในที่แห้งและเย็น อุณหภูมิไม่เกิน 25 องศาเซลเซียส พ้นจากแสงแดด',
    storageWarningEn: 'Store in dry place below 25°C away from direct sunlight.',
    documents: [
      {
        id: 'doc-005',
        name: 'ร่างฉลากผลิตภัณฑ์เสริมอาหาร_v1.pdf',
        url: '/sample-label-draft.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-10-05T10:00:00Z',
        size: '950 KB'
      }
    ],
    scanCount: 120,
    createdAt: '2026-10-02T14:00:00Z',
    updatedAt: '2026-10-08T16:20:00Z',
    submittedAt: '2026-10-05T10:30:00Z',
    revisionNotes: '1. ข้อความในคำบรรยายหน้าฉลากระบุว่า "ช่วยลดความดันโลหิตและป้องกันหลอดเลือดอุดตัน" เข้าข่ายการโอ้อวดสรรพคุณเกินจริง ขัดต่อ พ.ร.บ.อาหาร พ.ศ. 2522 กรุณาตัดข้อความดังกล่าวออก 2. เอกสารใบรับรอง GMP หมดอายุเมื่อวันที่ 30 กันยายน 2526 กรุณาแนบใบต่ออายุ GMP ฉบับล่าสุด',
    currentOfficerId: 'usr-officer-01',
    currentOfficerName: 'ภญ. วรรณภา สิริกุล'
  }
];


export const INITIAL_REPRESENTATIVES: Representative[] = [
  {
    id: 'rep-01',
    entrepreneurId: 'ent-01',
    fullName: 'นางสาวพิมลวรรณ สุวรรณเวช',
    idCardNumber: '1-1002-00345-67-8',
    email: 'pimonwan.s@siambiotech.co.th',
    phoneNumber: '081-456-7890',
    scopeOfAuthority: [
      'ยื่นคำขอฉลากดิจิทัล (Submit Digital Label)',
      'แก้ไขรายละเอียดแบบร่างฉลาก (Edit Drafts)',
      'ดาวน์โหลดและจัดการ QR Code สำหรับโรงพิมพ์'
    ],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    verifiedFromDBD: true
  },
  {
    id: 'rep-02',
    entrepreneurId: 'ent-01',
    fullName: 'นายเกรียงไกร ชัยชนะ',
    idCardNumber: '3-1005-00123-45-1',
    email: 'kriengkrai.c@regulatory-agent.com',
    phoneNumber: '089-765-4321',
    scopeOfAuthority: [
      'เตรียมข้อมูลและแนบเอกสารเทคนิค (Draft Only)'
    ],
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    status: 'ACTIVE',
    verifiedFromDBD: true
  }
];

export const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'int-01',
    name: 'Digital ID / ThaID (DOPA)',
    serviceType: 'THAID',
    description: 'ระบบยืนยันตัวตนดิจิทัลภาครัฐ กรมการปกครอง กระทรวงมหาดไทย',
    endpointUrl: 'https://imauth.bora.dopa.go.th/api/v2/oauth2/token',
    status: 'PLACEHOLDER',
    lastSyncAt: null,
    errorMessage: 'Integration Placeholder: รอรับ Client ID & Secret และ IP Whitelist จาก สพร./DOPA',
    isMock: true,
    notes: 'ในโหมด Demo นี้ระบบใช้ Mock Persona Authentication ที่มีสิทธิ์ตรงตามบทบาทจริง'
  },
  {
    id: 'int-02',
    name: 'อย. SKYNET Single Sign-On',
    serviceType: 'SKYNET',
    description: 'ระบบลงทะเบียนและยืนยันตัวตนกลางของสำนักงานคณะกรรมการอาหารและยา',
    endpointUrl: 'https://privus.fda.moph.go.th/connect/authorize',
    status: 'PLACEHOLDER',
    lastSyncAt: null,
    errorMessage: 'Integration Placeholder: รอ OpenID Connect Discovery จาก SKYNET Gateway',
    isMock: true,
    notes: 'รองรับการเชื่อมต่อแบบ OAuth 2.0 / OIDC Authorization Code Flow with PKCE'
  },
  {
    id: 'int-03',
    name: 'อย. e-Submission Web Service',
    serviceType: 'E_SUBMISSION',
    description: 'ฐานข้อมูลเลขทะเบียนผลิตภัณฑ์และสารบบเดิม เพื่อซิงก์ Newcode และ Master Data',
    endpointUrl: 'https://esubmission.fda.moph.go.th/api/v1/products/sync',
    status: 'PLACEHOLDER',
    lastSyncAt: '2026-10-15T03:00:00Z',
    errorMessage: 'Integration Placeholder: ข้อมูลจำลอง e-Submission ถูกนำเข้าผ่าน Local Repository',
    isMock: true,
    notes: 'ไม่อนุญาตให้แก้ไขข้อมูลทะเบียนหลักที่เป็นข้อมูลต้นทางจาก e-Submission'
  },
  {
    id: 'int-04',
    name: 'Microsoft SQL Server 2022',
    serviceType: 'SQL_SERVER',
    description: 'ระบบฐานข้อมูลเชิงสัมพันธ์หลักสำหรับจัดเก็บ Digital Labels, Audit Logs และ Versions',
    endpointUrl: 'Server=tcp:sql-fda.internal.moph.go.th,1433;Database=ThaiFDA_DigitalLabeling;Encrypt=true;',
    status: 'CONFIGURED',
    lastSyncAt: '2026-10-15T13:45:00Z',
    errorMessage: null,
    isMock: true,
    notes: 'มีสคริปต์ T-SQL DDL ครบ 25+ ตารางพร้อม Foreign Keys และ Clustered Indexes ใน /backend-specs/schema.sql'
  },
  {
    id: 'int-05',
    name: 'Government Data Center and Cloud (GDCC)',
    serviceType: 'GDCC',
    description: 'ระบบคลาวด์กลางภาครัฐสำหรับติดตั้ง ASP.NET Core API และ Web App',
    endpointUrl: 'https://gdcc-zone-th1.cloud.gov.th/apps/thai-fda-dl',
    status: 'PLACEHOLDER',
    lastSyncAt: null,
    errorMessage: 'Integration Placeholder: รอการอนุมัติโควต้าทรัพยากร GDCC และ WAF Configuration',
    isMock: true,
    notes: 'ออกแบบระบบให้รองรับ GDCC Container / IIS บน Windows Server 2022'
  },
  {
    id: 'int-06',
    name: 'Government Notification Gateway (SMS/Email)',
    serviceType: 'NOTIFICATION',
    description: 'เกตเวย์แจ้งเตือนผู้ประกอบการเมื่อคำขอฉลากเปลี่ยนสถานะหรือต้องส่งกลับแก้ไข',
    endpointUrl: 'https://notify.gov.in.th/api/v1/send',
    status: 'PLACEHOLDER',
    lastSyncAt: null,
    errorMessage: 'Integration Placeholder: รอ API Key และ SMS Quota',
    isMock: true,
    notes: 'จำลองการแจ้งเตือนผ่าน In-App Toast and Notification Badge ในระบบ'
  }
];

export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  idleTimeoutMinutes: 30,
  defaultLanguage: 'th',
  enableAuditLogging: true,
  logRetentionDays: 365,
  qrCodeDefaultCorrectionLevel: 'M',
  requireOfficerChecklistComplete: true,
  allowEntrepreneurSelfPublish: true,
  maintenanceMode: false
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1001',
    timestamp: '2026-10-15T13:30:15Z',
    userId: 'usr-officer-01',
    userName: 'ภญ. วรรณภา สิริกุล',
    userRole: 'officer',
    action: 'REVIEW_CHECKLIST_SUBMIT',
    resourceType: 'DIGITAL_LABEL',
    resourceId: 'lbl-004',
    result: 'SUCCESS',
    ipAddress: '192.168.10.45',
    correlationId: 'req-c891a-0984',
    details: 'บันทึก Checklist ส่งกลับแก้ไข (Revision Required) ระบุให้ตัดข้อความอวดอ้างสรรพคุณเกินจริง'
  },
  {
    id: 'log-1002',
    timestamp: '2026-10-15T11:30:00Z',
    userId: 'usr-entrepreneur-01',
    userName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    userRole: 'entrepreneur',
    action: 'SUBMIT_LABEL_REQUEST',
    resourceType: 'DIGITAL_LABEL',
    resourceId: 'lbl-002',
    result: 'SUCCESS',
    ipAddress: '171.96.220.88',
    correlationId: 'req-e542b-1102',
    details: 'ยื่นคำขอฉลากดิจิทัล ยาเม็ดพาราเซตามอล 500 มก. (1A 45/65) พร้อมแนบเอกสารกำกับยา PDF'
  },
  {
    id: 'log-1003',
    timestamp: '2026-10-15T09:30:00Z',
    userId: 'usr-entrepreneur-01',
    userName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    userRole: 'entrepreneur',
    action: 'USER_LOGIN',
    resourceType: 'AUTH_SESSION',
    resourceId: 'sess-897123',
    result: 'SUCCESS',
    ipAddress: '171.96.220.88',
    correlationId: 'auth-00129-9941',
    details: 'เข้าสู่ระบบสำเร็จผ่าน Demo Authentication Persona: ผู้ประกอบการ บจก.สยามไบโอเทค'
  },
  {
    id: 'log-1004',
    timestamp: '2026-10-01T15:00:00Z',
    userId: 'usr-admin-01',
    userName: 'นายธนกร รัตนชัย',
    userRole: 'admin',
    action: 'SUSPEND_LABEL',
    resourceType: 'DIGITAL_LABEL',
    resourceId: 'lbl-003',
    result: 'SUCCESS',
    ipAddress: '192.168.10.12',
    correlationId: 'sec-order-2026-44',
    details: 'มีคำสั่งระงับการเผยแพร่ฉลาก ครีมบำรุงผิวหน้า ไวท์เทนนิ่ง ออร่า โกลว์ สกิน ตามคำสั่งด่วน อย.'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-001',
    userId: 'usr-entrepreneur-01',
    title: 'คำขอฉลากถูกส่งกลับแก้ไข (Revision Required)',
    message: 'เจ้าหน้าที่ อย. ได้ตรวจพิจารณาคำขอฉลาก "น้ำมันปลา โอเมก้า 3" และมีข้อสังเกตให้ปรับปรุงข้อความโฆษณาสรรพคุณ',
    type: 'warning',
    link: '/entrepreneur/labels/lbl-004/edit',
    read: false,
    createdAt: '2026-10-15T13:30:00Z'
  },
  {
    id: 'notif-002',
    userId: 'usr-entrepreneur-01',
    title: 'เจ้าหน้าที่รับเรื่องคำขอแล้ว (In Review)',
    message: 'ภญ. วรรณภา สิริกุล ได้รับเรื่องคำขอฉลาก "ยาเม็ดพาราเซตามอล 500 มก." เข้าสู่ขั้นตอนตรวจพิจารณาแล้ว',
    type: 'info',
    link: '/entrepreneur/labels/lbl-002/edit',
    read: false,
    createdAt: '2026-10-15T11:35:00Z'
  },
  {
    id: 'notif-003',
    userId: 'usr-entrepreneur-01',
    title: 'คำขอฉลากได้รับการอนุมัติ (Approved)',
    message: 'ฉลาก "เครื่องดื่มรังนกแท้สำเร็จรูป ตรา เฮลท์โกลด์" ผ่านการตรวจสอบรับรองจาก อย. แล้ว พร้อมเผยแพร่',
    type: 'success',
    link: '/entrepreneur/labels',
    read: true,
    createdAt: '2026-09-02T16:00:00Z'
  },
  {
    id: 'notif-004',
    userId: 'usr-entrepreneur-01',
    title: 'แจ้งเตือนคำสั่งระงับฉลาก (Suspended)',
    message: 'คำเตือน: อย. มีคำสั่งระงับฉลาก "ครีมบำรุงผิวหน้า ไวท์เทนนิ่ง ออร่า" ชั่วคราวเนื่องจากพบสารปนเปื้อน',
    type: 'error',
    link: '/entrepreneur/labels',
    read: true,
    createdAt: '2026-10-01T15:05:00Z'
  }
];

export const INITIAL_TIMELINE_EVENTS: LabelTimelineEvent[] = [
  // Events for lbl-001 (published)
  {
    id: 'tl-101',
    labelId: 'lbl-001',
    version: 1,
    timestamp: '2026-08-20T10:00:00Z',
    actorName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    actorRole: 'entrepreneur',
    action: 'SUBMIT_REQUEST',
    status: 'pending_review',
    notes: 'ยื่นคำขอฉลากดิจิทัลเครื่องดื่มรังนกแท้ พร้อมเอกสารผลวิเคราะห์โภชนาการ'
  },
  {
    id: 'tl-102',
    labelId: 'lbl-001',
    version: 1,
    timestamp: '2026-08-22T09:15:00Z',
    actorName: 'ภญ. วรรณภา สิริกุล',
    actorRole: 'officer',
    action: 'CLAIM_REQUEST',
    status: 'in_review',
    notes: 'เจ้าหน้าที่ อย. รับเรื่องเข้าสู่กระบวนการตรวจพิจารณาตามเกณฑ์มาตรฐาน'
  },
  {
    id: 'tl-103',
    labelId: 'lbl-001',
    version: 1,
    timestamp: '2026-09-02T16:00:00Z',
    actorName: 'ภญ. วรรณภา สิริกุล',
    actorRole: 'officer',
    action: 'APPROVE',
    status: 'approved',
    notes: 'ผ่านการพิจารณาตรวจสอบครบทุกข้อตามเกณฑ์ อย. อนุญาตให้ผู้ประกอบการเผยแพร่ฉลากได้'
  },
  {
    id: 'tl-104',
    labelId: 'lbl-001',
    version: 1,
    timestamp: '2026-09-05T14:30:00Z',
    actorName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    actorRole: 'entrepreneur',
    action: 'PUBLISH',
    status: 'published',
    notes: 'ผู้ประกอบการกดเผยแพร่ฉลากสู่สาธารณะ เปิดให้ประชาชนสแกน QR Code ตรวจสอบได้จริง'
  },
  // Events for lbl-004 (revision required)
  {
    id: 'tl-401',
    labelId: 'lbl-004',
    version: 1,
    timestamp: '2026-10-10T14:00:00Z',
    actorName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    actorRole: 'entrepreneur',
    action: 'SUBMIT_REQUEST',
    status: 'pending_review',
    notes: 'ยื่นคำขอฉลากดิจิทัลสำหรับผลิตภัณฑ์เสริมอาหารน้ำมันปลา'
  },
  {
    id: 'tl-402',
    labelId: 'lbl-004',
    version: 1,
    timestamp: '2026-10-12T10:30:00Z',
    actorName: 'ภญ. วรรณภา สิริกุล',
    actorRole: 'officer',
    action: 'CLAIM_REQUEST',
    status: 'in_review',
    notes: 'เจ้าหน้าที่ อย. รับเรื่องตรวจสอบ'
  },
  {
    id: 'tl-403',
    labelId: 'lbl-004',
    version: 1,
    timestamp: '2026-10-15T13:30:00Z',
    actorName: 'ภญ. วรรณภา สิริกุล',
    actorRole: 'officer',
    action: 'REQUEST_REVISION',
    status: 'revision_required',
    notes: 'ตรวจพบข้อความโฆษณาสรรพคุณที่อาจทำให้เข้าใจผิดในคุณประโยชน์ (ป้องกันหลอดเลือดอุดตัน) ซึ่งไม่ได้รับอนุญาตในอาหารเสริม กรุณาแก้ไขข้อความให้ตรงกับทะเบียนสารบบ'
  }
];

export const INITIAL_LABEL_VERSIONS: DigitalLabelVersionRecord[] = [
  {
    id: 'ver-001-v1',
    labelId: 'lbl-001',
    version: 1,
    titleTh: 'เครื่องดื่มรังนกแท้สำเร็จรูป ผสมโสมสกัด ตรา เฮลท์โกลด์ (ขวด 70 มล.)',
    titleEn: 'HealthGold Instant Bird\'s Nest Beverage with Ginseng Extract (70 ml Bottle)',
    status: 'published',
    snapshot: INITIAL_LABELS[0],
    changeLog: 'อนุมัติและเผยแพร่ฉลากดิจิทัลเวอร์ชันแรก (v1.0) อย่างเป็นทางการ',
    changedByName: 'นายสมศักดิ์ วัฒนกิจโกศล',
    changedByRole: 'entrepreneur',
    createdAt: '2026-09-05T14:30:00Z'
  }
];
export const INITIAL_CHECKLIST_TEMPLATES: ChecklistTemplateItem[] = [
  // หมวดหมู่อาหารและเครื่องดื่ม (Food)
  {
    id: 'tmpl-food-01',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม',
    title: 'ความถูกต้องของชื่อผลิตภัณฑ์และเลขสารบบอาหาร 13 หลัก',
    description: 'ตรวจสอบความถูกต้องของชื่อภาษาไทย/อังกฤษ และเลขสารบบอาหารว่าตรงกับฐานข้อมูล e-Submission ของ อย.',
    isRequired: true,
    order: 1,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-food-02',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม',
    title: 'การแสดงข้อมูลส่วนประกอบสำคัญและข้อมูลสำหรับผู้แพ้อาหาร',
    description: 'ตรวจสอบร้อยละของส่วนประกอบ และการแจ้งเตือนสารก่อภูมิแพ้อย่างชัดเจนตามประกาศกระทรวงสาธารณสุข',
    isRequired: true,
    order: 2,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-food-03',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม',
    title: 'ตารางข้อมูลโภชนาการ (Nutrition Facts) และพลังงาน',
    description: 'ตรวจสอบขนาดหนึ่งหน่วยบริโภค จำนวนหน่วยบริโภคต่อภาชนะ และพลังงานทั้งหมด',
    isRequired: true,
    order: 3,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-food-04',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม',
    title: 'คำเตือน สภาวะการเก็บรักษา และวันหมดอายุ',
    description: 'ตรวจสอบข้อความคำเตือนตามกลุ่มผลิตภัณฑ์ และสภาวะอุณหภูมิที่ควรเก็บรักษา',
    isRequired: true,
    order: 4,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-food-05',
    category: 'food',
    categoryNameTh: 'อาหารและเครื่องดื่ม',
    title: 'เอกสารผลวิเคราะห์ทางห้องปฏิบัติการ (Lab Certificate)',
    description: 'เอกสารแนบยืนยันสารอาหาร โลหะหนัก และจุลินทรีย์จากห้องแล็บที่ได้รับมาตรฐาน ISO/IEC 17025',
    isRequired: false,
    order: 5,
    status: 'ACTIVE'
  },

  // หมวดหมู่ยาแผนปัจจุบัน (Drug)
  {
    id: 'tmpl-drug-01',
    category: 'drug',
    categoryNameTh: 'ยาแผนปัจจุบัน',
    title: 'ชื่อการค้า ชื่อสามัญทางยา (Generic Name) และเลขทะเบียนตำรับยา',
    description: 'ตรวจสอบความสอดคล้องกับใบอนุญาตผลิต/นำเข้ายา และเลขทะเบียนตำรับยา (เช่น 1A XX/XX)',
    isRequired: true,
    order: 1,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-drug-02',
    category: 'drug',
    categoryNameTh: 'ยาแผนปัจจุบัน',
    title: 'เอกสารกำกับยาฉบับทางการ (Official Leaflet PDF)',
    description: 'ตรวจสอบไฟล์เอกสารกำกับยาฉบับเต็มภาษาไทยสำหรับบุคลากรทางการแพทย์และประชาชน',
    isRequired: true,
    order: 2,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-drug-03',
    category: 'drug',
    categoryNameTh: 'ยาแผนปัจจุบัน',
    title: 'ข้อบ่งใช้ ขนาดและวิธีใช้ยา (Indications & Dosage)',
    description: 'ตรวจสอบข้อบ่งใช้ตรงตามตำรับยา และคำแนะนำขนาดยาตามช่วงอายุและน้ำหนัก',
    isRequired: true,
    order: 3,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-drug-04',
    category: 'drug',
    categoryNameTh: 'ยาแผนปัจจุบัน',
    title: 'คำเตือน ข้อห้ามใช้ และอาการไม่พึงประสงค์ (Adverse Reactions)',
    description: 'ข้อห้ามใช้ในหญิงตั้งครรภ์ ผู้ป่วยโรคตับ/ไต และอาการข้างเคียงที่ต้องเฝ้าระวัง',
    isRequired: true,
    order: 4,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-drug-05',
    category: 'drug',
    categoryNameTh: 'ยาแผนปัจจุบัน',
    title: 'การจัดเก็บยา และหนังสือรับรองมาตรฐาน GMP/PICs',
    description: 'อุณหภูมิการเก็บรักษา การป้องกันแสง และหนังสือรับรองมาตรฐานสถานที่ผลิตยา',
    isRequired: false,
    order: 5,
    status: 'ACTIVE'
  },

  // หมวดหมู่เครื่องสำอาง (Cosmetic)
  {
    id: 'tmpl-cosm-01',
    category: 'cosmetic',
    categoryNameTh: 'เครื่องสำอาง',
    title: 'เลขที่ใบรับจดแจ้งเครื่องสำอางและชื่อผลิตภัณฑ์',
    description: 'ตรวจสอบเลขที่จดแจ้ง และชื่อการค้าว่าไม่มีคำอวดอ้างสรรพคุณเกินขอบเขตเครื่องสำอาง',
    isRequired: true,
    order: 1,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-cosm-02',
    category: 'cosmetic',
    categoryNameTh: 'เครื่องสำอาง',
    title: 'รายชื่อสารส่วนประกอบทั้งหมดตามมาตรฐานสากล (INCI Name)',
    description: 'เรียงลำดับความเข้มข้นสารจากมากไปน้อย และไม่มีสารต้องห้ามตามประกาศ อย.',
    isRequired: true,
    order: 2,
    status: 'ACTIVE'
  },
  {
    id: 'tmpl-cosm-03',
    category: 'cosmetic',
    categoryNameTh: 'เครื่องสำอาง',
    title: 'วิธีใช้ คำเตือนการแพ้ระคายเคือง และเลขครั้งที่ผลิต',
    description: 'วิธีใช้ที่ถูกต้อง คำเตือนการทดสอบการแพ้ก่อนใช้ และเลข Lot ครั้งที่ผลิต',
    isRequired: true,
    order: 3,
    status: 'ACTIVE'
  }
];

export const INITIAL_CHECKLIST_TEMPLATE: ReviewChecklistItem[] = [
  {
    id: 'chk-001',
    category: 'ความถูกต้องของข้อมูลพื้นฐาน',
    title: 'เลขสารบบอาหาร / ทะเบียนยา ถูกต้องตรงกับฐานข้อมูล e-Submission อย.',
    description: 'ตรวจสอบเลข 13 หลัก หรือเลขทะเบียนตำรับยา พร้อมสถานะว่ายังไม่หมดอายุหรือถูกเพิกถอน',
    status: 'pending',
    passed: false,
    isRequired: true,
    notes: ''
  },
  {
    id: 'chk-002',
    category: 'ความถูกต้องของข้อมูลพื้นฐาน',
    title: 'ชื่อผลิตภัณฑ์ภาษาไทยและภาษาอังกฤษ ตรงกับใบอนุญาต',
    description: 'ตรวจสอบตัวสะกด วรรคตอน และไม่มีคำโฆษณาอวดอ้างเกินจริงในชื่อผลิตภัณฑ์',
    status: 'pending',
    passed: false,
    isRequired: true,
    notes: ''
  },
  {
    id: 'chk-003',
    category: 'ส่วนประกอบและสารก่อภูมิแพ้',
    title: 'ข้อมูลส่วนประกอบและสารก่อภูมิแพ้ครบถ้วนตามกฎหมาย',
    description: 'ระบุร้อยละของส่วนผสมสำคัญ และมีกล่องข้อความเตือนสำหรับผู้แพ้อาหารหรือสารเคมี',
    status: 'pending',
    passed: false,
    isRequired: true,
    notes: ''
  },
  {
    id: 'chk-004',
    category: 'คำเตือนและข้อกำหนดเฉพาะ',
    title: 'ข้อความคำเตือนตามที่กฎหมายกำหนด และขนาดตัวอักษรชัดเจน',
    description: 'ตรวจสอบคำเตือนสุขภาพ เช่น "เด็กและสตรีมีครรภ์ไม่ควรรับประทาน" หรือ "ห้ามใช้ในผู้แพ้แอสไพริน"',
    status: 'pending',
    passed: false,
    isRequired: true,
    notes: ''
  },
  {
    id: 'chk-005',
    category: 'เอกสารแนบ',
    title: 'เอกสารกำกับผลิตภัณฑ์ / Leaflet PDF มีเนื้อหาถูกต้องสมบูรณ์',
    description: 'เปิดอ่านไฟล์ PDF ตรวจสอบว่าสามารถแสดงผลได้ชัดเจนและมีเนื้อหาตรงตามฉลากจริง',
    status: 'pending',
    passed: false,
    isRequired: false,
    notes: ''
  }
];
