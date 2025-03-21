"use client";
import styled from "@emotion/styled";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid } from "#/app/components/MaterialUINext";
import { Controller } from "react-hook-form";
import { Nullable } from "#/app/utils/types";
import { FormSearchParams } from "./FormSearchParams";
import AddressField, { myPosition } from "./AddressField";
import Button, { ButtonProps } from "../Button";
import { SearchFormationFormData, schema } from "./SearchFormationForm";
import { Box, Stack, Theme } from "@mui/material";
import useSearchHistory from "#/app/(accompagnateur)/hooks/useSearchHistory";
import FormationField from "./FormationField";
import { useEffect, useMemo, useState } from "react";
import { uniq } from "lodash-es";
import { fr } from "@codegouvfr/react-dsfr";

const SubmitStyled = styled(Button, {
  shouldForwardProp: (prop) => !["isFocusMobile"].includes(prop),
})<ButtonProps & { isFocusMobile?: boolean }>`
  border-radius: 26px;
  height: 100%;
  width: 100%;
  background-color: var(--blue-france-sun-113-625-hover);
  font-size: 20px;
  line-height: 32px;
  justify-content: center;
  --hover-tint: ${fr.colors.decisions.border.active.blueFrance.default};

  ${({ isFocusMobile }) => {
    return isFocusMobile
      ? `border-radius: 36px;
            padding: 1rem;
            padding-left: 2rem;
            padding-right: 2rem;`
      : "";
  }}
`;

export default function SearchFormationHomeForm({
  url,
  defaultValues,
  bordered,
  withFormation = false,
}: {
  url: string;
  defaultValues: Nullable<SearchFormationFormData>;
  bordered?: boolean;
  withFormation?: boolean;
}) {
  const [isFocus, setIsFocus] = useState(false);
  const [isBordered, setIsBordered] = useState(bordered);
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { history, push: pushHistory } = useSearchHistory();
  const addressHistory = useMemo(
    () => uniq(history.map(({ address }) => address).filter((a) => a !== myPosition)),
    [history]
  );
  const formationHistory = useMemo(() => uniq(history.map(({ formation }) => formation).filter((f) => f)), [history]);

  useEffect(() => {
    setIsBordered(bordered || (isFocus && isDownSm));

    if (isDownSm) {
      if (isFocus) {
        if (typeof window != "undefined" && window.document) {
          document.body.style.overflow = "hidden";
        }
      } else {
        document.body.style.overflow = "unset";
      }
    }
  }, [bordered, isFocus, isDownSm]);

  return (
    <div style={{ ...(isFocus && isDownSm ? { height: "100vh", backgroundColor: "white", width: "100%" } : {}) }}>
      <div
        style={{
          ...(isFocus && isDownSm
            ? {
                width: "100%",
                backgroundColor: "white",
                position: "fixed",
                top: "0",
                left: 0,
                height: "100%",
                zIndex: 9999,
                padding: "1rem",
                display: "flex",
                flexFlow: "column",
              }
            : {}),
        }}
      >
        {isFocus && isDownSm && (
          <div style={{ marginBottom: "1rem" }}>
            <Button
              iconOnly
              size="large"
              rounded
              iconId="fr-icon-close-line"
              priority="tertiary no outline"
              title="Fermer la recherche"
              onClick={(e) => {
                e.preventDefault();
                setIsFocus(false);
              }}
            />
          </div>
        )}
        <FormSearchParams
          onSubmit={(data) => {
            setIsFocus(false);
            data.address && pushHistory(data);
          }}
          url={url}
          defaultValues={defaultValues}
          schema={schema}
          dynamicValues={["domaines", "tag"]}
        >
          {({ control, errors, formRef }) => {
            return (
              <>
                <div style={{ flex: 1 }}>
                  <Grid
                    container
                    columnSpacing={!withFormation ? { xs: 0 } : { xs: 0, md: 4 }}
                    rowSpacing={withFormation ? { xs: 2, md: 4 } : { xs: 0 }}
                    style={{
                      backgroundColor: "#FFFFFF",
                      ...(isBordered && !withFormation
                        ? { borderRadius: "5px", border: "2px solid var(--blue-france-sun-113-625-hover)" }
                        : {}),
                    }}
                  >
                    <Grid item xs={!withFormation ? 12 : 12} md={!withFormation ? 12 : 5}>
                      <Stack
                        direction="row"
                        spacing={2}
                        style={{
                          position: "relative",
                          backgroundColor: "#FFFFFF",
                          ...(isBordered && withFormation
                            ? { borderRadius: "5px", border: "2px solid var(--blue-france-sun-113-625-hover)" }
                            : {}),
                        }}
                      >
                        <Controller
                          name="address"
                          control={control}
                          render={(form) => (
                            <AddressField
                              sx={{ padding: "18px", paddingRight: "0px" }}
                              isMobile={isDownSm}
                              InputProps={{
                                disableUnderline: true,
                              }}
                              error={errors?.address}
                              form={form}
                              formRef={formRef}
                              submitOnChange={!withFormation || !isDownSm}
                              defaultValues={addressHistory}
                              onOpen={() => setIsFocus(true)}
                            />
                          )}
                        />
                        {!isDownSm && !withFormation && (
                          <Box
                            sx={{
                              width: "33%",
                              padding: "18px",
                              paddingLeft: "0",
                              paddingRight: "24px",
                              display: { xs: "none", md: "block" },
                            }}
                          >
                            <SubmitStyled type={"submit"}>{"Explorer"}</SubmitStyled>
                          </Box>
                        )}
                      </Stack>
                    </Grid>

                    {withFormation && (
                      <Grid item xs={12} md={5}>
                        <Stack
                          direction="row"
                          spacing={2}
                          style={{
                            position: "relative",
                            backgroundColor: "#FFFFFF",
                          }}
                        >
                          <Controller
                            name="formation"
                            control={control}
                            render={(form) => (
                              <FormationField
                                submitOnChange={!isDownSm}
                                bordered={isBordered && withFormation}
                                sx={{ padding: "18px", paddingRight: "0px" }}
                                isMobile={isDownSm}
                                InputProps={{
                                  disableUnderline: true,
                                }}
                                error={errors?.formation}
                                form={form}
                                formRef={formRef}
                                onOpen={() => setIsFocus(true)}
                                defaultValues={formationHistory}
                              />
                            )}
                          />
                        </Stack>
                      </Grid>
                    )}
                    {withFormation && !isDownSm && (
                      <Grid item md={2} xs={4}>
                        {
                          <Box
                            sx={{
                              width: "100%",
                              paddingTop: "18px",
                              paddingBottom: "18px",
                              display: { xs: "block", md: "block" },
                            }}
                          >
                            <SubmitStyled type={"submit"}>{"Explorer"}</SubmitStyled>
                          </Box>
                        }
                      </Grid>
                    )}
                  </Grid>
                </div>
                {isFocus && isDownSm && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div></div>
                    <SubmitStyled type={"submit"} isFocusMobile>
                      {"Explorer"}
                    </SubmitStyled>
                  </div>
                )}
              </>
            );
          }}
        </FormSearchParams>
      </div>
    </div>
  );
}
