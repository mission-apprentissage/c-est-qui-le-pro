/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Box } from "#/app/components/MaterialUINext";

export const EtablissementContainerStyled = styled(Box)`
  & .tag {
    margin-bottom: 1rem;
  }

  & h5 {
    margin-bottom: 1rem;
    color: var(--blue-france-sun-113-625);
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

    & i {
      margin-right: 1rem;
    }
  }

  cursor: pointer;
`;
