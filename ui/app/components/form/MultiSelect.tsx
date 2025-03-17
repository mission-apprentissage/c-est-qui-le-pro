/** @jsxImportSource @emotion/react */
import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useOnClickOutside } from "usehooks-ts";
import { Box } from "../MaterialUINext";
import { useCallback, useId, useRef, useState } from "react";
import Button from "../Button";
import {
  ActionBar,
  DropdownMenu,
  IconContainer,
  LabelText,
  MobileContainer,
  OptionsContainer,
  SelectContainer,
  SelectHeader,
  ShowMoreText,
  StyledOptionBox,
  ClearButtonText,
  EmptyIconSpace,
} from "./MultiSelect.styled";

type OptionProps = {
  icon?: never | FrIconClassName | RiIconClassName;
  option: string;
  value: string;
  checked: boolean;
  name: string;
};

type MultiSelectProps = {
  isMobile?: boolean;
  selected?: string[];
  value: string[];
  options: Omit<OptionProps, "name" | "checked">[];
  maxHeight?: string;
  width?: string;
  label: JSX.Element;
  name: string;
  onChange: (values: string[]) => void;
  onApply?: (values: string[]) => void;
};

type MultiSelectContainerProps = {
  maxHeight?: string;
  width?: string;
  label: JSX.Element;
  value: string[];
  name: string;
  apply: () => void;
  reset: () => void;
  onChangeOption: (option: Omit<OptionProps, "name" | "checked">, checked: boolean) => void;
  options: Omit<OptionProps, "name" | "checked">[];
};

function Option({
  checked,
  option,
  value,
  icon,
  name,
  onChange,
}: OptionProps & { onChange: (checked: boolean) => void }) {
  const id = useId();

  return (
    <StyledOptionBox
      key={option}
      checked={checked}
      onClick={(e) => {
        onChange(!checked);
      }}
    >
      <input onChange={() => {}} type="checkbox" checked={checked} id={`checkbox-${id}`} name={name} value={value} />
      <label htmlFor={`checkbox-${id}`} onClick={(e) => e.preventDefault()}>
        {option}
      </label>
      <IconContainer hasIcon={!!icon}>
        {icon ? <i className={fr.cx(icon, "fr-icon--lg")}></i> : <EmptyIconSpace />}
      </IconContainer>
    </StyledOptionBox>
  );
}

function MultiSelectContainer({
  label,
  maxHeight,
  width,
  reset,
  apply: originalApply,
  options,
  onChangeOption,
  name,
  value,
}: MultiSelectContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const apply = () => {
    setIsOpen(false);
    originalApply();
  };

  useOnClickOutside(ref, apply);

  return (
    <SelectContainer ref={ref} width={width}>
      <SelectHeader isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <LabelText variant="body4">{label}</LabelText>
        <Box>
          {isOpen ? <i className={fr.cx("ri-arrow-up-s-line")}></i> : <i className={fr.cx("ri-arrow-down-s-line")}></i>}
        </Box>
      </SelectHeader>
      <DropdownMenu isOpen={isOpen}>
        <OptionsContainer className={fr.cx("fr-checkbox-group")} maxHeight={maxHeight}>
          {options.map((option, index) => {
            return (
              <Option
                {...option}
                name={name}
                checked={!!value.find((o) => o === option.value)}
                onChange={(checked) => onChangeOption(option, checked)}
                key={index}
              />
            );
          })}
        </OptionsContainer>
        <ActionBar>
          <Box>
            <Button priority="tertiary no outline" variant="black" onClick={() => reset()}>
              <ClearButtonText variant="body2">Tout effacer</ClearButtonText>
            </Button>
          </Box>
          <Box>
            <Button variant="blue-france-hover" rounded onClick={apply}>
              Appliquer
            </Button>
          </Box>
        </ActionBar>
      </DropdownMenu>
    </SelectContainer>
  );
}

function MultiSelectContainerMobile({
  apply: originalApply,
  options,
  onChangeOption,
  name,
  value,
}: MultiSelectContainerProps) {
  const [maxVisible, setMaxVisible] = useState(7);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const apply = () => {
    setIsOpen(false);
    originalApply();
  };

  useOnClickOutside(ref, apply);

  return (
    <Box ref={ref}>
      <MobileContainer>
        <Box className={fr.cx("fr-checkbox-group")}>
          {options.slice(0, maxVisible).map((option, index) => {
            return (
              <Option
                {...option}
                name={name}
                checked={!!value.find((o) => o === option.value)}
                onChange={(checked) => onChangeOption(option, checked)}
                key={index}
              />
            );
          })}
        </Box>

        {options.length > maxVisible && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setMaxVisible(options.length);
            }}
          >
            <ShowMoreText variant="subtitle4">
              Afficher plus <i className={fr.cx("ri-arrow-down-line")}></i>
            </ShowMoreText>
          </a>
        )}
      </MobileContainer>
    </Box>
  );
}

export default function MultiSelect(props: MultiSelectProps) {
  const apply = () => {
    props.onApply && props.onApply(props.value);
  };

  const reset = () => {
    props.onChange([]);
  };

  const onChangeOption = useCallback(
    (option: Omit<OptionProps, "name" | "checked">, checked: boolean) => {
      props.onChange(checked ? [...props.value, option.value] : props.value.filter((o) => o !== option.value));
    },
    [props.value]
  );

  return props.isMobile ? (
    <MultiSelectContainerMobile
      name={props.name}
      value={props.value}
      label={props.label}
      width={props.width}
      options={props.options}
      maxHeight={props.maxHeight}
      reset={reset}
      apply={apply}
      onChangeOption={onChangeOption}
    ></MultiSelectContainerMobile>
  ) : (
    <MultiSelectContainer
      name={props.name}
      value={props.value}
      label={props.label}
      width={props.width}
      options={props.options}
      maxHeight={props.maxHeight}
      reset={reset}
      apply={apply}
      onChangeOption={onChangeOption}
    ></MultiSelectContainer>
  );
}
