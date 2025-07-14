import { useEffect, useState } from "react";
import { getInvitation } from "../../lib/api";

export default function InvitationPage({
  invitationId,
}: {
  invitationId: string;
}) {
  const [invitation, setInvitation] = useState<{ title: string } | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      const data = await getInvitation(invitationId);
      setInvitation(data);
    }
    fetchInvitation();
  }, [invitationId]);

  if (!invitation) return <div>Loading...</div>;

  return (
    <div className="dark:bg-gray-800 dark:text-white">
      <h1>{invitation.title}</h1>
      {/* Render components like QuestionPlayer, AudioRecorder, ResultSummary */}
    </div>
  );
}
