"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useCallback, useTransition } from "react";

const RouterUpdaterContext = createContext<{
  updateRoute: (url: string) => void;
  isPending: boolean;
}>({
  updateRoute: (url: string) => {},
  isPending: false,
});

const RouterUpdaterProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateRoute = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url, { scroll: false });
      });
    },
    [router]
  );

  return (
    <RouterUpdaterContext.Provider
      value={{
        updateRoute,
        isPending,
      }}
    >
      {children}
    </RouterUpdaterContext.Provider>
  );
};

export const useRouterUpdater = () => {
  return useContext(RouterUpdaterContext);
};

export default RouterUpdaterProvider;
