"use client";
import React, { HTMLAttributes, useEffect, useState } from "react";
import { Box, TextField, Typography } from "#/app/components/MaterialUINext";
import Autocomplete from "@mui/material/Autocomplete";
import { CircularProgress } from "#/app/components/MaterialUINext";
import { fetchAddress } from "#/app/services/address";
import { useThrottle } from "@uidotdev/usehooks";
import Popper, { PopperProps } from "@mui/material/Popper";
import { fr } from "@codegouvfr/react-dsfr";
import Link from "../Link";
import { useGetAddress } from "#/app/(accompagnateur)/hooks/useGetAddress";

export const myPosition = "Autour de moi";

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
        Adresse non trouvée ?{" "}
        <Link target="_blank" href="https://adresse.data.gouv.fr/nous-contacter">
          Envoyer une alerte aux équipes.
        </Link>
      </Typography>
    </div>
  );
});

const CustomPopper = ({
  isMobile,
  isFocus,
  withMapPin,
  ...props
}: PopperProps & { isFocus: boolean; isMobile: boolean; withMapPin: boolean }) => {
  const { children, className, placement = "bottom" } = props;

  return isFocus && isMobile ? (
    <Box
      className={className}
      sx={{
        flex: " 1 1 auto",
        "& .MuiPaper-root": {
          height: "100%",
        },
        "& .MuiAutocomplete-listbox": {
          overflowY: "auto",
          height: "0px",
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
        marginTop: "28px !important",
        marginLeft: { md: "-18px !important" },
        "& .MuiPaper-root": {
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.2)",
        },
      }}
      style={{
        width: withMapPin ? "calc(100% - 60px)" : "calc(100%)",
      }}
    />
  );
};

export default function AddressField({
  formRef,
  form: {
    field: { onChange, onBlur, value, name, ref },
    ...formProps
  },
  InputProps,
  FieldProps,
  submitOnChange,
  error,
  displayError,
  isMobile,
  defaultValues,
  onOpen,
  onClose,
  noLabel,
  withMapPin,
  variant,
  setValue,
}: any) {
  const [isFocus, setIsFocus] = useState(false);

  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const [inputValue, setInputValue] = useState(value);

  const valueDebounce = useThrottle(inputValue, 300);

  const [options, setOptions] = useState([myPosition, value]);

  const { isLoading, data: optionsAddress } = useGetAddress(valueDebounce, {
    select: (data: Awaited<ReturnType<typeof fetchAddress>>) => {
      if (!data) {
        return [myPosition, ...(defaultValues ?? [])];
      }

      return [
        myPosition,
        ...data.features.map((f: any) => {
          const label =
            f.properties.type === "municipality"
              ? f.properties.label + " (" + f.properties.postcode + ")"
              : f.properties.label;
          return label;
        }),
      ];
    },
  });

  useEffect(() => {
    !isLoading && setOptions(optionsAddress);
  }, [isLoading, optionsAddress]);

  return (
    <div
      data-matomo-mask
      data-private
      style={{
        width: "100%",
        borderRadius: "50px",
        backgroundColor: "white",
        ...(isFocus && isMobile
          ? {
              position: "fixed",
              top: "0",
              left: 0,
              height: "100vh",
              zIndex: 9999,
              display: "flex",
              flexFlow: "column",
            }
          : {}),
      }}
    >
      <Autocomplete
        loading={isLoading}
        loadingText={<CircularProgress />}
        value={inputValue}
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
          setInputValue(v);
        }}
        onChange={(e, v) => {
          setValue(name, v, { shouldValidate: true });
          submitOnChange && formRef.current.requestSubmit();
          setIsFocus(false);
        }}
        onClose={() => {
          setIsFocus(false);
          onClose && onClose();
        }}
        filterOptions={(x) => x}
        options={options || []}
        freeSolo
        disablePortal
        sx={{
          "& .MuiOutlinedInput-root": {
            paddingRight: "10px!important",
          },
          ...(isFocus && isMobile
            ? {
                flex: " 0 1 auto",
                borderRadius: "5px",
                border: "2px solid var(--blue-france-sun-113-625-hover)",
                margin: "1rem",
              }
            : {}),
          ...{
            padding: { md: variant == "home" ? "24px" : "18px", xs: variant == "home" ? "18px" : "8px" },
            paddingLeft: { xs: "18px", md: withMapPin ? "50px" : "18px" },
            paddingRight: "0px",
          },
        }}
        PopperComponent={(props) => (
          <CustomPopper isFocus={isFocus} isMobile={isMobile} withMapPin={withMapPin} {...props} />
        )}
        ListboxComponent={ListboxComponent as React.ComponentType<React.HTMLAttributes<HTMLElement>>}
        renderOption={(props, option) => {
          const { key, ...rest } = props;

          return (
            <li
              key={option}
              {...rest}
              style={{ color: option === myPosition ? "var(--blue-france-sun-113-625-hover)" : "" }}
            >
              <i
                className={option === myPosition ? fr.cx("ri-map-pin-5-line") : fr.cx("ri-map-pin-line")}
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
            helperText={
              error && displayError ? (
                <>
                  <i className={fr.cx("ri-barricade-line", "fr-icon--sm")} style={{ marginRight: "0.25rem" }} />
                  {isMobile
                    ? "Nous n’avons pas reconnu cette adresse."
                    : "Nous n’avons pas reconnu cette adresse. Sélectionnez dans la liste une adresse valide"}
                </>
              ) : (
                ""
              )
            }
            InputLabelProps={{ shrink: true }}
            label={noLabel || (isMobile && isFocus) ? "" : "Ton adresse, ta ville"}
            placeholder={"Rechercher avec son adresse, sa ville"}
            className="addressField"
            onFocus={(event) => {
              event.target.select();
              setIsFocus(true);
            }}
            inputRef={ref}
            InputProps={{
              ...params.InputProps,
              type: "search",
              startAdornment:
                isMobile && isFocus ? (
                  <i
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFocus(false);
                      onClose && onClose();
                    }}
                    style={{ marginRight: "1rem" }}
                    className={fr.cx("ri-arrow-left-s-line")}
                  ></i>
                ) : withMapPin ? (
                  <i
                    style={{
                      marginRight: "1rem",
                      color: error
                        ? fr.colors.decisions.artwork.minor.redMarianne.default
                        : "var(--blue-france-sun-113-625-hover)",
                    }}
                    className={fr.cx("ri-map-pin-line", "fr-icon--lg")}
                  ></i>
                ) : (
                  <></>
                ),
              endAdornment: isLocationLoading ? (
                <CircularProgress />
              ) : (
                <>
                  {value && <div style={{ position: "absolute", right: "10px" }}>{params.InputProps.endAdornment}</div>}
                </>
              ),
              ...InputProps,
            }}
            variant={"standard"}
            {...FieldProps}
          />
        )}
      />
    </div>
  );
}
