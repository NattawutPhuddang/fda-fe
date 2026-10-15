import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { PublicHomePage } from './pages/public/PublicHomePage';
import { PublicSearchPage } from './pages/public/PublicSearchPage';
import { PublicLabelViewPage } from './pages/public/PublicLabelViewPage';
import { PrivacyNoticePage } from './pages/public/PrivacyNoticePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

// Entrepreneur Pages
import { EntrepreneurDashboard } from './pages/entrepreneur/EntrepreneurDashboard';
import { ProductListPage } from './pages/entrepreneur/ProductListPage';
import { LabelListPage } from './pages/entrepreneur/LabelListPage';
import { LabelCreateEditPage } from './pages/entrepreneur/LabelCreateEditPage';
import { QRCodeManagerPage } from './pages/entrepreneur/QRCodeManagerPage';
import { ScanAnalyticsPage } from './pages/entrepreneur/ScanAnalyticsPage';
import { RepresentativePage } from './pages/entrepreneur/RepresentativePage';

// Officer Pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { RequestQueuePage } from './pages/officer/RequestQueuePage';
import { ReviewWorkspacePage } from './pages/officer/ReviewWorkspacePage';
import { ProductOversightPage } from './pages/officer/ProductOversightPage';
import { OfficerReportsPage } from './pages/officer/OfficerReportsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { RolePermissionPage } from './pages/admin/RolePermissionPage';
import { MasterDataPage } from './pages/admin/MasterDataPage';
import { IntegrationSettingsPage } from './pages/admin/IntegrationSettingsPage';
import { SystemConfigPage } from './pages/admin/SystemConfigPage';

// Auditor Pages
import { AuditLogPage } from './pages/auditor/AuditLogPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/search" element={<PublicSearchPage />} />
            <Route path="/verify/:newcode" element={<PublicLabelViewPage />} />
            <Route path="/privacy" element={<PrivacyNoticePage />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Entrepreneur Portal Routes */}
            <Route element={<AppLayout allowedRoles={['entrepreneur', 'admin']} />}>
              <Route path="/entrepreneur/dashboard" element={<EntrepreneurDashboard />} />
              <Route path="/entrepreneur/products" element={<ProductListPage />} />
              <Route path="/entrepreneur/labels" element={<LabelListPage />} />
              <Route path="/entrepreneur/labels/new" element={<LabelCreateEditPage />} />
              <Route path="/entrepreneur/labels/:id/edit" element={<LabelCreateEditPage />} />
              <Route path="/entrepreneur/qrcodes" element={<QRCodeManagerPage />} />
              <Route path="/entrepreneur/analytics" element={<ScanAnalyticsPage />} />
              <Route path="/entrepreneur/representatives" element={<RepresentativePage />} />
            </Route>

            {/* FDA Officer Portal Routes */}
            <Route element={<AppLayout allowedRoles={['officer', 'admin']} />}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/queue" element={<RequestQueuePage />} />
              <Route path="/officer/review/:id" element={<ReviewWorkspacePage />} />
              <Route path="/officer/oversight" element={<ProductOversightPage />} />
              <Route path="/officer/reports" element={<OfficerReportsPage />} />
            </Route>

            {/* Administrator Portal Routes */}
            <Route element={<AppLayout allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/roles" element={<RolePermissionPage />} />
              <Route path="/admin/master-data" element={<MasterDataPage />} />
              <Route path="/admin/integrations" element={<IntegrationSettingsPage />} />
              <Route path="/admin/system-config" element={<SystemConfigPage />} />
            </Route>

            {/* Auditor Portal Routes */}
            <Route element={<AppLayout allowedRoles={['auditor', 'admin']} />}>
              <Route path="/auditor/logs" element={<AuditLogPage />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
