import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { isEqual } from "lodash-es";
import { SearchFormationFormData } from "#/app/components/form/SearchFormationForm";
import { Nullable } from "#/app/utils/types";

export default function useSearchHistory(maxItems = 20) {
  // TODO: local storage versionning
  const [historyStorage, saveHistoryStorage] = useLocalStorage<Nullable<SearchFormationFormData>[]>(
    "searchHistory.1",
    []
  );

  const push = useCallback(
    (search: Nullable<SearchFormationFormData>) => {
      saveHistoryStorage([search, ...historyStorage.filter((h) => !isEqual(h, search))].slice(0, maxItems));
    },
    [saveHistoryStorage, historyStorage, maxItems]
  );

  return { history: historyStorage, push };
}
