import dynamic from "next/dynamic";

const ConfigClient = dynamic(() => import("@/components/Config"), {
  ssr: false,
});

export default function ConfigPage() {
  return <ConfigClient />;
}
