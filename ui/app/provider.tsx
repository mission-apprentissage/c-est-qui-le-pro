"use client";

import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import RouterUpdaterProvider from "./(accompagnateur)/context/RouterUpdaterContext";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <RouterUpdaterProvider>{children}</RouterUpdaterProvider>
    </QueryClientProvider>
  );
}

export default Providers;
