"use client";
import React from "react";
import { TextField } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";
export default function FormationField({
  form: {
    field: { onChange, onBlur, value, name, ref, ...rest },
    ...formProps
  },
  InputProps,
  error,
  sx,
}: any) {
  return (
    <>
      <Autocomplete
        value={value || ""}
        defaultValue={value}
        onInputChange={(e, v) => onChange(v)}
        onChange={(e, v) => onChange(v)}
        getOptionLabel={(option) => option.toString()}
        filterOptions={(x) => x}
        freeSolo
        disablePortal
        style={{ width: "100%" }}
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
          ...sx,
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option}>
              {option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={!!error}
            helperText={error ? "La formation n'est pas valide" : ""}
            InputLabelProps={{ shrink: true }}
            label={"Ta formation, un mot clé"}
            placeholder={"Exemple: Art et communication"}
            onFocus={(event) => {
              event.target.select();
            }}
            InputProps={{
              ...params.InputProps,
              type: "search",
              endAdornment: (
                <>{<div style={{ position: "absolute", right: "10px" }}>{params.InputProps.endAdornment}</div>}</>
              ),
              ...InputProps,
            }}
            variant="standard"
          />
        )}
        options={[]}
      />
    </>
  );
}
