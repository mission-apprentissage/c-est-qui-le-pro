// We recreate the component to fix a bug with sticky header
import React, { memo, forwardRef, type CSSProperties, type ReactNode, JSX } from "react";
import { assert } from "tsafe/assert";
import { symToStr } from "tsafe/symToStr";
import type { Equals } from "tsafe";
import { overwriteReadonlyProp } from "tsafe/lab/overwriteReadonlyProp";
import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import Button, { ButtonProps } from "@codegouvfr/react-dsfr/Button";
import { createComponentI18nApi } from "@codegouvfr/react-dsfr/i18n";
import { useIsClient } from "usehooks-ts";
import { createPortal } from "react-dom";

function disableScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  window.onscroll = function () {
    window.scrollTo(scrollLeft, scrollTop);
  };
}

function enableScroll() {
  window.onscroll = function () {};
}

export function PortalClient({ component }: { component: JSX.Element }) {
  const isClient = useIsClient();

  return isClient ? createPortal(component, document.body) : null;
}

export type ModalActionAreaButtonProps = ButtonProps & {
  /** Default: true */
  doClosesModal?: boolean;
};

export type ModalProps = {
  className?: string;
  /** Default: "medium" */
  size?: "small" | "medium" | "large";
  title: ReactNode;
  children: ReactNode;
  /** Default: true */
  concealingBackdrop?: boolean;
  topAnchor?: boolean;
  iconId?: FrIconClassName | RiIconClassName;
  buttons?: [ModalActionAreaButtonProps, ...ModalActionAreaButtonProps[]] | ModalActionAreaButtonProps;
  style?: CSSProperties;
  close?: () => void;
};

const Modal = memo(
  forwardRef<HTMLDialogElement, ModalProps & { id: string }>((props, ref) => {
    const {
      className,
      id,
      title,
      children,
      concealingBackdrop = true,
      topAnchor = false,
      iconId,
      buttons: buttons_props,
      size = "medium",
      style,
      close,
      ..._rest
    } = props;

    assert<Equals<keyof typeof _rest, never>>();

    const buttons =
      buttons_props === undefined ? undefined : buttons_props instanceof Array ? buttons_props : [buttons_props];

    const { t } = useTranslation();
    const titleId = `fr-modal-title-${id}`;
    return (
      <dialog
        aria-labelledby={titleId}
        id={id}
        className={fr.cx("fr-modal", topAnchor && "fr-modal--top") + ` ${className ? className : ""}`}
        style={style}
        ref={ref}
        data-fr-concealing-backdrop={concealingBackdrop}
        onClick={(e) => {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            close && close();
          }
        }}
      >
        <div className={fr.cx("fr-container", "fr-container--fluid", "fr-container-md")}>
          <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
            <div
              className={(() => {
                switch (size) {
                  case "large":
                    return fr.cx("fr-col-12", "fr-col-md-10", "fr-col-lg-8");
                  case "small":
                    return fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4");
                  case "medium":
                    return fr.cx("fr-col-12", "fr-col-md-8", "fr-col-lg-6");
                }
              })()}
            >
              <div className={fr.cx("fr-modal__body")}>
                <div className={fr.cx("fr-modal__header")}>
                  <button
                    className={fr.cx("fr-btn--close", "fr-btn")}
                    onClick={close}
                    title={t("close")}
                    aria-controls={id}
                    type="button"
                  >
                    {t("close")}
                  </button>
                </div>
                <div className={fr.cx("fr-modal__content")}>
                  <h1 id={titleId} className={fr.cx("fr-modal__title")}>
                    {iconId !== undefined && <span className={fr.cx(iconId, "fr-fi--lg")} aria-hidden={true} />}
                    {title}
                  </h1>
                  {children}
                </div>
                {buttons !== undefined && (
                  <div className="fr-modal__footer">
                    <ul
                      className={fr.cx(
                        "fr-btns-group",
                        "fr-btns-group--right",
                        "fr-btns-group--inline-reverse",
                        "fr-btns-group--inline-lg",
                        "fr-btns-group--icon-left"
                      )}
                    >
                      {[...buttons].reverse().map(({ doClosesModal = true, ...buttonProps }, i) => (
                        <li key={i}>
                          <Button
                            {...buttonProps}
                            priority={buttonProps.priority ?? (i === 0 ? "primary" : "secondary")}
                            {...(!doClosesModal
                              ? {}
                              : "linkProps" in buttonProps
                              ? {
                                  linkProps: {
                                    ...buttonProps.linkProps,
                                    "aria-controls": id,
                                  } as any,
                                }
                              : {
                                  nativeButtonProps: {
                                    ...buttonProps.nativeButtonProps,
                                    "aria-controls": id,
                                  } as any,
                                })}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </dialog>
    );
  })
);

Modal.displayName = symToStr({ Modal });

const { useTranslation, addModalTranslations } = createComponentI18nApi({
  componentName: symToStr({ Modal }),
  frMessages: {
    close: "Fermer",
  },
});

addModalTranslations({
  lang: "en",
  messages: {
    close: "Close",
  },
});

addModalTranslations({
  lang: "es",
  messages: {
    /* spell-checker: disable */
    close: "Cerrar",
    /* spell-checker: enable */
  },
});

export { addModalTranslations };

/** @see <https://components.react-dsfr.codegouv.studio/?path=/docs/components-modal> */
export function createModal(params: { isOpenedByDefault: boolean; id: string }): {
  buttonProps: {
    /** Only for analytics, feel free to overwrite */
    id: string;
    "aria-controls": string;
    "data-fr-opened": boolean;
  };
  Component: (props: ModalProps) => JSX.Element;
  close: () => void;
  open: () => void;
  isOpenedByDefault: boolean;
  id: string;
} {
  const { isOpenedByDefault, id } = params;

  const buttonProps = {
    id: `${id}-control-button`,
    "aria-controls": id,
    "data-fr-opened": isOpenedByDefault,
  };

  const hiddenControlButtonId = `${id}-hidden-control-button`;

  function Component(props: ModalProps) {
    return (
      <>
        <Button
          nativeButtonProps={{
            ...buttonProps,
            id: hiddenControlButtonId,
            type: "button",
            tabIndex: -1,
            "aria-hidden": true,
          }}
          className={fr.cx("fr-hidden")}
        >
          {" "}
        </Button>
        <Modal {...props} close={close} id={id} />
      </>
    );
  }

  Component.displayName = `${id}-modal`;

  overwriteReadonlyProp(Component as any, "name", Component.displayName);

  function open() {
    const modalElement = document.getElementById(id);
    modalElement?.classList.add("fr-modal--opened");
    disableScroll();
  }

  function close() {
    const modalElement = document.getElementById(id);
    modalElement?.classList.remove("fr-modal--opened");
    enableScroll();
  }

  return {
    Component,
    buttonProps,
    open,
    close,
    isOpenedByDefault,
    id,
  };
}
