import "./dark-tokens.css";
import { GlobalBackground } from "@/components/ui/GlobalBackground";

export default function DarkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalBackground />
      {children}
    </>
  );
}
