import Image from "next/image";
import { DiplomeType, FormationDomaine, FormationTag, FormationVoie } from "shared";
import { FrIconClassName, RiIconClassName, fr } from "@codegouvfr/react-dsfr";
import ArtworkSchoolSvg from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/buildings/school.svg";
import ContractSvg from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/document/contract.svg";
import AvatarSvg from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/avatar.svg";
import { CompaniePictogramme } from "../components/icon/CompaniePictogramme";
import Tag from "../components/Tag";

export const LIBELLE_PRESSION = {
  easy: "Favorable (taux de pression faible)",
  average: "Assez difficile (taux de pression modéré)",
  hard: "Très difficile (taux de pression élevé)",
};

export type FormationTagType = {
  tag: FormationTag;
  tagLibelle: string;
  libelle: string;
  libelleSmall: string;
  color: string;
  bgColor: string;
  icon: FrIconClassName | RiIconClassName;
  pictogramme?: () => JSX.Element;
};

export const FORMATION_TAG: FormationTagType[] = [
  {
    tag: FormationTag.POUR_TRAVAILLER_RAPIDEMENT,
    tagLibelle: "TAUX D'INSERTION FAVORABLE",
    libelleSmall: "Emploi",
    libelle: "Formations offrant de meilleures chances de trouver un emploi en fin d’études (taux d’insertion élevé)",
    color: fr.colors.decisions.text.default.success.default,
    bgColor: fr.colors.decisions.background.contrast.success.default,
    icon: "ri-community-line",
    pictogramme: () => <Image src={ContractSvg} width={"56"} height={"56"} alt={""} />,
  },

  {
    tag: FormationTag.FAIBLE_TAUX_PRESSION,
    tagLibelle: "TAUX DE PRESSION FAIBLE",
    libelleSmall: "Admission",
    libelle: "Formations offrant de meilleures chances d’être admis (taux de pression faible)",
    color: fr.colors.decisions.text.default.success.default,
    bgColor: fr.colors.decisions.background.contrast.success.default,
    icon: "ri-community-line",
    pictogramme: () => <Image src={AvatarSvg} width={"56"} height={"56"} alt={""} />,
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
      return <CompaniePictogramme />;
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

export const FORMATION_DIPLOME: {
  diplome: keyof typeof DiplomeType | null;
  libelle: string;
  pictogramme?: () => JSX.Element;
}[] = [
  { diplome: null, libelle: "CAP & BAC PRO" },
  {
    diplome: "CAP",
    libelle: "CAP",
    pictogramme: () => (
      <Tag style={{ margin: "0.5rem 0.5rem" }} variant="purple">
        2&nbsp;ans
      </Tag>
    ),
  },
  {
    diplome: "BAC_PRO",
    libelle: "BAC PRO",
    pictogramme: () => (
      <Tag style={{ margin: "0.5rem 0.5rem" }} variant="purple">
        3&nbsp;ans
      </Tag>
    ),
  },
];
