import dynamic from "next/dynamic";

const ConfigClient = dynamic(() => import("@/components/ConfigPage"), {
  ssr: false,
});

export default function ConfigPage() {
  return <ConfigClient />;
}
