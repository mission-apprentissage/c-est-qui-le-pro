/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";
import Link, { LinkProps as NextLinkProps } from "next/link";

export type LinkProps = {
  noIcon?: boolean;
  noDecoration?: boolean;
} & NextLinkProps;

export default styled(Link, {
  shouldForwardProp: (prop) => !["noIcon", "noDecoration"].includes(prop),
})<LinkProps>`
  ${({ noDecoration }) => (noDecoration ? `text-decoration: none; background-image: none;` : "")}

  ${({ noIcon }) =>
    noIcon
      ? `::after {
        content: none;
      }`
      : ""}
`;
