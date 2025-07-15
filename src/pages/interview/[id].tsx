import dynamic from "next/dynamic";

const InterviewClient = dynamic(() => import("@/components/Interview"), {
  ssr: false,
});

export default function InterviewPage() {
  return <InterviewClient />;
}
