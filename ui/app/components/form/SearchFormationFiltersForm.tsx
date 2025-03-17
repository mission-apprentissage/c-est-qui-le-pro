/** @jsxImportSource @emotion/react */
"use client";
import { FormationDomaine } from "shared";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Theme } from "@mui/material";
import { capitalize, isArray, isNil } from "lodash-es";
import MultiSelect from "#/app/components/form/MultiSelect";
import { FORMATION_DOMAINE } from "#/app/services/formation";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormationsSearch } from "#/app/(accompagnateur)/context/FormationsSearchContext";
import { schema } from "./SearchFormationForm";
import { useEffect, useMemo, useState } from "react";
import CustomDivider from "../Divider";
import Button from "../Button";
import {
  ClearButtonText,
  DesktopFilterContainer,
  FilterBadge,
  FilterButton,
  FilterIcon,
  MobileContainer,
  MobileContentContainer,
  MobileFooter,
  MobileHeaderContainer,
  MobileHeaderTitle,
  MobileSubtitle,
} from "./SearchFormationFiltersForm.styled";

export default function SearchFormationFiltersForm() {
  const [isFocus, setIsFocus] = useState(false);
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { params, updateParams } = useFormationsSearch();
  const defaultValues = {
    domaines: params?.domaines,
  };

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema.pick(["domaines"])),
    defaultValues,
  });

  const values = watch();

  const hasFilter = useMemo(() => {
    return Object.values(values).find((v) => (isArray(v) ? v.length > 0 : !isNil(v)));
  }, [values]);

  const reset = (values: typeof defaultValues | null = null) => {
    resetForm(values || { domaines: [] });
  };
  const onSubmit = (data: any) => {
    if (!params) {
      return;
    }

    updateParams({
      ...params,
      domaines: data.domaines,
    });
  };

  const submitMobile = () => {
    setIsFocus(false);
    handleSubmit(onSubmit)();
  };

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

  if (!isMobile || isFocus) {
    return isMobile ? (
      <MobileContainer>
        <MobileHeaderContainer>
          <MobileHeaderTitle variant="h5">Filtres</MobileHeaderTitle>
          <Box>
            <Button
              onClick={() => {
                setIsFocus(false);
                reset(defaultValues);
              }}
              className="fr-btn--close fr-btn"
            >
              Fermer
            </Button>
          </Box>
        </MobileHeaderContainer>
        <CustomDivider />
        <MobileContentContainer>
          <Box>
            <MobileSubtitle variant="subtitle1">Domaines</MobileSubtitle>
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
                    onApply={(value) => {
                      handleSubmit(onSubmit)();
                    }}
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
        </MobileContentContainer>
        <CustomDivider />
        <MobileFooter>
          <Box>
            <Button priority="tertiary no outline" variant="black" onClick={() => reset()}>
              <ClearButtonText variant="body2">Tout effacer</ClearButtonText>
            </Button>
          </Box>
          <Box>
            <Button rounded variant="blue-france-hover" onClick={submitMobile}>
              Appliquer
            </Button>
          </Box>
        </MobileFooter>
      </MobileContainer>
    ) : (
      <Box>
        <Box>
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
                  onApply={(value) => {
                    handleSubmit(onSubmit)();
                  }}
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
      </Box>
    );
  }

  return (
    <DesktopFilterContainer>
      <FilterButton priority="tertiary no outline" iconId="ri-equalizer-line" onClick={() => setIsFocus(true)}>
        Filtres
        {hasFilter && <FilterBadge />}
      </FilterButton>
    </DesktopFilterContainer>
  );
}
