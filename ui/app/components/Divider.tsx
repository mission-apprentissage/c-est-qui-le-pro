/** @jsxImportSource @emotion/react */
import { fr } from "@codegouvfr/react-dsfr";
import { css, SerializedStyles } from "@emotion/react";
import Divider, { DividerProps } from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

export default function CustomDivider({
  margin,
  className,
  css: cssParent,
  ...props
}: DividerProps & { css?: SerializedStyles; margin?: string }) {
  const theme = useTheme();
  return (
    <Divider
      component="div"
      style={{
        ...props.style,
      }}
      className={className}
      css={css`
        margin-top: ${margin !== undefined ? margin : fr.spacing("5v")};
        margin-bottom: ${margin !== undefined ? margin : fr.spacing("5v")};
        ${theme.breakpoints.down("md")} {
          margin: 0;
          margin-top: ${margin !== undefined ? margin : "0"};
          margin-bottom: ${margin !== undefined ? margin : "0"};
        }
      `}
      {...props}
    />
  );
}
