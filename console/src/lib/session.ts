"use client";

import { useEffect, useState } from "react";

export type OrgTier = "developer-cloud" | "enterprise";
export type Env = "prod" | "staging" | "dev";

export type Session = {
  user: { email: string; name: string };
  org: { id: string; name: string; tier: OrgTier };
  env: Env;
};

const DEV_SESSION: Session = {
  user: { email: "aniket@statis.dev", name: "Aniket Kumar" },
  org: { id: "org_dev", name: "Statis Dev", tier: "developer-cloud" },
  env: "prod",
};

const ENV_KEY = "statis_env";

export function useSession(): Session & { setEnv: (e: Env) => void } {
  const [env, setEnvState] = useState<Env>(DEV_SESSION.env);

  useEffect(() => {
    const stored = localStorage.getItem(ENV_KEY) as Env | null;
    if (stored === "prod" || stored === "staging" || stored === "dev") {
      setEnvState(stored);
    }
  }, []);

  function setEnv(next: Env) {
    setEnvState(next);
    localStorage.setItem(ENV_KEY, next);
  }

  return { ...DEV_SESSION, env, setEnv };
}
