import Image from "next/image";
import { FormationDomaine, FormationTag, FormationVoie } from "shared";
import CalendarIcon from "#/app/components/icon/CalendarIcon";
import { FrCxArg, FrIconClassName, RiIconClassName, fr } from "@codegouvfr/react-dsfr";
import MoneyIcon from "../components/icon/MoneyIcon";
import ArtworkSchoolSvg from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/buildings/school.svg";
import { CompangiePictogramme } from "../components/icon/CompaniePictogramme";

export type FormationTagType = {
  tag: FormationTag;
  libelle: string;
  color: string;
  bgColor: string;
  icon: (() => JSX.Element) | FrCxArg;
};

export const LIBELLE_PRESSION = {
  easy: "Favorable (taux de pression faible)",
  average: "Assez difficile (taux de pression modéré)",
  hard: "Très difficile (taux de pression élevé)",
};

export const FORMATION_TAG: FormationTagType[] = [
  {
    tag: FormationTag.POUR_TRAVAILLER_RAPIDEMENT,
    libelle: "TAUX D'INSERTION FAVORABLE",
    color: fr.colors.decisions.text.default.success.default,
    bgColor: fr.colors.decisions.background.contrast.success.default,
    icon: MoneyIcon,
  },

  {
    tag: FormationTag.FAIBLE_TAUX_PRESSION,
    libelle: "TAUX DE PRESSION FAIBLE",
    color: fr.colors.decisions.text.default.success.default,
    bgColor: fr.colors.decisions.background.contrast.success.default,
    icon: CalendarIcon,
  },
];

export const FORMATION_DOMAINE: {
  domaine: FormationDomaine;
  isAll?: boolean;
  icon?: FrIconClassName | RiIconClassName;
}[] = [
  { domaine: FormationDomaine["tout"], isAll: true },
  { domaine: FormationDomaine["agriculture, animaux"], icon: "ri-seedling-line" },
  { domaine: FormationDomaine["armée, sécurité"], icon: "ri-medal-2-line" },
  { domaine: FormationDomaine["arts, culture, artisanat"], icon: "ri-palette-line" },
  { domaine: FormationDomaine["banque, assurances, immobilier"], icon: "ri-bank-card-2-line" },
  { domaine: FormationDomaine["commerce, marketing, vente"], icon: "ri-shopping-basket-2-line" },
  { domaine: FormationDomaine["construction, architecture, travaux publics"], icon: "ri-barricade-line" },
  { domaine: FormationDomaine["économie, droit, politique"], icon: "ri-auction-line" },
  { domaine: FormationDomaine["électricité, électronique, robotique"], icon: "ri-lightbulb-flash-line" },
  { domaine: FormationDomaine["environnement, énergies, propreté"], icon: "ri-water-flash-line" },
  { domaine: FormationDomaine["gestion des entreprises, comptabilité"], icon: "ri-calculator-line" },
  // Pas de formations dans le catalogue actuellement
  //{ domaine: FormationDomaine["histoire-géographie, psychologie, sociologie"] },
  { domaine: FormationDomaine["hôtellerie-restauration, tourisme"], icon: "ri-restaurant-line" },
  { domaine: FormationDomaine["information-communication, audiovisuel"], icon: "ri-vidicon-2-line" },
  { domaine: FormationDomaine["informatique, Internet"], icon: "ri-mac-line" },
  // Pas de formations dans le catalogue actuellement
  //{ domaine: FormationDomaine["lettres, langues, enseignement"] },
  { domaine: FormationDomaine["logistique, transport"], icon: "ri-truck-line" },
  { domaine: FormationDomaine["matières premières, fabrication, industries"], icon: "ri-contrast-drop-2-line" },
  { domaine: FormationDomaine["mécanique"], icon: "ri-car-line" },
  { domaine: FormationDomaine["santé, social, sport"], icon: "ri-hand-heart-line" },
  { domaine: FormationDomaine["sciences"], icon: "ri-microscope-line" },
];

export const FORMATION_VOIE: {
  voie: FormationVoie | null;
  icon?: FrIconClassName | RiIconClassName;
  pictogramme?: () => JSX.Element;
  libelle: string;
  libelleSmall: string;
}[] = [
  { voie: null, libelle: "Alternance & Scolaire", libelleSmall: "Alternance & Scolaire", icon: "ri-seedling-line" },
  {
    voie: FormationVoie.APPRENTISSAGE,
    libelle: "En alternance",
    libelleSmall: "En alternance",
    icon: "ri-community-line",
    pictogramme: () => {
      return <CompangiePictogramme />;
    },
  },
  {
    voie: FormationVoie.SCOLAIRE,
    libelle: "En voie scolaire (dite aussi formation initiale)",
    libelleSmall: "En scolaire",
    icon: "ri-community-line",
    pictogramme: () => {
      return <Image src={ArtworkSchoolSvg} width={"56"} height={"56"} alt={""} />;
    },
  },
];
