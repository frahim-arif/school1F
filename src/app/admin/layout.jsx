import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";

export const metadata = {
  title: "School ERP Admin",
  description: "School management and administration dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f4f7f6] text-slate-800">
      {/* Soft Background Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-teal-100/30 blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Dashboard */}
      <div className="relative min-h-screen lg:ml-72">
        {/* Navbar */}
        <div className="sticky top-0 z-40">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-80px)] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_8px_35px_rgba(15,23,42,0.035)] backdrop-blur-sm sm:rounded-3xl sm:p-6 lg:p-8">
              {children}
            </div>

            {/* Footer */}
            <footer className="flex flex-col items-center justify-between gap-2 px-2 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
              <p>
                © {new Date().getFullYear()} School ERP. All rights reserved.
              </p>

              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                School Management System
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}