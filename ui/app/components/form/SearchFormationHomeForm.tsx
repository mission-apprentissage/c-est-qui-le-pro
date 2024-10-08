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

export default function SearchFormationHomeForm({
  url,
  defaultValues,
  bordered,
}: {
  url: string;
  defaultValues: Nullable<SearchFormationFormData>;
  bordered?: boolean;
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
            spacing={0}
            style={{
              backgroundColor: "#FFFFFF",
              ...(bordered ? { borderRadius: "5px", border: "2px solid var(--blue-france-sun-113-625-hover)" } : {}),
            }}
          >
            <Grid item md={12} sm={12} xs={12}>
              <Stack direction="row" spacing={2} style={{ position: "relative" }}>
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
                {!isDownSm && (
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
            <Grid item md={4} sm={4} xs={12} style={{ textAlign: "left" }}></Grid>
          </Grid>
        );
      }}
    </FormSearchParams>
  );
}
