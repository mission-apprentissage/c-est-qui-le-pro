/** @jsxImportSource @emotion/react */
import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useOnClickOutside } from "usehooks-ts";
import { Box } from "../MaterialUINext";
import { RefObject, useCallback, useId, useRef, useState } from "react";
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
  DescriptionContainer,
  DescriptionContainerMobile,
  StyledOptionLabel,
} from "./MultiSelect.styled";

type OptionProps = {
  icon?: never | FrIconClassName | RiIconClassName;
  pictogramme?: () => JSX.Element;
  option: string;
  value: string;
  checked: boolean;
  name: string;
  withSeparator?: boolean;
  paddingText?: string;
};

type MultiSelectCommonProps = {
  maxHeight?: string;
  width?: string;
  widthDropdown?: string;
  label: JSX.Element;
  name: string;
  description?: string;
  options: Omit<OptionProps, "name" | "checked">[];
};

type MultiSelectProps = {
  isMobile?: boolean;
  selected?: string[];
  value: string[];
  onChange: (values: string[]) => void;
  onApply?: (values: string[]) => void;
} & MultiSelectCommonProps;

type MultiSelectContainerProps = {
  value: string[];
  apply: () => void;
  reset: () => void;
  onChangeOption: (option: Omit<OptionProps, "name" | "checked">, checked: boolean) => void;
} & MultiSelectCommonProps;

function Option({
  checked,
  option,
  value,
  icon,
  pictogramme: Pictogramme,
  name,
  onChange,
  withSeparator = true,
  paddingText,
}: OptionProps & { onChange: (checked: boolean) => void }) {
  const id = useId();

  return (
    <StyledOptionBox
      key={option}
      checked={checked}
      hasPictogramme={!!Pictogramme}
      onClick={(e) => {
        onChange(!checked);
      }}
    >
      <input onChange={() => {}} type="checkbox" checked={checked} id={`checkbox-${id}`} name={name} value={value} />
      <StyledOptionLabel paddingText={paddingText} htmlFor={`checkbox-${id}`} onClick={(e) => e.preventDefault()}>
        {option}
      </StyledOptionLabel>
      <IconContainer withSeparator={withSeparator} hasPictogramme={!!Pictogramme} hasIcon={!!icon}>
        {icon && <i className={fr.cx(icon, "fr-icon--lg")}></i>}
        {Pictogramme && <Pictogramme />}
      </IconContainer>
    </StyledOptionBox>
  );
}

function MultiSelectContainer({
  label,
  maxHeight,
  width,
  widthDropdown,
  reset,
  apply: originalApply,
  options,
  onChangeOption,
  name,
  value,
  description,
}: MultiSelectContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const apply = () => {
    setIsOpen(false);
    originalApply();
  };

  useOnClickOutside(ref as RefObject<HTMLElement>, () => {
    isOpen && apply();
  });

  return (
    <SelectContainer ref={ref} width={width}>
      <SelectHeader hasValue={value && value.length > 0} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <LabelText variant="body4">{label}</LabelText>
        {isOpen ? <i className={fr.cx("ri-arrow-up-s-line")}></i> : <i className={fr.cx("ri-arrow-down-s-line")}></i>}
      </SelectHeader>
      <DropdownMenu isOpen={isOpen} widthDropdown={widthDropdown}>
        {description && <DescriptionContainer>{description}</DescriptionContainer>}
        <OptionsContainer className={fr.cx("fr-checkbox-group")} maxHeight={maxHeight} hasDescription={!!description}>
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
  description,
}: MultiSelectContainerProps) {
  const [maxVisible, setMaxVisible] = useState(7);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const apply = () => {
    setIsOpen(false);
    originalApply();
  };

  return (
    <Box ref={ref}>
      <MobileContainer>
        {description && <DescriptionContainerMobile>{description}</DescriptionContainerMobile>}

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

  const { value, onChange } = props;
  const onChangeOption = useCallback(
    (option: Omit<OptionProps, "name" | "checked">, checked: boolean) => {
      onChange(checked ? [...value, option.value] : value.filter((o) => o !== option.value));
    },
    [value, onChange]
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
      description={props.description}
    ></MultiSelectContainerMobile>
  ) : (
    <MultiSelectContainer
      name={props.name}
      value={props.value}
      label={props.label}
      width={props.width}
      widthDropdown={props.widthDropdown}
      options={props.options}
      maxHeight={props.maxHeight}
      reset={reset}
      apply={apply}
      onChangeOption={onChangeOption}
      description={props.description}
    ></MultiSelectContainer>
  );
}
