"use client";

import { Grid } from "#/app/components/MaterialUINext";
import { Controller } from "react-hook-form";
import * as yup from "yup";
import { Nullable } from "#/app/utils/types";
import FormSearchParams from "./FormSearchParams";
import AddressField from "./AddressField";
import Button from "../Button";

export type SearchFormationFormData = {
  address: string;
  formation?: string | null;
  tag?: string;
  domaine?: string;
};

export const schema: yup.ObjectSchema<SearchFormationFormData> = yup
  .object({
    address: yup.string().required(),
    tag: yup.string(),
    domaine: yup.string(),
    formation: yup.string().nullable(),
  })
  .required();

export default function SearchFormationForm({
  url,
  defaultValues,
}: {
  url: string;
  defaultValues: Nullable<SearchFormationFormData>;
}) {
  return (
    <FormSearchParams url={url} defaultValues={defaultValues} schema={schema} forceValues={{ tag: "" }}>
      {({ control, errors }) => {
        return (
          <Grid container spacing={2}>
            <Grid item md={6} sm={8} xs={12} style={{ position: "relative" }}>
              <Controller
                name="address"
                control={control}
                render={(form) => <AddressField error={errors?.address} form={form} />}
              />
            </Grid>
            <Grid item md={4} sm={2} xs={6} style={{ textAlign: "left" }}>
              <Button
                type={"submit"}
                smallIconOnly={true}
                style={{ height: "100%", width: "100%" }}
                iconId={"fr-icon-search-line"}
              >
                {"Rechercher des formations"}
              </Button>
            </Grid>
          </Grid>
        );
      }}
    </FormSearchParams>
  );
}
