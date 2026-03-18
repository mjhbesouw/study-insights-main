import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Props = {
  children: React.ReactNode;
};

export default function RequireSession({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      const sessionId = localStorage.getItem("session_id");

      if (!sessionId) {
        if (mounted) {
          navigate("/access", { replace: true, state: { from: location.pathname } });
        }
        return;
      }

      try {
        const { data, error } = await supabase.rpc("verify_session", {
          session_id: sessionId,
        });

        if (!mounted) return;

        if (error || !data?.ok) {
          console.error("Session verification failed:", error || "Invalid session");
          localStorage.removeItem("session_id");
          navigate("/access", { replace: true, state: { from: location.pathname } });
          return;
        }

        // Session is valid, sync server state to local storage for resume behavior
        if (data.session) {
          const { updateSession, getStoredAnswers } = await import("@/lib/dataLayer");
          const session = updateSession({
            current_step: data.session.current_step,
            current_case_index: data.session.current_case_index,
            is_submitted: data.session.is_submitted,
          });

          // Check if participant already started
          const answers = getStoredAnswers();
          const hasProgress = Object.keys(answers).length > 0 || session.current_step > 0 || session.current_case_index > 0;

          if (hasProgress && location.pathname === "/welcome" && !session.is_submitted) {
            navigate("/welcome-back", { replace: true });
            return;
          }

          if (!hasProgress && location.pathname === "/welcome-back") {
            navigate("/welcome", { replace: true });
            return;
          }
        }

        setIsVerifying(false);
      } catch (err) {
        if (mounted) {
          console.error("Unexpected error during session verification:", err);
          navigate("/access", { replace: true });
        }
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (isVerifying) {
    return null;
  }

  return <>{children}</>;
}
