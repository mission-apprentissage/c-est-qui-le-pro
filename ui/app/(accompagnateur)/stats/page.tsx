import "server-only";
import Container from "#/app/components/Container";
import NotionPage from "../components/NotionPage";

export const revalidate = 0;

export default function Page() {
  return (
    <Container maxWidth={"lg"}>
      <NotionPage pageId={"160d0d8ec0158098a83bfa1895d2c69e"} urlBasePath={"/stats/"} />
    </Container>
  );
}
