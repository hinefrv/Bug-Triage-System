import { useState } from "react";
import { useNavigate } from "react-router";
import { Bug } from "lucide-react";
import { saveCurrentUser } from "../utils/auth";
import axiosInstance from "../api/axiosConfig";
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      // Gui request POST toi login
      const response = await axiosInstance.post("/auth/login", {
        email,
        password
      });

      // Lay data tra ve tu BE (JwtResponse)
      const { token, email: userEmail, role, id } = response.data;

      // Luu vao localStorage
      const user = { id, email: userEmail, role };
      saveCurrentUser(user, token);

      // Chuyen huong
      if (role === "ROLE_MANAGER") {
        navigate("/manager");
      } else {
        navigate("/developer");
      }

    } catch (error) {
      console.error("Login failed:", error);
      // Bat loi neu sai tk hoac pass
      if (error.response && error.response === 401) {
        setErrorMsg("Sai email hoặc mật khẩu!");
      } else {
        setErrorMsg("Không thể kết nối đến server. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
    <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
      <div className="bg-card rounded-lg shadow-xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Bug className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bug Triage System</h1>
            <p className="text-sm text-muted-foreground">DevOps Bug Triage & Incident Management</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-foreground">Sign in to your account</h2>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
              Email address
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
              Password
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 text-primary border-border rounded focus:ring-ring" />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors font-medium">
            Sign in
          </button>
        </form>
      </div>

      <div className="text-center md:text-left space-y-6 px-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Classify, prioritize, and assign bugs faster
          </h2>
          <p className="text-lg text-muted-foreground">
            AI-assisted triage for streamlined DevOps incident management
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Smart Classification</h3>
              <p className="text-sm text-muted-foreground">
                AI automatically categorizes and prioritizes bugs based on severity and impact
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Intelligent Assignment</h3>
              <p className="text-sm text-muted-foreground">
                Suggest the best developer for each bug based on expertise and workload
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Real-time Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor bug resolution progress and team performance with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);
}
