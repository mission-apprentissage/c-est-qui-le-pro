import { title } from "#/app/(accompagnateur)/constants/constants";

export default function Title({ pageTitle }: { pageTitle?: string }) {
  const fullTitle = title + (pageTitle ? ` - ${pageTitle}` : "");
  return <title>{fullTitle}</title>;
}
