import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FormationDetail } from "shared";
import { useMatomo } from "../hooks/useMatomo";
import { formationDetailToKey } from "../hooks/useFormationLink";

type DetailsHeaderSize = {
  headerHeight: number;
  resumeHeight: number;
};

type DetailsHeaderSizeParams = {
  headerHeight?: number;
  resumeHeight?: number;
};

const FormationDetailsContext = createContext<{
  headersSize: DetailsHeaderSize;
  setHeadersSize: (params: DetailsHeaderSizeParams) => void;
}>({
  headersSize: { headerHeight: 0, resumeHeight: 0 },
  setHeadersSize: (params: DetailsHeaderSizeParams) => {},
});

const FormationDetailsProvider = ({
  formationDetail,
  children,
}: {
  formationDetail: FormationDetail;
  children: React.ReactNode;
}) => {
  const [headersSize, setHeadersSize] = useState({ headerHeight: 0, resumeHeight: 0 });
  const matomo = useMatomo();

  useEffect(() => {
    matomo.push(["trackEvent", "details", "uai", formationDetail.etablissement.uai]);
    matomo.push(["trackEvent", "details", "code", formationDetailToKey(formationDetail)]);
  }, [matomo, formationDetail]);

  const setHeaderSizeCb = useCallback(
    (newHeadersSize: DetailsHeaderSizeParams) => {
      setHeadersSize((prevState) => ({ ...prevState, ...newHeadersSize }));
    },
    [setHeadersSize]
  );

  return (
    <FormationDetailsContext.Provider
      value={{
        headersSize,
        setHeadersSize: setHeaderSizeCb,
      }}
    >
      {children}
    </FormationDetailsContext.Provider>
  );
};

export const useFormationsDetails = () => {
  return useContext(FormationDetailsContext);
};

export default FormationDetailsProvider;
