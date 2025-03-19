/** @jsxImportSource @emotion/react */
"use client";
import { FormationDomaine } from "shared";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Theme } from "@mui/material";
import { capitalize, isArray, isNil } from "lodash-es";
import MultiSelect from "#/app/components/form/MultiSelect";
import { FORMATION_DOMAINE, FORMATION_VOIE } from "#/app/services/formation";
import { Control, Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormationsSearch } from "#/app/(accompagnateur)/context/FormationsSearchContext";
import { schema } from "./SearchFormationForm";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomDivider from "../Divider";
import Button from "../Button";
import {
  ClearButtonText,
  MobileFilterButtons,
  FilterBadge,
  FilterButton,
  FilterIcon,
  MobileContainer,
  MobileContentContainer,
  MobileFooter,
  MobileHeaderContainer,
  MobileHeaderTitle,
  MobileSubtitle,
  FilterContainer,
  FilterContainerMobile,
} from "./SearchFormationFiltersForm.styled";
import * as yup from "yup";

const schemaFilters = schema.pick(["domaines", "voie"]);

function FilterDomaines({
  control,
  isMobile,
  onApply,
}: {
  control: Control<yup.InferType<typeof schemaFilters>>;
  isMobile: boolean;
  onApply: () => void;
}) {
  return (
    <Box>
      {isMobile && <MobileSubtitle variant="subtitle1">Domaines</MobileSubtitle>}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <MultiSelect
              isMobile={isMobile}
              label={
                value && value.length ? (
                  <>
                    <FilterIcon className={FORMATION_DOMAINE.find((f) => f.domaine === value[0])?.icon} />
                    {value.length === 1 ? capitalize(value[0]) : `${value.length} domaines`}
                  </>
                ) : (
                  <>
                    <FilterIcon className="ri-anchor-line" />
                    Tous les domaines
                  </>
                )
              }
              maxHeight={"380px"}
              width={"220px"}
              name="domaines"
              onChange={onChange}
              onApply={onApply}
              value={value || []}
              options={FORMATION_DOMAINE.filter(({ domaine }) => domaine !== FormationDomaine["tout"]).map(
                ({ domaine, icon }) => ({
                  option: capitalize(domaine),
                  icon: icon,
                  value: domaine,
                })
              )}
            />
          );
        }}
        name="domaines"
      />
    </Box>
  );
}

function FilterVoie({
  control,
  isMobile,
  onApply,
}: {
  control: Control<yup.InferType<typeof schemaFilters>>;
  isMobile: boolean;
  onApply: () => void;
}) {
  return (
    <Box>
      {isMobile && <MobileSubtitle variant="subtitle1">Enseignement</MobileSubtitle>}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => {
          const firstVoie = value?.length ? FORMATION_VOIE.find(({ voie }) => voie === value[0]) : null;
          return (
            <MultiSelect
              isMobile={isMobile}
              label={
                value && value.length == 1 ? (
                  <>
                    <FilterIcon className={firstVoie?.icon} />
                    {capitalize(firstVoie?.libelleSmall)}
                  </>
                ) : (
                  <>
                    <FilterIcon className="ri-community-line" />
                    Alternance & Scolaire
                  </>
                )
              }
              maxHeight={"100%"}
              width={"245px"}
              name="voie"
              description="L'alternance permet d'allier études et pratique en entreprise tandis que la voie scolaire reste dans la continuité de l’enseignement théorique."
              onChange={onChange}
              onApply={onApply}
              value={value || []}
              options={FORMATION_VOIE.filter(({ voie }) => voie).map(({ libelle, voie, icon, pictogramme }) => ({
                option: capitalize(libelle),
                pictogramme: pictogramme,
                value: voie || "",
              }))}
            />
          );
        }}
        name="voie"
      />
    </Box>
  );
}

function SearchFormationFiltersElementsMobile({
  control,
  isMobile,
  onApply,
}: {
  control: Control<yup.InferType<typeof schemaFilters>>;
  isMobile: boolean;
  onApply: () => void;
}) {
  return (
    <FilterContainerMobile>
      <FilterVoie control={control} isMobile={isMobile} onApply={onApply} />
      <FilterDomaines control={control} isMobile={isMobile} onApply={onApply} />
    </FilterContainerMobile>
  );
}

function SearchFormationFiltersElements({
  control,
  isMobile,
  onApply,
}: {
  control: Control<yup.InferType<typeof schemaFilters>>;
  isMobile: boolean;
  onApply: () => void;
}) {
  return (
    <FilterContainer>
      <FilterDomaines control={control} isMobile={isMobile} onApply={onApply} />
      <FilterVoie control={control} isMobile={isMobile} onApply={onApply} />
    </FilterContainer>
  );
}

export default function SearchFormationFiltersForm() {
  const [isFocus, setIsFocus] = useState(false);
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { params, updateParams } = useFormationsSearch();
  const defaultValues = {
    domaines: params?.domaines,
    voie: params?.voie,
  };

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schemaFilters),
    defaultValues,
  });

  const values = watch();

  const hasFilter = useMemo(() => {
    return Object.values(values).find((v) => (isArray(v) ? v.length > 0 : !isNil(v)));
  }, [values]);

  const reset = useCallback(
    (values: typeof defaultValues | null = null) => {
      resetForm(values || { domaines: [], voie: [] });
    },
    [resetForm]
  );

  const onApply = useCallback(() => {
    handleSubmit((data: any) => {
      if (!params) {
        return;
      }
      updateParams({ ...params, voie: data.voie, domaines: data.domaines });
    })();
  }, [handleSubmit, updateParams]);

  const submitMobile = useCallback(() => {
    setIsFocus(false);
    onApply();
  }, [setIsFocus, onApply]);

  const resetMobile = useCallback(() => {
    setIsFocus(false);
    reset(defaultValues);
  }, [setIsFocus, reset, defaultValues]);

  useEffect(() => {
    if (isMobile) {
      if (isFocus) {
        if (typeof window != "undefined" && window.document) {
          document.body.style.overflow = "hidden";
        }
      } else {
        document.body.style.overflow = "unset";
      }
    }
  }, [isFocus, isMobile]);

  if (isMobile) {
    return isFocus ? (
      <MobileContainer>
        <MobileHeaderContainer>
          <MobileHeaderTitle variant="h5">Filtres</MobileHeaderTitle>
          <Button onClick={resetMobile} className="fr-btn--close fr-btn">
            Fermer
          </Button>
        </MobileHeaderContainer>
        <CustomDivider />
        <MobileContentContainer>
          <SearchFormationFiltersElementsMobile control={control} isMobile={isMobile} onApply={onApply} />
        </MobileContentContainer>
        <CustomDivider />
        <MobileFooter>
          <Button priority="tertiary no outline" variant="black" onClick={() => reset()}>
            <ClearButtonText variant="body2">Tout effacer</ClearButtonText>
          </Button>
          <Button rounded variant="blue-france-hover" onClick={submitMobile}>
            Appliquer
          </Button>
        </MobileFooter>
      </MobileContainer>
    ) : (
      <MobileFilterButtons>
        <FilterButton priority="tertiary no outline" iconId="ri-equalizer-line" onClick={() => setIsFocus(true)}>
          Filtres
          {hasFilter && <FilterBadge />}
        </FilterButton>
      </MobileFilterButtons>
    );
  }

  return <SearchFormationFiltersElements control={control} isMobile={isMobile} onApply={onApply} />;
}
