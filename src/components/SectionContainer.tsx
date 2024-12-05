import { colors, fontBody, fontLabel } from "@/utils/styles";
import { Shapes } from "lucide-react";
import React, { PropsWithChildren } from "react";
import styled from "styled-components";

interface SectionContainerProps {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  status?: {
    active: boolean;
    label: string;
  };
}

export default function SectionContainer(
  props: PropsWithChildren<SectionContainerProps>
) {
  return (
    <SectionContainerWrapper>
      <SectionHeaderWrapper>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <SectionTitle>{props.title}</SectionTitle>
            {props.status && (
              <SectionStatus active={props.status?.active ?? false}>
                {props.status.label}
              </SectionStatus>
            )}
          </div>
          <SectionDescription>{props.description}</SectionDescription>
        </div>

        <SectionButton
          style={{ color: props.disabled ? colors.gray : colors.white }}
          onClick={props.onClick}
          disabled={props.disabled}
        >
          {props.label}
        </SectionButton>
      </SectionHeaderWrapper>
      {props.children}
    </SectionContainerWrapper>
  );
}

const SectionContainerWrapper = styled.div`
  width: 85%;
  height: fit-content;

  position: relative;

  box-sizing: border-box;
  padding: 18px 24px;
  border-radius: 10px;

  background-color: ${colors.darkgray};
  color: white;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
`;

const SectionHeaderWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
  gap: 12px;
`;

const SectionButton = styled.button`
  flex: 0 0 auto;
  width: 130px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background-color: ${colors.black};
  ${fontBody}

  cursor: pointer;

  &:active {
    background-color: ${colors.gray};
  }
  transition: all 0.3s;

  outline: none;
  border: none;
`;

const SectionTitle = styled.div`
  font-size: 17px;
  font-weight: 600;
`;

const SectionStatus = styled.div<{ active: boolean }>`
  width: fit-content;
  height: fit-content;

  padding: 3px 8px;
  border-radius: 8px;

  ${fontLabel}

  background-color: ${(props) => (props.active ? colors.pink : colors.gray)};
  opacity: 80%;
`;

const SectionDescription = styled.div`
  ${fontBody}
`;

interface SectionItemProps {
  label: string;
  onClick: () => void;
  active: boolean;
}

export const SectionItem = (props: SectionItemProps) => {
  return (
    <SectionItemWrapper active={props.active} onClick={props.onClick}>
      <div
        style={{
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: props.active ? colors.pink : colors.black,
          borderRadius: "20px",
        }}
      >
        <Shapes size={20} />
      </div>
      <div>{props.label}</div>
    </SectionItemWrapper>
  );
};
const SectionItemWrapper = styled.div<{ active: boolean }>`
  flex: 0 0 auto;
  width: 160px;
  height: 80px;

  box-sizing: border-box;
  padding: 8px 12px 10px 12px;

  border-radius: 4px;

  display: flex;
  flex-direction: column;
  align-content: flex-start;
  justify-content: space-between;

  background-color: ${colors.darkgray};

  ${(props) => props.active && `border: 1px solid ${colors.pink};`}
`;
