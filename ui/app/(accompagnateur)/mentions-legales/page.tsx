import Markdown from "react-markdown";
import { ContainerLegal } from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("mentions-legales");
  return (
    <ContainerLegal>
      <Title pageTitle="Mentions légales" />
      <Markdown>{markdown}</Markdown>
    </ContainerLegal>
  );
}
