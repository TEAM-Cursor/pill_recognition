import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const SetCtx = createContext<(t: string) => void>(() => {});
const ValCtx = createContext<string>("");

export function TopbarProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("캘린더");
  return (
    <SetCtx.Provider value={setTitle}>
      <ValCtx.Provider value={title}>{children}</ValCtx.Provider>
    </SetCtx.Provider>
  );
}

export function useTopbarTitle() {
  return useContext(ValCtx);
}

/** 페이지가 마운트될 때 상단바 제목 지정 */
export function useSetTitle(title: string) {
  const set = useContext(SetCtx);
  useEffect(() => set(title), [set, title]);
}
