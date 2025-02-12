"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import HtmlReactParser from "html-react-parser";
import TruncateMarkup from "react-truncate-markup";
import { fr } from "@codegouvfr/react-dsfr";

export default function FormationDescription({
  description,
  children,
}: {
  description?: string;
  children?: React.ReactNode;
}) {
  const [descriptionLine, setDescriptionLine] = useState(10);

  return (
    <>
      {description && (
        <Box
          style={{
            border: "1px solid #DDDDDD",
            padding: "1rem",
            paddingTop: "1.5rem",
          }}
        >
          <TruncateMarkup
            lineHeight={24}
            lines={descriptionLine}
            tokenize={"words"}
            ellipsis={
              <>
                {"..."}
                <div style={{ marginBottom: "1.5rem" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setDescriptionLine(1000);
                    }}
                  >
                    Voir plus
                  </a>
                </div>
              </>
            }
          >
            <div style={{ marginBottom: "-1rem" }}>{HtmlReactParser(description)}</div>
          </TruncateMarkup>
          {children}
        </Box>
      )}
    </>
  );
}
