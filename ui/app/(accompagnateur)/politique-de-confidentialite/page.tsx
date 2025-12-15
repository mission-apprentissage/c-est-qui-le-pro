import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContainerLegal } from "#/app/components/Container";
import { getMarkdown } from "#/common/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default async function Page() {
  const markdown = await getMarkdown("politique-de-confidentialite");
  return (
    <ContainerLegal>
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </ContainerLegal>
  );
}
