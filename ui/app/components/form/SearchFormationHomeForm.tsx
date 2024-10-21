"use client";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid } from "#/app/components/MaterialUINext";
import { Controller } from "react-hook-form";
import { Nullable } from "#/app/utils/types";
import { FormSearchParams } from "./FormSearchParams";
import AddressField, { myPosition } from "./AddressField";
import DistanceField from "./DistanceField";
import TimeField from "./TimeField";
import Button from "../Button";
import { SearchFormationFormData, schema } from "./SearchFormationForm";
import { Box, Stack, Theme } from "@mui/material";
import useSearchHistory from "#/app/(accompagnateur)/hooks/useSearchHistory";
import FormationField from "./FormationField";

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
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { history, push: pushHistory } = useSearchHistory();
  return (
    <FormSearchParams
      onSubmit={(data) => {
        data.address && data.address !== myPosition && pushHistory(data.address);
      }}
      url={url}
      defaultValues={defaultValues}
      schema={schema}
      forceValues={{ tag: "", domaine: "" }}
    >
      {({ control, errors, formRef }) => {
        return (
          <Grid
            container
            columnSpacing={!withFormation ? { xs: 0 } : { xs: 2, sm: 4 }}
            rowSpacing={withFormation ? 4 : 0}
            style={{
              backgroundColor: "#FFFFFF",
              ...(bordered && !withFormation
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
                  ...(bordered && withFormation
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
                      submitOnChange={true}
                      defaultValues={history}
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
                    <Button
                      type={"submit"}
                      style={{
                        borderRadius: "26px",
                        height: "100%",
                        width: "100%",
                        backgroundColor: "var(--blue-france-sun-113-625-hover)",
                        fontSize: "20px",
                        lineHeight: "32px",
                        justifyContent: "center",
                      }}
                    >
                      {"Explorer"}
                    </Button>
                  </Box>
                )}
              </Stack>
            </Grid>

            {withFormation && (
              <Grid item xs={8} md={5}>
                <Stack
                  direction="row"
                  spacing={2}
                  style={{
                    position: "relative",
                    backgroundColor: "#FFFFFF",
                    ...(bordered && withFormation
                      ? { borderRadius: "5px", border: "2px solid var(--blue-france-sun-113-625-hover)" }
                      : {}),
                  }}
                >
                  <Controller
                    name="formation"
                    control={control}
                    render={(form) => (
                      <FormationField
                        sx={{ padding: "18px", paddingRight: "0px" }}
                        isMobile={isDownSm}
                        InputProps={{
                          disableUnderline: true,
                        }}
                        error={errors?.formation}
                        form={form}
                        formRef={formRef}
                        submitOnChange={true}
                      />
                    )}
                  />
                </Stack>
              </Grid>
            )}
            {withFormation && (
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
                    <Button
                      type={"submit"}
                      style={{
                        borderRadius: "26px",
                        height: "100%",
                        width: "100%",
                        backgroundColor: "var(--blue-france-sun-113-625-hover)",
                        fontSize: "20px",
                        lineHeight: "32px",
                        justifyContent: "center",
                      }}
                    >
                      {"Explorer"}
                    </Button>
                  </Box>
                }
              </Grid>
            )}
            <Grid item md={2} xs={2} style={{ display: "none" }}>
              <Controller
                name="distance"
                control={control}
                render={(form) => <DistanceField error={errors?.distance} form={form} />}
              />
            </Grid>
            <Grid item md={2} sm={2} xs={6} style={{ display: "none" }}>
              <Controller
                name="time"
                control={control}
                render={(form) => <TimeField error={errors?.time} form={form} />}
              />
            </Grid>
          </Grid>
        );
      }}
    </FormSearchParams>
  );
}
