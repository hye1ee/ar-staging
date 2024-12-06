// import { ChevronDown } from "lucide-react";
import { colors } from "@/utils/styles";
import React from "react";
import styled from "styled-components";

interface Props {
  label: string;
}

export default function ModelSelector(props: Props) {
  // const onModelSelect = (e: ChangeEvent<HTMLSelectElement>) => {
  //   props.onClick(e.target.value);
  // };

  return (
    <ModelSelectorWrapper>
      <ModelSelectorTitle
      // disabled={props.disabled}
      // onChange={onModelSelect}
      >
        <div>{`${props.label}.glb`}</div>
        {/* <option value="testcube">cube.glb</option>
        <option value="/src/assets/bunny.glb">Bunny.glb</option> */}
      </ModelSelectorTitle>
      {/* <ChevronDown color="white" /> */}
    </ModelSelectorWrapper>
  );
}

const ModelSelectorWrapper = styled.div`
  width: 180px;
  height: 40px;

  color: white;
  font-size: 13px;

  box-sizing: border-box;
  padding: 0px 12px;

  position: absolute;
  top: 15px;
  left: 70px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${colors.black};
  border-radius: 8px;
`;

const ModelSelectorTitle = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  overflow: hidden;
  background-color: transparent;

  color: white;
  outline: none;
  border: none;

  &:focus {
    outline: none;
  }
`;
