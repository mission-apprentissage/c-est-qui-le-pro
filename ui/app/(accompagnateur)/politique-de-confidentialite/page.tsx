import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContainerLegal } from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("politique-de-confidentialite");
  return (
    <ContainerLegal>
      <Title pageTitle="Politique de confidentialité" />
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </ContainerLegal>
  );
}
