"use client";
import React, { HTMLAttributes, useState } from "react";
import { Box, TextField, Typography } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "../Link";
import { Popper, PopperProps } from "@mui/material";

const ListboxComponent = React.forwardRef<HTMLUListElement>(function ListboxComponent(
  props: HTMLAttributes<HTMLElement>,
  ref
) {
  const { children, style, ...other } = props;

  return (
    <div className="listbox-container">
      <ul {...other} ref={ref}>
        {children}
      </ul>
      <Typography
        onMouseDown={(event) => {
          // Prevent blur
          event.preventDefault();
        }}
        className="listbox-footer"
        variant="body3"
        style={{ padding: "1rem" }}
      >
        Formation non trouvée ?{" "}
        <Link target="_blank" href="mailto:contact@inserjeunes.beta.gouv.fr">
          Envoyer une alerte aux équipes.
        </Link>
      </Typography>
    </div>
  );
});

const CustomPopper = ({ isMobile, isFocus, ...props }: PopperProps & { isFocus: boolean; isMobile: boolean }) => {
  const { children, className, placement = "bottom" } = props;

  return isFocus && isMobile ? (
    <Box
      className={className}
      sx={{
        flex: " 1 1 auto",
        "& .MuiPaper-root": {
          height: "100%",
          maxHeight: "50dvh",
          boxShadow: "none",
        },
        "& .MuiAutocomplete-listbox": {
          overflowY: "auto",
          maxHeight: "100%",
          flex: "1 1 auto",
        },
        "& .listbox-container": {
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
        "& .listbox-footer": {
          flex: "0 1 auto",
        },
      }}
      style={{ position: "static" }}
    >
      {typeof children === "function" ? children({ placement }) : children}
    </Box>
  ) : (
    <Popper
      {...props}
      modifiers={[
        {
          name: "flip",
          enabled: false,
        },
      ]}
      placement="bottom-start"
      sx={{
        marginTop: "18px !important",
        marginLeft: { md: "-18px !important" },
        "& .MuiPaper-root": {
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.2)",
        },
      }}
      style={{
        width: "calc(100%)",
      }}
    />
  );
};

export default function FormationField({
  formRef,
  form: {
    field: { onChange, onBlur, value, name, ref, ...rest },
    ...formProps
  },
  InputProps,
  error,
  sx,
  onOpen,
  defaultValues,
  isMobile,
  bordered,
  submitOnChange,
}: any) {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <div
      data-private
      style={{
        width: "100%",
        borderRadius: "5px",
        backgroundColor: "white",
        ...(bordered && (!isMobile || !isFocus)
          ? { borderRadius: "5px", border: "2px solid var(--blue-france-sun-113-625-hover)" }
          : {}),
      }}
    >
      <Autocomplete
        value={value || ""}
        defaultValue={value}
        open={isFocus}
        onOpen={(e) => {
          onOpen && onOpen();
          setIsFocus(true);
        }}
        onBlur={(e) => {
          setIsFocus(false);
        }}
        onInputChange={(e, v) => {
          onChange(v);
        }}
        onChange={(e, v) => {
          onChange(v);
          submitOnChange && formRef.current.requestSubmit();
          setIsFocus(false);
        }}
        onClose={() => {
          submitOnChange && formRef.current.requestSubmit();
          setIsFocus(false);
        }}
        getOptionLabel={(option) => option.toString()}
        filterOptions={(options, params) => {
          return [...(value ? [value] : []), ...options];
        }}
        freeSolo
        disablePortal
        options={defaultValues.filter((v: string) => v !== value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
          ...(isFocus && isMobile
            ? {
                flex: " 0 1 auto",
                borderRadius: "5px",
                border: "2px solid var(--blue-france-sun-113-625-hover)",
              }
            : {}),
          ...sx,
        }}
        PopperComponent={(props) => <CustomPopper isFocus={isFocus} isMobile={isMobile} {...props} />}
        ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
        renderOption={(props, option) => {
          const { key, ...rest } = props;

          return (
            <li key={option} {...rest}>
              <i
                className={fr.cx("ri-award-line")}
                style={{
                  borderRadius: "3px",
                  padding: fr.spacing("1v"),
                  marginRight: fr.spacing("3v"),
                  backgroundColor: "var(--info-950-100)",
                  color: "var(--blue-france-sun-113-625-hover)",
                }}
              ></i>
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
            label={"Une formation, un type de diplôme"}
            placeholder={"Exemple : CAP Cuisine"}
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
      />
    </div>
  );
}
