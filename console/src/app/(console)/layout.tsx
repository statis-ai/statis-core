import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { SandboxBanner } from "@/components/SandboxBanner";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden bg-[#080810]">
        <SandboxBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#080810]">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
