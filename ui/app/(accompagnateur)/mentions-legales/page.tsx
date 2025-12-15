import Markdown from "react-markdown";
import { ContainerLegal } from "#/app/components/Container";
import { getMarkdown } from "#/common/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
};

export default async function Page() {
  const markdown = await getMarkdown("mentions-legales");
  return (
    <ContainerLegal>
      <Markdown>{markdown}</Markdown>
    </ContainerLegal>
  );
}
