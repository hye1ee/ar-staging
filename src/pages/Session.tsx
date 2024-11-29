import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  // House,
  // Bug,
  Box,
  Move,
  CirclePlay,
  CirclePause,
  CircleStop,
  Film,
} from "lucide-react";

import { ModelMode, RenderMode } from "@/managers/types";
import { actionManager } from "@/managers";
import ModelSelector from "@/components/ModelSelector";
import {
  alertLogger,
  debugLogger,
  dimManager,
  performanceLogger,
} from "@/components";
// import DebugLogger from "@/components/DebugLogger";
import ZoomSlider from "@/components/ZoomSlider";

export default function Session() {
  const [renderMode, setRenderMode] = useState<RenderMode>("hit");
  const [modelMode, setModelMode] = useState<ModelMode>("stop");

  const touchRotation = useRef<number>();
  const [zoom, setZoom] = useState<number>(actionManager.getZoom());

  const [wsUrl, setWsUrl] = useState<string>("");
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const navigate = useNavigate();

  //---------------------------------
  // switch mode via buttons
  const switchRenderMode = (mode: RenderMode) => {
    actionManager.switchRenderMode(mode);
    setRenderMode(mode);
    if (modelMode !== "stop") switchModelMode("stop"); // init the model mode
  };

  const switchModelMode = (mode: ModelMode) => {
    actionManager.switchModelMode(mode);
    setModelMode(mode);
  };

  //---------------------------------
  // onClick event handlers
  const onMainClick = () => {
    actionManager.endSession();
    actionManager.endRendering();
    actionManager.endLogger();
    navigate("/");
  };

  const onModelClick = (model: "testcube" | string) => {
    if (model === "testcube") actionManager.loadCube();
    else actionManager.loadModel(model);
  };

  window.addEventListener("pointerdown", (e: PointerEvent) => {
    if (renderMode === "anchor") {
      touchRotation.current = e.clientX;
      window.addEventListener("pointermove", onPointerMove);
    }
  });

  const onPointerMove = (e: PointerEvent) => {
    if (touchRotation.current) {
      const delta = e.clientX - touchRotation.current;
      actionManager.rotateWorld(delta);
      touchRotation.current = e.clientX;
    }
  };

  window.addEventListener("pointerup", () => {
    if (renderMode === "anchor") {
      touchRotation.current = undefined;
      window.removeEventListener("pointermove", onPointerMove);
    }
  });

  const onZoomChange = (val: number) => {
    setZoom(val);
    actionManager.setZoom(val);
  };

  //---------------------------------

  useEffect(() => {
    const asyncWrapper = async () => {
      return actionManager.startSession();
    };
    if (!asyncWrapper()) navigate("/");

    // initialize managers which need to be connected with react elements
    dimManager.init();
    performanceLogger.init();
    alertLogger.init();
    debugLogger.init();

    // start the main session
    actionManager.startLogger();
    actionManager.startRendering();
  }, []);

  return (
    <PageWrapper>
      <Dim id="dim" />
      <DebugLoggingContainer id="debug-log" />
      {/* <PerformanceLoggerContainer id="perform-log" /> */}
      <AlertLoggerContainer id="alert-log" />
      <IconButton
        onClick={onMainClick}
        style={{ position: "absolute", top: "15px", left: "15px" }}
      >
        <img
          src="/icons/icon512.png"
          style={{ width: "100%", objectFit: "cover" }}
        />
      </IconButton>
      <ModelSelector disabled={renderMode !== "hit"} onClick={onModelClick} />

      <div style={{ position: "absolute", top: "60px", left: "15px" }}>
        <input
          type="text"
          id="ws-url"
          onChange={(event) => {
            setWsUrl(event.target.value);
          }}
        />
        <button
          type="submit"
          onClick={() => {
            if (wsUrl !== "") {
              const ws = new WebSocket("ws://" + wsUrl);
              console.log("Connecting to " + wsUrl);
              ws.onopen = () => {
                console.log("Connected to " + wsUrl);
                setWebsocket(ws);
              };
              ws.onmessage = (event) => {
                console.log(event.data);
                actionManager.loadModel(event.data);
              };
              ws.onerror = (error) => {
                console.error(error);
              };
              ws.onclose = () => {
                console.log("Disconnected from " + wsUrl);
                setWebsocket(null);
              };
              setWebsocket(ws);
            }
          }}
        >
          Connect
        </button>
        <button
          type="submit"
          disabled={websocket !== null}
          onClick={() => {
            if (websocket) {
              websocket.close();
            } else {
              console.error("No websocket connection to disconnect");
            }
          }}
        >
          Disconnect
        </button>
      </div>
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
          <Move size={24} color={renderMode === "hit" ? "white" : "gray"} />
        </IconButton>
        <IconButton
          onClick={() => switchRenderMode("anchor")}
          style={{
            backgroundColor: renderMode === "anchor" ? "#FF0C81" : "black",
          }}
        >
          <Box size={24} color={renderMode === "anchor" ? "white" : "gray"} />
        </IconButton>
        <IconButton
          onClick={() => switchRenderMode("film")}
          style={{
            backgroundColor: renderMode === "film" ? "#FF0C81" : "black",
          }}
        >
          <Film size={24} color={renderMode === "film" ? "white" : "gray"} />
        </IconButton>
      </ToolBar>

      {renderMode === "film" && (
        <ZoomSlider value={zoom} onChange={onZoomChange} />
      )}

      {renderMode === "film" && (
        <ToolBar
          style={{
            flexDirection: "row",
            position: "absolute",
            bottom: "15px",
            left: "50%",
            transform: "translate(-50%, 0)",
          }}
        >
          <IconButton
            onClick={() => switchModelMode("play")}
            style={{
              backgroundColor: modelMode === "play" ? "#FF0C81" : "black",
            }}
          >
            <CirclePlay
              size={24}
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
              size={24}
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
              size={24}
              color={modelMode === "stop" ? "white" : "gray"}
            />
          </IconButton>
        </ToolBar>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;

  position: relative;
`;

const Dim = styled.div`
  width: 100%;
  height: 100%;

  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: transparent;
  border: none;

  box-sizing: border-box;
`;

// const PerformanceLoggerContainer = styled.div`
//   width: fit-content;
//   height: fit-content;

//   position: absolute;
//   right: 15px;
//   top: 15px;
// `;

const AlertLoggerContainer = styled.div`
  width: fit-content;
  height: 40px;

  box-sizing: border-box;
  padding: 8px 16px;

  position: absolute;
  left: 50%;
  top: 15px;
  transform: translate(-50%, 0);
  border-radius: 12px;

  font-size: 13px;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: black;
  color: white;
  opacity: 0;

  z-index: 99;
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
  opacity: 1;
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
