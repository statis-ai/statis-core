import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { SandboxBanner } from "@/components/SandboxBanner";
import { KeyboardShortcutsProvider } from "@/components/command/KeyboardShortcutsProvider";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
        <SandboxBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#0a0a0a] dot-texture">
            {children}
          </main>
        </div>
        <KeyboardShortcutsProvider />
      </div>
    </AuthGuard>
  );
}
