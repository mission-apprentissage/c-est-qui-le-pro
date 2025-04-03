import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { paramsToString, searchParamsToObject } from "#/app/utils/searchParams";
import { FormationDomaine, FormationTag, FormationVoie, DiplomeType } from "shared";
import { useMatomo } from "../hooks/useMatomo";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useCallback, useEffect } from "react";
import { omit } from "lodash-es";
import { usePlausible } from "next-plausible";

export type FormationsSearchParams = {
  address: string;
  tag?: FormationTag[];
  domaines?: FormationDomaine[];
  voie?: FormationVoie[];
  diplome?: (keyof typeof DiplomeType)[];
  formation?: string;
  minWeight?: number;
};

const FormationsSearchContext = createContext<{
  params?: FormationsSearchParams | null;
  updateParams: (params: FormationsSearchParams) => void;
  getUrlParams: () => string;
}>({
  params: null,
  updateParams: (params: FormationsSearchParams) => {},
  getUrlParams: () => "",
});

const FormationsSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const plausible = usePlausible();
  const { push } = useMatomo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParamsToObject(searchParams, { address: null, tag: null, domaines: null }, schemaFormation);

  useEffect(() => {
    Object.entries(omit(params, ["address"])).forEach(([key, value]) => {
      push(["trackEvent", "recherche", key, value]);
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
    (params: FormationsSearchParams) => {
      const urlSearchParams = paramsToString(params);
      router.push(`?${urlSearchParams}`, { scroll: false });
    },
    [router]
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
