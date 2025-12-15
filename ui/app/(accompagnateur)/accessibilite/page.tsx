import Markdown from "react-markdown";
import { ContainerLegal } from "#/app/components/Container";
import { getMarkdown } from "#/common/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité",
};

export default async function Page() {
  const markdown = await getMarkdown("accessibilite");
  return (
    <ContainerLegal>
      <Markdown>{markdown}</Markdown>
    </ContainerLegal>
  );
}
