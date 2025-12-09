"use client";
import { useSessionStorage, useIsClient } from "usehooks-ts";
import NewNameHeader from "./NewNameHeader";

export default function NewNameHeaderClient() {
  const isClient = useIsClient();
  const [displayConstructionHeader, saveDisplayConstructionHeader] = useSessionStorage<boolean>(
    "displayConstructionHeader",
    true
  );

  return (
    isClient && displayConstructionHeader && <NewNameHeader onClose={() => saveDisplayConstructionHeader(false)} />
  );
}
