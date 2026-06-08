import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";

import OwnerHomePage from "./pages/owner/OwnerHomePage";
import OwnerPetsPage from "./pages/owner/OwnerPetsPage";
import OwnerCageLivePage from "./pages/owner/OwnerCageLivePage";
import OwnerReportPage from "./pages/owner/OwnerReportPage";
import OwnerCageRegisterPage from "./pages/owner/OwnerCageRegisterPage";

import FacilityHomePage from "./pages/facility/FacilityHomePage";
import FacilityCagesPage from "./pages/facility/FacilityCagesPage";
import FacilityAdmissionPage from "./pages/facility/FacilityAdmissionPage";
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

function protectedPage(page, allowedRoles) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {withLayout(page)}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/owner" element={protectedPage(<OwnerHomePage />, ["OWNER"])} />
        <Route
          path="/owner/register-cage"
          element={protectedPage(<OwnerCageRegisterPage />, ["OWNER"])}
        />
        <Route path="/owner/pets" element={protectedPage(<OwnerPetsPage />, ["OWNER"])} />
        <Route
          path="/owner/cages/:cageId/live"
          element={protectedPage(<OwnerCageLivePage />, ["OWNER"])}
        />
        <Route
          path="/owner/reports"
          element={protectedPage(<OwnerReportPage />, ["OWNER"])}
        />

        <Route
          path="/facility"
          element={protectedPage(<FacilityHomePage />, ["FACILITY", "ADMIN"])}
        />
        <Route
          path="/facility/cages"
          element={protectedPage(<FacilityCagesPage />, ["FACILITY", "ADMIN"])}
        />
        <Route
          path="/facility/admissions"
          element={protectedPage(<FacilityAdmissionPage />, ["FACILITY", "ADMIN"])}
        />
        <Route
          path="/facility/sessions"
          element={<Navigate to="/facility/admissions" replace />}
        />
        <Route
          path="/facility/devices"
          element={protectedPage(<FacilityDevicesPage />, ["FACILITY", "ADMIN"])}
        />
        <Route
          path="/facility/logs"
          element={protectedPage(<FacilityLogsPage />, ["FACILITY", "ADMIN"])}
        />

        <Route path="/admin" element={protectedPage(<AdminDashboardPage />, ["ADMIN"])} />
        <Route path="/admin/users" element={protectedPage(<AdminUsersPage />, ["ADMIN"])} />
        <Route
          path="/admin/facilities"
          element={protectedPage(<AdminFacilitiesPage />, ["ADMIN"])}
        />
        <Route path="/admin/cages" element={protectedPage(<AdminCagesPage />, ["ADMIN"])} />
        <Route path="/admin/devices" element={protectedPage(<AdminDevicesPage />, ["ADMIN"])} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
