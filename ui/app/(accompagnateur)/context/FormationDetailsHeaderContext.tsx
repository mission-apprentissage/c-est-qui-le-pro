import { createContext, useCallback, useContext, useState } from "react";

type DetailsHeaderSize = {
  headerHeight: number;
  resumeHeight: number;
};

type DetailsHeaderSizeParams = {
  headerHeight?: number;
  resumeHeight?: number;
};

const FormationDetailsHeaderContext = createContext<{
  headersSize: DetailsHeaderSize;
  setHeadersSize: (params: DetailsHeaderSizeParams) => void;
}>({
  headersSize: { headerHeight: 0, resumeHeight: 0 },
  setHeadersSize: (params: DetailsHeaderSizeParams) => {},
});

const FormationDetailsHeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [headersSize, setHeadersSize] = useState({ headerHeight: 0, resumeHeight: 0 });

  const setHeaderSizeCb = useCallback(
    (newHeadersSize: DetailsHeaderSizeParams) => {
      setHeadersSize((prevState) => ({ ...prevState, ...newHeadersSize }));
    },
    [setHeadersSize]
  );

  return (
    <FormationDetailsHeaderContext.Provider
      value={{
        headersSize,
        setHeadersSize: setHeaderSizeCb,
      }}
    >
      {children}
    </FormationDetailsHeaderContext.Provider>
  );
};

export const useFormationsDetailsHeadersSize = () => {
  return useContext(FormationDetailsHeaderContext);
};

export default FormationDetailsHeaderProvider;
