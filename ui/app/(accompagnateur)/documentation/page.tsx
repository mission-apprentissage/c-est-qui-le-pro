import "server-only";
import Container from "#/app/components/Container";
import NotionPage from "./NotionPage";

export const revalidate = 0;

export default function Page() {
  return (
    <Container maxWidth={"lg"}>
      <NotionPage pageId={"cbb52155b2bb43d1af3e28bd632d83a7"} />
    </Container>
  );
}
