import Markdown from "react-markdown";
import { ContainerLegal } from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("cgu");
  return (
    <ContainerLegal>
      <Title pageTitle="Conditions générales d'utilisation" />
      <Markdown>{markdown}</Markdown>
    </ContainerLegal>
  );
}
