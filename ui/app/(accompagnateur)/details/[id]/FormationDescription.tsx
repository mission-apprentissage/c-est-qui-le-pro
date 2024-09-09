"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import HtmlReactParser from "html-react-parser";
import TruncateMarkup from "react-truncate-markup";
import Card from "#/app/components/Card";
import { fr } from "@codegouvfr/react-dsfr";

export default function FormationDescription({
  description,
  title,
  children,
  childrenBox,
}: {
  description?: string;
  title: string;
  children?: React.ReactNode;
  childrenBox?: React.ReactNode;
}) {
  const [descriptionLine, setDescriptionLine] = useState(10);

  return (
    <>
      {description && (
        <Card type="details" title={title}>
          <Box
            style={{
              border: "1px solid #DDDDDD",
              padding: "1rem",
              paddingTop: "1.5rem",
              marginBottom: fr.spacing("5v"),
            }}
          >
            <TruncateMarkup
              lineHeight={24}
              lines={descriptionLine}
              tokenize={"words"}
              ellipsis={
                <>
                  {"..."}
                  <div style={{}}>
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
            {childrenBox}
          </Box>
          {children}
        </Card>
      )}
    </>
  );
}
