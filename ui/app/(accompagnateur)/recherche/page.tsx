import FormationsSearchProvider from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";
import Title from "../components/Title";
import SearchFormationFiltersForm from "#/app/components/form/SearchFormationFiltersForm";
import { HeaderContainer } from "./page.styled";
import FocusSearchProvider from "../context/FocusSearchContext";
import { ResearchFormationsParameter, ScrollToTop } from "./page.client";
import { fetchAddress, userLocationFromAddress } from "#/app/services/address";
import { formations } from "#/app/queries/formations/query";
import { ReadonlyURLSearchParams } from "next/navigation";
import { searchParamsToObject } from "#/app/utils/searchParams";
import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import RouterUpdaterProvider from "../context/RouterUpdaterContext";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParamsToObject(
    new URLSearchParams(
      Object.entries(await searchParams)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, Array.isArray(value) ? value.join("|") : String(value)])
    ) as any as ReadonlyURLSearchParams,
    { address: null, tag: null, domaines: null },
    schemaFormation
  );
  const { address, tag, domaines, recherche, voie, diplome, minWeight } = params ?? {};

  // Server-side data fetching
  let initialLocation =
    address && address !== "Autour de moi"
      ? userLocationFromAddress(await fetchAddress(address, { signal: undefined }))
      : null;

  let initialFormations = initialLocation
    ? await formations(
        {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          distance: 0,
          timeLimit: 5400,
          tag,
          voie,
          diplome,
          domaines,
          recherche: recherche || null,
          page: 1,
          items_par_page: 100,
          academie: initialLocation.academie,
          minWeight: minWeight ?? 101,
        },
        { signal: undefined }
      )
    : null;

  return (
    <>
      <Title pageTitle="Recherche de formations" />
      <ScrollToTop />

      <RouterUpdaterProvider>
        <FormationsSearchProvider initialParams={params}>
          <FocusSearchProvider>
            <HeaderContainer>
              <SearchHeader />
              <SearchFormationFiltersForm />
            </HeaderContainer>

            <ResearchFormationsParameter initialLocation={initialLocation} initialFormations={initialFormations} />
          </FocusSearchProvider>
        </FormationsSearchProvider>
      </RouterUpdaterProvider>
    </>
  );
}
