import Markdown from "react-markdown";
import { ContainerLegal } from "#/app/components/Container";
import { getMarkdown } from "#/common/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
};

export default async function Page() {
  const markdown = await getMarkdown("cgu");
  return (
    <ContainerLegal>
      <Markdown>{markdown}</Markdown>
    </ContainerLegal>
  );
}
