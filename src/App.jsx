import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";

import OwnerHomePage from "./pages/owner/OwnerHomePage";
import OwnerPetsPage from "./pages/owner/OwnerPetsPage";
import OwnerCageLivePage from "./pages/owner/OwnerCageLivePage";
import OwnerReportPage from "./pages/owner/OwnerReportPage";
import OwnerCageRegisterPage from "./pages/owner/OwnerCageRegisterPage";

import FacilityDashboardPage from "./pages/facility/FacilityDashboardPage";
import FacilityCagesPage from "./pages/facility/FacilityCagesPage";
import FacilitySessionsPage from "./pages/facility/FacilitySessionsPage";
import FacilityDevicesPage from "./pages/facility/FacilityDevicesPage";
import FacilityLogsPage from "./pages/facility/FacilityLogsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminFacilitiesPage from "./pages/admin/AdminFacilitiesPage";
import AdminCagesPage from "./pages/admin/AdminCagesPage";
import AdminDevicesPage from "./pages/admin/AdminDevicesPage";

function withLayout(page) {
  return <AppLayout>{page}</AppLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/owner" element={withLayout(<OwnerHomePage />)} />
        <Route
          path="/owner/register-cage"
          element={withLayout(<OwnerCageRegisterPage />)}
        />
        <Route path="/owner/pets" element={withLayout(<OwnerPetsPage />)} />
        <Route
          path="/owner/cages/:cageId/live"
          element={withLayout(<OwnerCageLivePage />)}
        />
        <Route path="/owner/reports" element={withLayout(<OwnerReportPage />)} />

        <Route path="/facility" element={withLayout(<FacilityDashboardPage />)} />
        <Route path="/facility/cages" element={withLayout(<FacilityCagesPage />)} />
        <Route
          path="/facility/sessions"
          element={withLayout(<FacilitySessionsPage />)}
        />
        <Route
          path="/facility/devices"
          element={withLayout(<FacilityDevicesPage />)}
        />
        <Route path="/facility/logs" element={withLayout(<FacilityLogsPage />)} />

        <Route path="/admin" element={withLayout(<AdminDashboardPage />)} />
        <Route path="/admin/users" element={withLayout(<AdminUsersPage />)} />
        <Route
          path="/admin/facilities"
          element={withLayout(<AdminFacilitiesPage />)}
        />
        <Route path="/admin/cages" element={withLayout(<AdminCagesPage />)} />
        <Route path="/admin/devices" element={withLayout(<AdminDevicesPage />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;