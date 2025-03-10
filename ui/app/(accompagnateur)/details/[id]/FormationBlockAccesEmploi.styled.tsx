import styled from "@emotion/styled";
import { fr } from "@codegouvfr/react-dsfr";
import Card from "#/app/components/Card";
import Tag from "#/app/components/Tag";
import { Box, Typography } from "#/app/components/MaterialUINext";

export const TransitionIcon = styled.i`
  &::before {
    --icon-size: 1rem;
  }
  margin-right: 0.25rem;
`;

export const MetierCard = styled(Card)`
  height: 100%;
  border-radius: 0;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

export const TransitionTag = styled(Tag)`
  padding: 0.375rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

export const MetierContainer = styled(Box)`
  display: flex;
  width: 100%;
  justify-content: flex-start;
`;

export const MarginBottomNegative = styled(Box)`
  margin-bottom: -28px; /** to have the divider closer **/
`;

export const SalaryCenterBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${fr.colors.decisions.text.title.blueFrance.default};
  margin-bottom: 3rem;
`;

export const SalaryValueTypography = styled(Typography)`
  font-size: 3rem;
  line-height: 3.5rem;
  font-weight: 700;
`;

export const SalaryDistributionBar = styled(Box)`
  background: #ededed;
  border-radius: 8px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SalaryDistributionInnerBar = styled(Box)`
  background-color: ${fr.colors.decisions.text.title.blueFrance.default};
  border-radius: 8px;
  height: 30px;
  width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const WhiteTypography = styled(Typography)`
  color: white;
`;

export const FlexRowBox = styled(Box)`
  display: flex;
  flex-direction: row;
`;

export const FlexCenterWidth40Box = styled(Box)`
  display: flex;
  width: 40%;
  justify-content: center;
`;

export const Width20Box = styled(Box)`
  width: 20%;
`;

export const FlexRightBlueBox = styled(Box)`
  display: flex;
  justify-content: right;
  color: ${fr.colors.decisions.text.title.blueFrance.default};
`;

export const SalaryPositionBox = styled(Box)<{ positionSalary: number }>`
  margin-left: ${(props) => props.positionSalary * 100}%;
  transform: translateX(-50%);

  position: relative;
  background-color: #1a9d7c;
  color: white;
  border-radius: 10px;
  padding: 10px 15px;
  display: inline-block;
  text-align: center;
  margin-bottom: 10px;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #1a9d7c;
  }
`;

export const FlexBox = styled(Box)`
  display: flex;
`;

export const FlexSpaceBetweenBox = styled(Box)`
  display: flex;
  justify-content: space-between;
`;

export const SalaryGradientBar = styled(Box)`
  background: linear-gradient(90deg, #0063cb 0%, #178b8a 57%, #28a959 99.5%);
  border-radius: 8px;
  height: 32px;
  margin-bottom: 1.25rem;
`;

export const FlexCenterColumnBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const BlueLink = styled.a`
  color: var(--blue-france-sun-113-625);
`;
