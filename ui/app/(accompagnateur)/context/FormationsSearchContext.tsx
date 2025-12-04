"use client";
import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { paramsToString, searchParamsToObject } from "#/app/utils/searchParams";
import { FormationDomaine, FormationTag, FormationVoie, DiplomeType } from "shared";
import { useMatomo } from "../hooks/useMatomo";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useCallback, useEffect } from "react";
import { isEqual, omit } from "lodash-es";
import { usePlausible } from "next-plausible";
import { useRouterUpdater } from "./RouterUpdaterContext";

export type FormationsSearchParams = {
  address: string;
  tag?: FormationTag[];
  domaines?: FormationDomaine[];
  voie?: FormationVoie[];
  diplome?: (keyof typeof DiplomeType)[];
  recherche?: string | null;
  minWeight?: number | null;
};

const FormationsSearchContext = createContext<{
  params?: FormationsSearchParams | null;
  updateParams: (params: FormationsSearchParams, keepOld?: boolean) => void;
  getUrlParams: () => string;
}>({
  params: null,
  updateParams: (params: FormationsSearchParams, keepOld?: boolean) => {},
  getUrlParams: () => "",
});

const FormationsSearchProvider = ({
  children,
  initialParams,
}: {
  children: React.ReactNode;
  initialParams?: FormationsSearchParams;
}) => {
  const plausible = usePlausible();
  const { push } = useMatomo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateRoute } = useRouterUpdater();

  // Use initialParams from server if available (for SSR), otherwise use client searchParams
  const params = initialParams
    ? initialParams
    : searchParamsToObject(searchParams, { address: null, tag: null, domaines: null }, schemaFormation);

  useEffect(() => {
    Object.entries(omit(params, ["address"])).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          push(["trackEvent", "recherche", key, v]);
        });
      } else {
        push(["trackEvent", "recherche", key, value]);
      }
    });
  }, [push, searchParams, params]);

  useEffect(() => {
    plausible("recherche", {
      props: {
        ...params,
      },
    });
  }, [plausible, searchParams, params]);

  const getUrlParams = useCallback(() => {
    const urlSearchParams = paramsToString(params);
    return `${urlSearchParams}`;
  }, [params]);

  const updateParams = useCallback(
    (newParams: FormationsSearchParams, keepOld: boolean = false) => {
      const newParamsFinal = keepOld ? { ...params, ...newParams } : newParams;
      if (isEqual(params, newParamsFinal)) {
        return;
      }

      const urlSearchParams = paramsToString(newParamsFinal);
      updateRoute(`?${urlSearchParams}`);
    },
    [router, params]
  );

  return (
    <FormationsSearchContext.Provider
      value={{
        updateParams,
        getUrlParams,
        params,
      }}
    >
      {children}
    </FormationsSearchContext.Provider>
  );
};

export const useFormationsSearch = () => {
  return useContext(FormationsSearchContext);
};

export default FormationsSearchProvider;
