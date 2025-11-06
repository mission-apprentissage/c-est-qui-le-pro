/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Box } from "#/app/components/MaterialUINext";

export const EtablissementContainerStyled = styled(Box)`
  padding: 24px 24px;
  font-family: "Marianne", arial, sans-serif;

  & .tag {
    margin-bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  & h5 {
    margin-bottom: 1rem;
    color: var(--blue-france-sun-113-625);
  }

  & .outside-academie {
    margin-bottom: 1rem;
    text-align: center;
  }

  & .info {
    font-size: 0.875rem;
    line-height: 1.5rem;
    font-weight: 700;
    color: var(--blue-france-sun-113-625);

    & > div {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    & div:has(i) {
      margin-right: 1rem;
    }
  }

  & .info p {
    font-size: 0.875rem;
    line-height: 1.5rem;
    font-weight: 700;
    color: var(--blue-france-sun-113-625);
  }

  cursor: pointer;
`;
