/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";
import Link, { LinkProps as NextLinkProps } from "next/link";

export type LinkProps = {
  noIcon?: boolean;
  noDecoration?: boolean;
  noActiveBg?: boolean;
} & NextLinkProps;

export default styled(Link, {
  shouldForwardProp: (prop) => !["noIcon", "noDecoration", "noActiveBg"].includes(prop),
})<LinkProps>`
  ${({ noDecoration }) => (noDecoration ? `text-decoration: none; background-image: none;` : "")}

  ${({ noActiveBg }) =>
    noActiveBg
      ? `&[href]:active {
      background-color: transparent;
  }`
      : ``}
  ${({ noIcon }) =>
    noIcon
      ? `::after {
        content: none;
      }`
      : ""}
`;
