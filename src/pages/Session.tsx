import React, { useEffect } from "react";
import SessionProvider from "../webxr/SessionProvider";
import { useNavigate } from "react-router-dom";
import ThreeRenderer from "../webxr/ThreeRenderer";
import styled from "styled-components";
import { House, Bug, Box, Move, Play } from "lucide-react";
import DebugLogger from "../components/DebugLogger";
import { ModelRenderer } from "../webxr/ModelRenderer";

export default function Session() {
  const navigate = useNavigate();

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
    DebugLogger.getInstance().init();
    ModelRenderer.getInstance().loadModel("src/assets/bunny.glb");
  }, []);

  const toMainPage = () => {
    SessionProvider.getInstance().endSession();
    navigate("/");
  };

  return (
    <PageWrapper>
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
        <IconButton onClick={toMainPage}>
          <Move />
        </IconButton>
        <IconButton onClick={toMainPage}>
          <Box />
        </IconButton>
        <IconButton onClick={toMainPage}>
          <Play />
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
`;

const ToolBar = styled.div`
  width: fit-content;
  height: fit-content;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;
`;
