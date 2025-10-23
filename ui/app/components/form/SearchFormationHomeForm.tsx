"use client";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid } from "#/app/components/MaterialUINext";
import { Control, Controller, FieldErrors, UseFormSetFocus, UseFormSetValue } from "react-hook-form";
import { Nullable } from "#/app/utils/types";
import { FormSearchParams } from "./FormSearchParams";
import AddressField, { myPosition } from "./AddressField";
import Button from "../Button";
import { SearchFormationFormData, schema } from "./SearchFormationForm";
import { Theme } from "@mui/material";
import useSearchHistory from "#/app/(accompagnateur)/hooks/useSearchHistory";
import FormationField from "./FormationField";
import { RefObject, useEffect, useMemo, useState } from "react";
import { uniq } from "lodash-es";
import { useFormationsSearch } from "#/app/(accompagnateur)/context/FormationsSearchContext";
import {
  DesktopSubmitBox,
  FieldStack,
  FormationSubmitBox,
  FormContainer,
  MobileCloseButtonContainer,
  OverlayContainer,
  OverlayInner,
  MobileSubmitContainer,
  SearchGridContainer,
  SubmitStyled,
} from "./SearchFormationHomeForm.styled";
import { fr } from "@codegouvfr/react-dsfr";
import { FilterIcon } from "./SearchFormationFiltersForm.styled";
import { ErrorBox } from "#/app/(accompagnateur)/page.styled";

function SubmitButton({ isFocusMobile }: { isFocusMobile?: boolean }) {
  return (
    <SubmitStyled type={"submit"} isFocusMobile={isFocusMobile}>
      {"Explorer la carte"} <FilterIcon className={fr.cx("ri-search-line")}></FilterIcon>
    </SubmitStyled>
  );
}

function SearchFormationHomeFormElements({
  control,
  errors,
  formRef,
  setValue,
  withFormation,
  isDownSm,
  isBordered,
  setIsFocus,
  isFocus,
  isHomeSearch,
  setFocus,
}: {
  control: Control<Nullable<SearchFormationFormData>, any>;
  errors: FieldErrors<Nullable<SearchFormationFormData>>;
  formRef: RefObject<HTMLFormElement | null>;
  setValue: UseFormSetValue<Nullable<SearchFormationFormData>>;
  withFormation: boolean;
  isDownSm: boolean;
  isBordered: boolean;
  setIsFocus: (isFocus: boolean) => void;
  isFocus: boolean;
  isHomeSearch: boolean;
  setFocus: UseFormSetFocus<SearchFormationFormData>;
}) {
  const { params } = useFormationsSearch();
  const { history, push: pushHistory } = useSearchHistory();
  const addressHistory = useMemo(
    () => uniq(history.map(({ address }) => address).filter((a) => a !== myPosition)),
    [history]
  );
  const formationHistory = useMemo(() => uniq(history.map(({ recherche }) => recherche).filter((f) => f)), [history]);

  useEffect(() => {
    if (params?.address) {
      setValue("address", params?.address, { shouldValidate: true });
    }
  }, [setValue, params?.address]);

  return (
    <>
      <FormContainer>
        {errors?.address && isHomeSearch ? (
          <ErrorBox isHomeSearch={isHomeSearch} isDownSm={isDownSm}>
            <i className={fr.cx("ri-barricade-line", "fr-icon--sm")} style={{ marginRight: "0.25rem" }} />
            {isDownSm
              ? "Nous n’avons pas reconnu cette adresse."
              : "Nous n’avons pas reconnu cette adresse. Sélectionnez dans la liste une adresse valide"}
          </ErrorBox>
        ) : (
          ""
        )}

        <SearchGridContainer
          container
          columnSpacing={!withFormation ? { xs: 0 } : { xs: 0, md: 4 }}
          rowSpacing={withFormation ? { xs: 2, md: 4 } : { xs: 0 }}
          isBordered={!(isDownSm && isFocus) && isBordered}
          withFormation={withFormation}
        >
          <Grid item xs={!withFormation ? 12 : 12} md={!withFormation ? 12 : 5}>
            <FieldStack
              direction="row"
              spacing={2}
              isBordered={isBordered}
              isRounded={isHomeSearch && !(isDownSm && isFocus)}
            >
              <Controller
                name="address"
                control={control}
                render={(form) => (
                  <AddressField
                    isMobile={isDownSm}
                    InputProps={{
                      disableUnderline: true,
                    }}
                    error={errors?.address}
                    displayError={!isHomeSearch || (isHomeSearch && isDownSm && isFocus)}
                    form={form}
                    formRef={formRef}
                    submitOnChange={!withFormation || !isDownSm}
                    defaultValues={addressHistory}
                    onOpen={() => setIsFocus(true)}
                    onClose={() => !withFormation && isDownSm && setIsFocus(false)}
                    noLabel={true}
                    withMapPin={isHomeSearch}
                    variant={isHomeSearch ? "home" : "search"}
                    setValue={setValue}
                  />
                )}
              />
              {!isDownSm && !withFormation && (
                <DesktopSubmitBox>
                  <SubmitButton />
                </DesktopSubmitBox>
              )}
            </FieldStack>
          </Grid>

          {withFormation && (
            <Grid item xs={12} md={4}>
              <FieldStack direction="row" spacing={2}>
                <Controller
                  name="recherche"
                  control={control}
                  render={(form) => (
                    <FormationField
                      submitOnChange={!isDownSm}
                      bordered={isBordered && withFormation}
                      sx={{
                        padding: { md: "18px", xs: isHomeSearch ? "18px" : "8px" },
                        paddingLeft: { xs: "18px", md: "18px" },
                        paddingRight: "0px",
                      }}
                      isMobile={isDownSm}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      error={errors?.recherche}
                      form={form}
                      formRef={formRef}
                      onOpen={() => setIsFocus(true)}
                      defaultValues={formationHistory}
                      noLabel={!isHomeSearch}
                    />
                  )}
                />
              </FieldStack>
            </Grid>
          )}
          {withFormation && !isDownSm && (
            <Grid item md={3} xs={4}>
              <FormationSubmitBox>
                <SubmitButton />
              </FormationSubmitBox>
            </Grid>
          )}
        </SearchGridContainer>
      </FormContainer>

      {isFocus && isDownSm && (
        <MobileSubmitContainer>
          <div></div>
          <SubmitButton isFocusMobile />
        </MobileSubmitContainer>
      )}
    </>
  );
}

export default function SearchFormationHomeForm({
  url,
  defaultValues,
  bordered,
  withFormation = false,
  isHomeSearch = false,
}: {
  url: string;
  defaultValues: Nullable<SearchFormationFormData>;
  bordered?: boolean;
  withFormation?: boolean;
  isHomeSearch?: boolean;
}) {
  const [isFocus, setIsFocus] = useState(false);
  const [isBordered, setIsBordered] = useState(bordered || false);
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { history, push: pushHistory } = useSearchHistory();

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
    <OverlayContainer isFocus={isFocus && isDownSm}>
      <OverlayInner isFocus={isFocus && isDownSm}>
        {isFocus && isDownSm && (
          <MobileCloseButtonContainer>
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
          </MobileCloseButtonContainer>
        )}
        <FormSearchParams
          onSubmit={(data) => {
            setIsFocus(false);
            data.address && pushHistory(data);
          }}
          url={url}
          defaultValues={defaultValues}
          schema={schema}
          dynamicValues={["domaines", "tag", "voie", "diplome"]}
        >
          {({ control, errors, formRef, setValue, setFocus }) => (
            <SearchFormationHomeFormElements
              isHomeSearch={isHomeSearch}
              setIsFocus={setIsFocus}
              isFocus={isFocus}
              isBordered={isBordered}
              isDownSm={isDownSm}
              withFormation={withFormation}
              control={control}
              errors={errors}
              formRef={formRef}
              setValue={setValue}
              setFocus={setFocus}
            />
          )}
        </FormSearchParams>
      </OverlayInner>
    </OverlayContainer>
  );
}
