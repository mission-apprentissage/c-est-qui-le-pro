"use client";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";
import Link from "next/link";
import { Box, Container, Typography } from "./MaterialUINext";
import { isNil } from "lodash-es";
import { CardActionArea, CardActionAreaProps, CardProps as MUICardProps } from "@mui/material";
import { JSX } from "react";

export type CardProps = Omit<MUICardProps, "title"> & {
  title?: string | JSX.Element | null;
  link?: string | null;
  linkTarget?: string;
  selected?: boolean;
  actionProps?: CardActionAreaProps;
  type?: "details" | "formation";
};

function BaseCard({ title, children, className, ...props }: CardProps) {
  return (
    <Box className={className} {...props}>
      {title && (typeof title === "string" ? <Typography variant="h2">{title}</Typography> : title)}
      <Container maxWidth={false}>{children}</Container>
    </Box>
  );
}

export function Card({ title, link, linkTarget, style, children, className, actionProps, ...props }: CardProps) {
  if (link) {
    return (
      <CardActionArea
        {...actionProps}
        disableRipple
        className={className}
        style={style}
        onClick={(e) => {
          window.open(link, linkTarget);
          props.onClick && props.onClick(e as any);
        }}
      >
        <BaseCard {...props} title={title}>
          {children}
        </BaseCard>
      </CardActionArea>
    );
  }

  if (actionProps) {
    return (
      <CardActionArea {...actionProps} style={style} className={className}>
        <BaseCard {...props} title={title}>
          {children}
        </BaseCard>
      </CardActionArea>
    );
  }

  return (
    <BaseCard title={title} className={className} style={style} {...props}>
      {children}
    </BaseCard>
  );
}

export default styled(Card)<CardProps>`
  ${({ type }) => {
    switch (type) {
      case "details":
        return `
         & > .MuiContainer-root {
          padding: 0;
        }  

        h2 {
          margin-bottom: 2.5rem;
          font-size: 2.5rem;
        }
          `;

      case "formation":
        return `
            border: 1px solid #dddddd;
            border-radius: 10px;
            padding: 0;
            overflow: hidden;
    
            h2 {
              background-color: #f5f5fe;
              color: var(--blue-france-sun-113-625);
              padding: ${fr.spacing("3v")};
            }
    
            & .MuiContainer-root {
              padding: 0;
            }  
            `;
      default:
        return `
        border: 1px solid #dddddd;
        border-radius: 10px;
        padding: 0;
        overflow: hidden;

        h2 {
          background-color: #f5f5fe;
          color: var(--blue-france-sun-113-625);
          padding: ${fr.spacing("3v")};
        }

        & .MuiContainer-root {
          padding: ${fr.spacing("3v")};
        }`;
    }
  }};

  ${({ selected }) => {
    return !isNil(selected) && selected ? "background-color: var(--hover);" : "";
  }}

  & > .MuiCardActionArea-focusHighlight {
    display: none;
  }

  &.MuiButtonBase-root:hover {
    background-color: var(--hover);
  }

  &.MuiButtonBase-root {
    background-color: white;
  }
`;
