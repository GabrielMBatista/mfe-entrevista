import dynamic from "next/dynamic";

const InviteClient = dynamic(() => import("@/components/screens/Invite"), {
  ssr: false,
});

export default function InvitePage() {
  return <InviteClient />;
}
