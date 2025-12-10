import { formation } from "#/app/queries/formation/query";
import { formations } from "#/app/queries/formations/query";
import { FormationResult } from "./page.client";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ latitude?: string; longitude?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { latitude, longitude } = await searchParams;

  try {
    const formationDetail = await formation(
      {
        id,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      },
      { signal: undefined }
    );
    const voie = formationDetail.formation.voie === "apprentissage" ? "apprentissage" : "voie scolaire";
    return {
      title: `${formationDetail.formation.libelle} - ${formationDetail.etablissement.libelle} - ${voie}`,
      description:
        `Retrouvez des informations détaillées sur la formation ${formationDetail.formation.libelle} dispensée ` +
        `dans l’établissement "${formationDetail.etablissement.libelle}" en ${voie} : contenu de la formation, conditions d’accès, devenir des élèves à l’issue de la formation et formations similaires.`,
    };
  } catch {
    return {
      title: "Détails de la formation",
      description: `Retrouvez des informations détaillées sur la formation  : contenu de la formation, conditions d’accès, devenir des élèves à l’issue de la formation et formations similaires.`,
    };
  }
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { latitude, longitude } = await searchParams;

  let initialFormationDetail = null;
  let initialFormationsAutreVoie = null;

  try {
    initialFormationDetail = await formation(
      {
        id,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      },
      { signal: undefined }
    );

    if (initialFormationDetail) {
      initialFormationsAutreVoie = await formations(
        {
          cfds: [initialFormationDetail.formation.cfd],
          uais: [initialFormationDetail.etablissement.uai],
          page: 1,

          items_par_page: 100,
        },
        { signal: undefined }
      );
    }
  } catch (_e) {
    // Laisse le client gérer l'erreur via notFound()
  }

  return (
    <>
      <FormationResult
        id={id}
        latitude={latitude}
        longitude={longitude}
        initialFormationDetail={initialFormationDetail}
        initialFormationsAutreVoie={initialFormationsAutreVoie}
      />
    </>
  );
}
