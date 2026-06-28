import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import ManagerLayout from "./layouts/ManagerLayout";
import DeveloperLayout from "./layouts/DeveloperLayout";

// Các trang của Manager
import ManagerDashboard from "./pages/manager/Dashboard";
import BugReportsPage from "./pages/manager/BugReportsPage";
import BugDetailPage from "./pages/manager/BugDetailPage";
import BugClustersPage from "./pages/manager/BugClustersPage";
import AITriagePage from "./pages/manager/AITriagePage";
import IncidentsPage from "./pages/manager/IncidentsPage";
import IncidentDetailPage from "./pages/manager/IncidentDetailPage";
import AssignmentBoardPage from "./pages/manager/AssignmentBoardPage";
import ReportsPage from "./pages/manager/ReportsPage";
import SettingsPage from "./pages/manager/SettingsPage";
import DevelopersPage from "./pages/manager/DevelopersPage";
import DeveloperDetailPage from "./pages/manager/DeveloperDetailPage";


// Các trang của Developer
import DeveloperDashboard from "./pages/developer/Dashboard";
import DeveloperBugDetailPage from "./pages/developer/BugDetailPage";
import MyTasksBoardPage from "./pages/developer/MyTasksBoardPage";


// Import RequireAuth
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: LoginPage,
    },
    {
        path: "/manager",
        element: (
            <RequireAuth allowedRole="ROLE_MANAGER">
                <ManagerLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, Component: ManagerDashboard },
            { path: "bugs", Component: BugReportsPage },
            { path: "bugs/:bugId", Component: BugDetailPage },
            { path: "clusters", Component: BugClustersPage },
            { path: "ai-triage", Component: AITriagePage },
            { path: "incidents", Component: IncidentsPage },
            { path: "incidents/:incidentId", Component: IncidentDetailPage },
            { path: "assignment-board", Component: AssignmentBoardPage },
            { path: "reports", Component: ReportsPage },
            { path: "settings", Component: SettingsPage },
            { path: "developers", Component: DevelopersPage },
            { path: "developers/:devId", Component: DeveloperDetailPage },
        ],
    },
    {
        path: "/developer",
        element: (
            <RequireAuth allowedRole="ROLE_DEVELOPER">
                <DeveloperLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, Component: DeveloperDashboard },
            { path: "my-tasks", Component: MyTasksBoardPage },
            { path: "bugs/:bugId", Component: DeveloperBugDetailPage },
        ],
    },
]);
