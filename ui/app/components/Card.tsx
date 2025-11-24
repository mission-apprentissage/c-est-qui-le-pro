"use client";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";
import Link from "#/app/components/Link";
import { Box, Container, Typography } from "./MaterialUINext";
import { isNil } from "lodash-es";
import { CardProps as MUICardProps, BoxProps } from "@mui/material";
import { JSX } from "react";

export type CardProps = Omit<MUICardProps, "title"> & {
  title?: string | JSX.Element | null;
  link?: string | null;
  linkTarget?: string;
  selected?: boolean;
  actionProps?: Omit<BoxProps, "children">;
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
      <Link href={link} target={linkTarget} noDecoration noIcon>
        <Box
          {...actionProps}
          className={className}
          style={style}
          sx={{
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "var(--hover)",
            },
            ...actionProps?.sx,
          }}
          onClick={(e) => {
            props.onClick && props.onClick(e as any);
          }}
        >
          <BaseCard {...props} title={title}>
            {children}
          </BaseCard>
        </Box>
      </Link>
    );
  }

  if (actionProps) {
    return (
      <Box
        {...actionProps}
        style={style}
        className={className}
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "var(--hover)",
          },
          backgroundColor: "white",
          ...actionProps?.sx,
        }}
      >
        <BaseCard {...props} title={title}>
          {children}
        </BaseCard>
      </Box>
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
`;
