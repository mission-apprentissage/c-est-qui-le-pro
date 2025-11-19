"use client";
import { useSessionStorage } from "usehooks-ts";
import { useEffect, useState } from "react";
import NewNameHeader from "./NewNameHeader";

export default function NewNameHeaderClient() {
  const [isClient, setIsClient] = useState(false);
  const [displayConstructionHeader, saveDisplayConstructionHeader] = useSessionStorage<boolean>(
    "displayConstructionHeader",
    true
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient && displayConstructionHeader && <NewNameHeader onClose={() => saveDisplayConstructionHeader(false)} />
  );
}
