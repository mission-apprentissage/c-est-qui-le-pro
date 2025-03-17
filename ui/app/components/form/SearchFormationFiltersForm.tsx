/** @jsxImportSource @emotion/react */
"use client";
import { css } from "@emotion/react";
import { FormationDomaine } from "shared";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Theme, Typography } from "@mui/material";
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
    handleSubmit(onSubmit);
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

  return !isMobile || isFocus ? (
    <Box
      css={css`
        ${isMobile &&
        `position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        background-color: white;
        z-index: 9999;
        display: flex;
        flex-direction: column;`}
      `}
    >
      {isMobile && (
        <>
          <Box
            css={css`
              display: flex;
              margin-left: 1rem;
              margin-right: 1rem;
              align-items: center;
            `}
          >
            <Typography
              variant="h5"
              css={css`
                text-align: center;
                flex: 1;
                margin: 0.5rem;
              `}
            >
              Filtres
            </Typography>
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
          </Box>
          <CustomDivider></CustomDivider>
        </>
      )}
      <Box
        css={css`
          ${isMobile &&
          `
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          overflow: scroll;
          display: flex;
          padding-bottom: 1rem;
          flex-direction: column;
          `}
        `}
      >
        <Box>
          {isMobile && (
            <Typography
              variant="subtitle1"
              css={css`
                margin-top: 2rem;
                margin-bottom: 1rem;
              `}
            >
              Domaines
            </Typography>
          )}
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
                        <i
                          className={FORMATION_DOMAINE.find((f) => f.domaine === value[0])?.icon}
                          css={css`
                            padding-right: 0.5rem;
                          `}
                        ></i>
                        {value.length === 1 ? capitalize(value[0]) : `${value.length} domaines`}
                      </>
                    ) : (
                      <>
                        <i
                          className="ri-anchor-line"
                          css={css`
                            padding-right: 0.5rem;
                          `}
                        ></i>
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
      {isMobile && (
        <>
          <CustomDivider></CustomDivider>
          <Box
            css={css`
              display: flex;
              padding: 1rem;
              padding-left: 2rem;
              padding-right: 2rem;
              align-items: center;
              justify-content: space-between;
            `}
          >
            <Box>
              <Button priority="tertiary no outline" variant="black" onClick={() => reset()}>
                <Typography
                  variant="body2"
                  css={css`
                    font-weight: 700;
                  `}
                >
                  Tout effacer
                </Typography>
              </Button>
            </Box>
            <Box>
              <Button rounded variant="blue-france-hover" onClick={submitMobile}>
                Appliquer
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  ) : (
    <Box
      css={css`
        display: flex;
        justify-content: flex-end;
      `}
    >
      <Button
        priority="tertiary no outline"
        iconId="ri-equalizer-line"
        css={css`
          position: relative;
        `}
        onClick={() => setIsFocus(true)}
      >
        Filtres
        {hasFilter && (
          <Box
            css={css`
              position: absolute;
              width: 16px;
              height: 16px;
              right: 0;
              top: 0;
              background: #1212ff;
              border-radius: 8px;
            `}
          ></Box>
        )}
      </Button>
    </Box>
  );
}
