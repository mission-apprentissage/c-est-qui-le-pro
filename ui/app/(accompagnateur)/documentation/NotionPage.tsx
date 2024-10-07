import "#/app/styles/notion.scss";
import NotionWrapper from "#/app/components/wrapper/NotionWrapper";
import NotionDoc from "#/app/components/NotionDoc";

export default function NotionPage({ pageId }: { pageId: string }) {
  return (
    <NotionWrapper pageId={pageId}>
      {(recordMap) => {
        const pageTitle = Object.values(recordMap.block).find(({ value }) => value.type === "page")?.value?.properties
          ?.title[0];
        return (
          <NotionDoc disableHeader={true} pageTitle={pageTitle} recordMap={recordMap} urlBasePath={"/documentation/"} />
        );
      }}
    </NotionWrapper>
  );
}
