import dynamic from "next/dynamic";

const InterviewClient = dynamic(
  () => import("@/components/screens/Interview"),
  {
    ssr: false,
  }
);

export default function InterviewPage() {
  return <InterviewClient />;
}
