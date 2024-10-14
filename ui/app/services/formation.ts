import { FormationDomaine, FormationTag } from "shared";
import CalendarIcon from "#/app/components/icon/CalendarIcon";
import { FrCxArg, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import MoneyIcon from "../components/icon/MoneyIcon";

export type FormationTagType = {
  tag: FormationTag;
  libelle: string;
  color: string;
  bgColor: string;
  icon: (() => JSX.Element) | FrCxArg;
};
export const FORMATION_TAG: FormationTagType[] = [
  {
    tag: FormationTag.POUR_TRAVAILLER_RAPIDEMENT,
    libelle: "POUR TRAVAILLER RAPIDEMENT",
    color: "#18753c",
    bgColor: "var(--success-975-75)",
    icon: MoneyIcon,
  },

  {
    tag: FormationTag.FAIBLE_TAUX_PRESSION,
    libelle: "TAUX DE PRESSION FAIBLE",
    color: "var(--info-425-625)",
    bgColor: "var(--info-975-75)",
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
