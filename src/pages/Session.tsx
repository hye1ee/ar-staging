import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  House,
  Bug,
  Box,
  Move,
  CirclePlay,
  CirclePause,
  CircleStop,
} from "lucide-react";

import SessionProvider from "../webxr/SessionProvider";
import ThreeRenderer, { RenderMode, ModelMode } from "../webxr/ThreeRenderer";
import { ModelRenderer } from "../webxr/ModelRenderer";

import DebugLogger from "../components/DebugLogger";
import AlertLogger from "../components/AlertLogger";
import PerformanceLogger from "../components/PerformanceLogger";

export default function Session() {
  const [renderMode, setRenderMode] = useState<RenderMode>("hit");
  const [modelMode, setModelMode] = useState<ModelMode>("stop");

  const navigate = useNavigate();

  const switchRenderMode = (mode: RenderMode) => {
    setRenderMode(mode);
    ThreeRenderer.getInstance().switchRenderMode(mode);
    if (modelMode !== "stop") switchModelMode("stop"); // init the model mode
    AlertLogger.getInstance().alert(`Render mode has changed to ${mode}`);
  };

  const switchModelMode = (mode: ModelMode) => {
    setModelMode(mode);
    ThreeRenderer.getInstance().switchModelMode(mode);
    AlertLogger.getInstance().alert(`Animation mode has changed to ${mode}`);
  };

  useEffect(() => {
    const startARSession = async () => {
      if (!(await SessionProvider.getInstance().requestSession())) return false;
      const session = SessionProvider.getInstance().getSession();
      if (!session) return false;

      ThreeRenderer.getInstance().appendToDOM(
        document.getElementById("webgl-container") as HTMLDivElement
      );
      ThreeRenderer.getInstance().connectSession(session);
      ThreeRenderer.getInstance().startRendering();

      return true;
    };
    if (!startARSession()) navigate("/");

    // !important
    ThreeRenderer.getInstance().addRenderCallback(
      PerformanceLogger.getInstance().updateStats.bind(
        PerformanceLogger.getInstance()
      )
    );
    DebugLogger.getInstance().init();
    ModelRenderer.getInstance().loadModel("src/assets/bunny.glb");
  }, []);

  const toMainPage = () => {
    SessionProvider.getInstance().endSession();
    navigate("/");
  };

  return (
    <PageWrapper>
      <PerformanceLoggerContainer id="perform-log" />
      <AlertLoggerContainer id="alert-log" />
      <IconButton
        onClick={toMainPage}
        style={{ position: "absolute", top: "15px", left: "15px" }}
      >
        <House />
      </IconButton>

      <IconButton
        onClick={() => {
          DebugLogger.getInstance().toggleVisibility();
        }}
        style={{ position: "absolute", top: "15px", right: "15px" }}
      >
        <Bug />
        <DebugLoggingContainer id="debug-log" />
      </IconButton>
      <ToolBar
        style={{
          position: "absolute",
          top: "50%",
          left: "15px",
          transform: "translate(0, -50%)",
        }}
      >
        <IconButton
          onClick={() => switchRenderMode("hit")}
          style={{
            backgroundColor: renderMode === "hit" ? "#FF0C81" : "black",
          }}
        >
          <Move size={40} color={renderMode === "hit" ? "white" : "gray"} />
        </IconButton>
        <IconButton
          onClick={() => switchRenderMode("anchor")}
          style={{
            backgroundColor: renderMode === "anchor" ? "#FF0C81" : "black",
          }}
        >
          <Box size={40} color={renderMode === "anchor" ? "white" : "gray"} />
        </IconButton>
        {/* <IconButton onClick={toMainPage}>
          <Play color="#FF0C81" />
        </IconButton> */}
      </ToolBar>

      <ToolBar
        style={{
          position: "absolute",
          top: "50%",
          right: "15px",
          transform: "translate(0, -50%)",
        }}
      >
        <IconButton
          onClick={() => switchModelMode("play")}
          style={{
            backgroundColor: modelMode === "play" ? "#FF0C81" : "black",
          }}
        >
          <CirclePlay
            size={40}
            color={modelMode === "play" ? "white" : "gray"}
          />
        </IconButton>
        <IconButton
          onClick={() => switchModelMode("pause")}
          style={{
            backgroundColor: modelMode === "pause" ? "#FF0C81" : "black",
          }}
        >
          <CirclePause
            size={40}
            color={modelMode === "pause" ? "white" : "gray"}
          />
        </IconButton>
        <IconButton
          onClick={() => switchModelMode("stop")}
          style={{
            backgroundColor: modelMode === "stop" ? "#FF0C81" : "black",
          }}
        >
          <CircleStop
            size={40}
            color={modelMode === "stop" ? "white" : "gray"}
          />
        </IconButton>
      </ToolBar>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;

  position: relative;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: transparent;
  border: none;
`;

const PerformanceLoggerContainer = styled.div`
  width: fit-content;
  height: fit-content;

  position: absolute;
  left: 15px;
  top: 15px;
`;

const AlertLoggerContainer = styled.div`
  width: fit-content;
  height: fit-content;

  box-sizing: border-box;
  padding: 8px 16px;

  position: absolute;
  left: 50%;
  top: 15px;
  transform: translate(-50%, 0);
  border-radius: 12px;

  font-size: 13px;

  background-color: black;
  color: white;
  opacity: 0;

  transition: all 0.2s ease;
`;

const DebugLoggingContainer = styled.div`
  width: 300px;
  height: 150px;

  box-sizing: border-box;
  padding: 10px;

  position: absolute;
  top: 0px;
  right: 50px;
  border-radius: 8px;

  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  opacity: 0;
  overflow-y: auto;
`;

const ToolBar = styled.div`
  width: fit-content;
  height: fit-content;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  padding: 6px;

  background-color: black;
  border-radius: 12px;

  gap: 6px;
`;
