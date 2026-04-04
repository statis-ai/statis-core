import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { SandboxBanner } from "@/components/SandboxBanner";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
        <SandboxBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main
            className="flex-1 overflow-y-auto bg-[#0a0a0a]"
            style={{
              backgroundImage: "radial-gradient(circle, #1c1c1c 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
