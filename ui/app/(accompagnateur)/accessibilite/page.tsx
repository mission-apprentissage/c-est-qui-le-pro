import Markdown from "react-markdown";
import Container from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("accessibilite");
  return (
    <Container>
      <Title pageTitle="Déclaration d’accessibilité" />
      <Markdown>{markdown}</Markdown>
    </Container>
  );
}
