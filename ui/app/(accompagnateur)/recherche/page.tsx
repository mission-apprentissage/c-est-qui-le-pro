import FormationsSearchProvider from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";
import SearchFormationFiltersForm from "#/app/components/form/SearchFormationFiltersForm";
import { HeaderContainer } from "./page.styled";
import FocusSearchProvider from "../context/FocusSearchContext";
import { ResearchFormationsParameter, ScrollToTop } from "./page.client";
import { fetchAddress, userLocationFromAddress } from "#/app/services/address";
import { formations } from "#/app/queries/formations/query";
import { ReadonlyURLSearchParams } from "next/navigation";
import { searchParamsToObject } from "#/app/utils/searchParams";
import { schema as schemaFormation } from "#/app/components/form/SearchFormationForm";
import { Metadata } from "next";
import { getFiltersString } from "#/app/utils/metadata";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = searchParamsToObject(
    new URLSearchParams(
      Object.entries(await searchParams)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, Array.isArray(value) ? value.join("|") : String(value)])
    ) as any as ReadonlyURLSearchParams,
    { address: null, tag: null, domaines: null },
    schemaFormation
  );
  const { address, tag, domaines, recherche, voie, diplome } = params ?? {};
  const initialLocation =
    address && address !== "Autour de moi"
      ? userLocationFromAddress(await fetchAddress(address, { signal: undefined }))
      : null;
  const addressString = address === "Autour de moi" ? "Autour de moi" : initialLocation?.city;
  const filtersString = getFiltersString({ tag, domaines, voie, diplome, recherche });

  return {
    title: `Les formations pro accessibles depuis ${addressString}${filtersString ? ` - ${filtersString}` : ""}`,
    description:
      `Retrouvez l’ensemble des formations pro post-3e, accessibles depuis ${addressString}.` + filtersString
        ? ` Les formations présentées correspondent aux filtres suivants : ${filtersString}`
        : "",
  };
}

export default async function Page({ searchParams }: Props) {
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
  const initialLocation =
    address && address !== "Autour de moi"
      ? userLocationFromAddress(await fetchAddress(address, { signal: undefined }))
      : null;

  const initialFormations = initialLocation
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
      <ScrollToTop />

      <FormationsSearchProvider initialParams={params}>
        <FocusSearchProvider>
          <HeaderContainer>
            <SearchHeader />
            <SearchFormationFiltersForm />
          </HeaderContainer>

          <ResearchFormationsParameter initialLocation={initialLocation} initialFormations={initialFormations} />
        </FocusSearchProvider>
      </FormationsSearchProvider>
    </>
  );
}
