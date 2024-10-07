import "server-only";
import Container from "#/app/components/Container";
import NotionPage from "./NotionPage";

export const revalidate = 0;

export default function Page() {
  return (
    <Container maxWidth={"lg"}>
      <NotionPage pageId={"2c4d4e4c-969b-4a47-9fa3-dc849306b04c"} />
    </Container>
  );
}
