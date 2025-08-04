import dynamic from "next/dynamic";

const ConfigClient = dynamic(() => import("@/components/screens/Config"), {
  ssr: false,
});

export default function ConfigPage() {
  return <ConfigClient />;
}
