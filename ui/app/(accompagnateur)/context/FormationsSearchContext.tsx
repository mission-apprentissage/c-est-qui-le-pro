import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { paramsToString, searchParamsToObject } from "#/app/utils/searchParams";
import { FormationDomaine, FormationTag } from "shared";
import { usePlausible } from "next-plausible";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useCallback, useEffect } from "react";

type FormationsSearchParams = {
  address: string;
  tag?: FormationTag;
  domaine?: FormationDomaine;
  formation?: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParamsToObject(searchParams, { address: null, tag: null, domaine: null }, schemaFormation);

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
      router.push(`?${urlSearchParams}`);
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
