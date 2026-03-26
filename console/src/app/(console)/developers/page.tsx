import DevelopersTab from "@/components/tabs/developers-tab";

export default function DevelopersPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Developers</h1>
        <p className="text-xs text-[#5a5a7a] mt-0.5">API keys and integration settings</p>
      </div>
      <DevelopersTab />
    </div>
  );
}
