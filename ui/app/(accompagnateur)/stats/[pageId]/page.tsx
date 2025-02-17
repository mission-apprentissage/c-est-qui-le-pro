import "server-only";
import Container from "#/app/components/Container";
import NotionPage from "../../components/NotionPage";

export const revalidate = 0;

export default function Page({ params }: { params: { pageId: string } }) {
  return (
    <Container maxWidth={"lg"}>
      <NotionPage pageId={params.pageId} urlBasePath={"/stats/"} />
    </Container>
  );
}
