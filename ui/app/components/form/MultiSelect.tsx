/** @jsxImportSource @emotion/react */
import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useOnClickOutside } from "usehooks-ts";
import { Box, Typography } from "../MaterialUINext";
import { css } from "@emotion/react";
import { useCallback, useId, useRef, useState } from "react";
import Button from "../Button";

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
    <Box
      key={option}
      css={css`
        border: ${checked ? "1px solid var(--border-active-blue-france)" : "1px solid var(--border-default-grey)"};
        display: flex;
        flex-direction: row;
        padding-right: 1.5rem;
        padding-left: 3rem;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 500;
        line-height: 1.5rem;
        cursor: pointer;

        &:hover {
          background-color: var(--grey-1000-50-hover);
        }
      `}
      onClick={(e) => {
        onChange(!checked);
      }}
    >
      <input onChange={() => {}} type="checkbox" checked={checked} id={`checkbox-${id}`} name={name} value={value} />
      <label htmlFor={`checkbox-${id}`} onClick={(e) => e.preventDefault()}>
        {option}
      </label>
      <Box
        css={css`
          margin-left: auto;
          padding: 1rem;
          padding-left: 1.5rem;
          padding-right: 0rem;
          position: relative;
          &:before {
            content: "";
            position: absolute;
            left: 0;
            bottom: 5%;
            height: 90%;
            width: 1px;
            ${icon && "border-left: 1px solid #dddddd;"}
          }
        `}
      >
        {icon ? (
          <i className={fr.cx(icon, "fr-icon--lg")}></i>
        ) : (
          <Box
            css={css`
              height: 2rem;
            `}
          ></Box>
        )}
      </Box>
    </Box>
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
    <Box
      ref={ref}
      css={css`
        ${width && `width: ${width};`}
      `}
    >
      <Box
        css={css`
          display: flex;
          flex-direction: row;
          gap: 0.25rem;

          ${isOpen && `background-color: ${fr.colors.decisions.background.open.blueFrance.default};`}
          padding: 0.5rem;
          border: 1px solid #dddddd;

          &:hover {
            background-color: ${fr.colors.decisions.background.open.blueFrance.default};
            cursor: pointer;
          }
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Typography
          variant="body4"
          css={css`
            color: ${fr.colors.decisions.background.actionHigh.blueFrance.default};
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            flex-grow: 1;
          `}
        >
          {label}
        </Typography>
        <Box>
          {isOpen ? <i className={fr.cx("ri-arrow-up-s-line")}></i> : <i className={fr.cx("ri-arrow-down-s-line")}></i>}
        </Box>
      </Box>
      <Box
        css={css`
          box-shadow: 0px 6px 18px rgba(0, 0, 18, 0.16);
          width: 412px;
          position: absolute;
          z-index: 999;
          background-color: #ffffff;
          display: ${isOpen ? "block;" : "none;"};
          padding: 2rem;
        `}
      >
        <Box
          className={fr.cx("fr-checkbox-group")}
          css={css`
            ${maxHeight && `height: ${maxHeight}; overflow-y: scroll;`}
          `}
        >
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
        </Box>
        <Box
          css={css`
            border-top: 1px solid #dddddd;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            padding-top: 2rem;
          `}
        >
          <Box>
            <Button priority="tertiary no outline" variant="black" onClick={() => reset()}>
              <Typography
                variant="body2"
                css={css`
                  font-weight: 700;
                `}
              >
                Tout effacer
              </Typography>
            </Button>
          </Box>
          <Box>
            <Button variant="blue-france-hover" rounded onClick={apply}>
              Appliquer
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
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
      <Box
        css={css`
          width: 100%;
        `}
      >
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
            <Typography
              variant="subtitle4"
              css={css`
                margin-top: 1rem;
                color: var(--text-title-grey);
              `}
            >
              Afficher plus <i className={fr.cx("ri-arrow-down-line")}></i>
            </Typography>
          </a>
        )}
      </Box>
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
