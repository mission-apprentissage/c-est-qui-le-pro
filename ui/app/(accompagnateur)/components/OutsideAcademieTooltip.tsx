/** @jsxImportSource @emotion/react */
import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/react";
import Button from "#/app/components/Button";
import { modalOutsideAcademie } from "./DialogOutsideAcademie";

export default function OutsideAcademieTooltip() {
  return (
    <Button
      priority="tertiary no outline"
      variant="blue-france"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // You need to create the DialogOutsideAcademie somewhere to be able to show it
        modalOutsideAcademie.open();
      }}
      css={css`
        cursor: help;
        border-radius: 0.688rem;
        padding: 0.5rem;
        & i {
          margin-right: 0.25rem;
        }
      `}
    >
      <i className={fr.cx("fr-icon-info-fill")} />
      En dehors de votre académie
    </Button>
  );
}
