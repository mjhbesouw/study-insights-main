import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function guard() {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        navigate("/", { replace: true });
        return;
      }

      if (!data.session) {
        navigate("/", { replace: true, state: { from: location.pathname } });
        return;
      }

      setReady(true);
    }

    guard();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/", { replace: true });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (!ready) return null;

  return <>{children}</>;
}
