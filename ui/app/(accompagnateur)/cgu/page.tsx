import Markdown from "react-markdown";
import Container from "#/app/components/Container";
import Title from "../components/Title";
import { getMarkdown } from "#/common/markdown";

export default async function Page() {
  const markdown = await getMarkdown("cgu");
  return (
    <Container>
      <Title pageTitle="Conditions générales d'utilisation" />
      <Markdown>{markdown}</Markdown>
    </Container>
  );
}
