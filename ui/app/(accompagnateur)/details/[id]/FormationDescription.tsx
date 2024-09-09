"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import HtmlReactParser from "html-react-parser";
import TruncateMarkup from "react-truncate-markup";
import Card from "#/app/components/Card";

export default function FormationDescription({
  description,
  title,
  children,
}: {
  description: string;
  title: string;
  children?: React.ReactNode;
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
            }}
          >
            <TruncateMarkup
              lineHeight={24}
              lines={descriptionLine}
              tokenize={"words"}
              ellipsis={
                <>
                  {"..."}
                  <div style={{ marginTop: "-1.5rem" }}>
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
              <div>{HtmlReactParser(description)}</div>
            </TruncateMarkup>
            {children}
          </Box>
        </Card>
      )}
    </>
  );
}
