import dynamic from "next/dynamic";

const Home = dynamic(() => import("@/components/screens/Home"), {
  ssr: false,
});

export default function HomePage() {
  return <Home />;
}
