import { useEffect, useState } from "react";
import { getRemainingSeconds } from "../../utils/invitationCooldown";

export default function ResendInvitationButton({ invitation, onResend }) {
  const [remain, setRemain] = useState(
    getRemainingSeconds(invitation.lastResentAt)
  );

  useEffect(() => {
    if (remain <= 0) return;

    const timer = setInterval(() => {
      setRemain(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remain]);

  const disabled = remain > 0;

  return (
    <button
      disabled={disabled}
      onClick={() => onResend(invitation.id)}
      className={`px-3 py-1 rounded text-sm transition
        ${disabled
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
    >
      {disabled ? `Gửi lại (${remain}s)` : "Gửi lại"}
    </button>
  );
}
