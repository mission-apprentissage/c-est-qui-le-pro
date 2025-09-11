import { SearchFormationFormData } from "#/app/components/form/SearchFormationForm";
import { createContext, useContext, ReactNode, useRef, useCallback } from "react";
import { UseFormSetFocus } from "react-hook-form";

interface FocusSearchContextType {
  registerSetFocusSearch: (setFocus: UseFormSetFocus<SearchFormationFormData>) => void;
  focusField: (fieldName: keyof SearchFormationFormData) => void;
  isFormReady: boolean;
}

const FocusSearchContext = createContext<FocusSearchContextType | undefined>(undefined);

export default function FocusSearchProvider({ children }: { children: ReactNode }) {
  const setFocusRef = useRef<UseFormSetFocus<SearchFormationFormData> | null>(null);
  const isFormReady = useRef(false);

  const registerSetFocusSearch = useCallback((setFocus: UseFormSetFocus<SearchFormationFormData>) => {
    setFocusRef.current = setFocus;
    isFormReady.current = true;
  }, []);

  const focusField = useCallback((fieldName: keyof SearchFormationFormData) => {
    if (setFocusRef.current) {
      setFocusRef.current(fieldName);
    }
  }, []);

  return (
    <FocusSearchContext.Provider
      value={{
        registerSetFocusSearch,
        focusField,
        isFormReady: isFormReady.current,
      }}
    >
      {children}
    </FocusSearchContext.Provider>
  );
}

export function useFocusSearchContext() {
  const context = useContext(FocusSearchContext);
  if (!context) {
    throw new Error("useFocusSearchContext must be used within FocusSearchProvider");
  }
  return context;
}
