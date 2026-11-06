import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Region } from "../api/types";
import type { ShopperContext } from "../api/client";

export const REGIONS: { code: Region; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "EU", label: "European Union" },
  { code: "UK", label: "United Kingdom" },
];

interface SessionState extends ShopperContext {
  setRegion: (region: Region) => void;
  setMember: (isMember: boolean) => void;
}

const SessionCtx = createContext<SessionState | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>(() => readStored("shop.region", "US"));
  const [isMember, setMemberState] = useState<boolean>(() => readStored("shop.member", false));

  const value = useMemo<SessionState>(
    () => ({
      region,
      isMember,
      setRegion: (r) => {
        setRegionState(r);
        writeStored("shop.region", r);
      },
      setMember: (m) => {
        setMemberState(m);
        writeStored("shop.member", m);
      },
    }),
    [region, isMember],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
