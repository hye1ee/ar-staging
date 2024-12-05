import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import { indexedDbManager, sessionProvider } from "@/managers";
import styled from "styled-components";
import { isValidWsUrl } from "@/utils";
import { colors, fontBody } from "@/utils/styles";
import SectionContainer, { SectionItem } from "@/components/SectionContainer";

type SessionLabel = "Confirmed" | "Not Confirmed" | "Not Supported";
type SocketLabel = "Connected" | "Not Connected" | "Connection Failed";

export default function Main() {
  const [sessionLabel, setSessionLabel] =
    useState<SessionLabel>("Not Confirmed");
  const [socketLabel, setSocketLabel] = useState<SocketLabel>("Not Connected");
  const [sceneId, setSceneId] = useState<number | null>(null);

  const navigate = useNavigate();

  const [wsUrl, setWsUrl] = useState<{ ip: string; port: string }>({
    ip: "143.248.191.146",
    port: "8765",
  });
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [files, setFiles] = useState<number[]>(indexedDbManager.getFileIds());

  useEffect(() => {
    setFiles(indexedDbManager.getFileIds());
  }, []);

  const isSessionValid = async () => {
    setSessionLabel("Not Confirmed");
    await sessionProvider.isSessionAvailable().then((valid) => {
      if (valid) setSessionLabel("Confirmed");
      else setSessionLabel("Not Supported");
    });
  };

  const connectSocket = () => {
    const ws = new WebSocket(`ws://${wsUrl.ip}:${wsUrl.port}`);

    ws.onopen = () => {
      setSocketLabel("Connected");
      setSocket(ws);
    };
    ws.onmessage = (event) => {
      indexedDbManager.storeFile(event.data).then(() => {
        setFiles(indexedDbManager.getFileIds());
      });
    };
    ws.onerror = (error) => {
      console.log(error);
      setSocketLabel("Connection Failed");
    };
    ws.onclose = () => {
      setSocketLabel("Not Connected");
      setSocket(null);
    };
    setSocket(ws);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const toSessionPage = () => {
    navigate(`/session/${sceneId ?? 0}`);
  };

  return (
    <PageWrapper>
      <SectionWrapper>
        <img style={{ width: "100px" }} src="/icons/icon512.png" />
      </SectionWrapper>
      <SectionWrapper style={{ flex: 1.6 }}>
        <SectionContainer
          title="Session"
          description="Check the compatibility between the device and the session before entering the scene."
          label="Confirm"
          onClick={isSessionValid}
          status={{ active: sessionLabel === "Confirmed", label: sessionLabel }}
        ></SectionContainer>

        <SectionContainer
          title="Socket"
          disabled={!isValidWsUrl(wsUrl)}
          description="Connect the socket to add a scene from an external app."
          label={socketLabel === "Connected" ? "Disconnect" : "Connect"}
          onClick={
            socketLabel === "Connected" ? disconnectSocket : connectSocket
          }
          status={{ active: socketLabel === "Connected", label: socketLabel }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <SectionInput
              placeholder="IP Address"
              value={wsUrl.ip}
              onChange={(e) =>
                setWsUrl((prev) => ({ ...prev, ip: e.target.value }))
              }
            />
            <SectionInput
              placeholder="Port Number"
              value={wsUrl.port}
              onChange={(e) =>
                setWsUrl((prev) => ({ ...prev, port: e.target.value }))
              }
            />
          </div>
        </SectionContainer>
        <SectionContainer
          title="Scene"
          description="Click on a scene and then the Enter button to start the session. A maximum of 3 new scenes can be stored."
          label="Enter"
          disabled={sessionLabel !== "Confirmed"}
          onClick={toSessionPage}
        >
          <SectionScroller>
            <SectionItem
              label="testcube.glb"
              active={!sceneId}
              onClick={() => setSceneId(null)}
            />
            {files.map((fileId) => (
              <SectionItem
                label={`scene${fileId}.glb`}
                active={sceneId === fileId}
                onClick={() => {
                  setSceneId(fileId);
                }}
              />
            ))}
          </SectionScroller>
        </SectionContainer>
      </SectionWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;

  background-color: ${colors.black};

  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
`;

const SectionWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 20px;
`;

const SectionInput = styled.input`
  ${fontBody}

  box-sizing: border-box;
  padding: 10px 16px;
  border-radius: 8px;

  background-color: black;
  color: white;

  border: none;
  outline: none;
`;

const SectionScroller = styled.div`
  box-sizing: border-box;
  padding: 16px 16px;
  border-radius: 8px;

  background-color: black;
  overflow-x: scroll;

  display: flex;
  flex-direction: row;
  gap: 16px;
`;
