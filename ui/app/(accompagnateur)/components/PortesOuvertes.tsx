import React from "react";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "shared";
import moment from "moment";
import "moment/locale/fr";

moment.locale("fr");

export function formatPortesOuvertes(etablissement: Etablissement) {
  if (!etablissement.JPODetails && !etablissement.JPODates) {
    return null;
  }

  // Only details
  if (!etablissement.JPODates || etablissement.JPODates.length === 0) {
    return {
      ended: false,
      str: `En savoir plus sur les journées portes ouvertes`,
    };
  }

  // Date
  // TODO : gérer les détails, les dates à trou, etc...
  let strPortesOuvertes = "";
  let ended = true;
  let first = true;
  const currentDate = new Date();

  for (const key in etablissement.JPODates) {
    const date = etablissement.JPODates[key];

    if (!date.from || !date.to) {
      continue;
    }

    if (date.from > currentDate || date.to > currentDate) {
      ended = false;

      // Period
      if (!moment(date.from).isSame(date.to, "day")) {
        // Day
        strPortesOuvertes +=
          (!first ? ", du " : "Portes ouvertes du ") +
          moment(date.from).format("DD MMMM YYYY") +
          " au " +
          moment(date.to).format("DD MMMM YYYY");
        first = false;
      } else {
        // Day
        strPortesOuvertes += (!first ? ", le " : "Portes ouvertes le ") + moment(date.from).format("DD MMMM YYYY");
        first = false;
      }
    }
  }

  return {
    ended,
    str: ended ? `Portes ouvertes déjà passées` : `${strPortesOuvertes}`,
  };
}

export function TagPortesOuvertes({ etablissement }: { etablissement: Etablissement }) {
  const strPortesOuvertes = formatPortesOuvertes(etablissement);
  if (!strPortesOuvertes) {
    return <></>;
  }

  return (
    <Tag bold={"500"} variant={strPortesOuvertes.ended ? "grey" : "button-white"}>
      {strPortesOuvertes.str}
    </Tag>
  );
}
