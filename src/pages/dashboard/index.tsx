import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/screens/Dashboard"), {
  ssr: false,
});

export default function DashboardPage() {
  return <Dashboard />;
}
