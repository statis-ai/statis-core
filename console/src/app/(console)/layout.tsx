import Sidebar from "@/components/Sidebar";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#080810]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#080810]">
        {children}
      </main>
    </div>
  );
}
