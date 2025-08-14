import Markdown from "react-markdown";
import Container from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("mentions-legales");
  return (
    <Container>
      <Title pageTitle="Mentions légales" />
      <Markdown>{markdown}</Markdown>
    </Container>
  );
}
