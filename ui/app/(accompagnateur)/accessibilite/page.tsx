import Markdown from "react-markdown";
import { ContainerLegal } from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("accessibilite");
  return (
    <ContainerLegal>
      <Title pageTitle="Déclaration d’accessibilité" />
      <Markdown>{markdown}</Markdown>
    </ContainerLegal>
  );
}
