import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import { indexedDbManager, sessionProvider } from "@/managers";
import styled from "styled-components";
import { downloadBlob, isValidWsUrl } from "@/utils";

export default function Main() {
  const [valid, setValid] = useState<boolean>();
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const [wsUrl, setWsUrl] = useState<{ ip: string; port: string }>({
    ip: "192.168.0.210",
    port: "8765",
  });
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [file, setFile] = useState<Blob | null>(null);

  useEffect(() => {
    if (valid == undefined) return;
    if (valid) setMsg("Availability confirmed. Please enter the session.");
    else
      setMsg("Session failed. Please try using a different browser or device.");
  }, [valid]);

  const isSessionValid = async () => {
    setValid(undefined);
    setMsg("Checking availability...");
    setValid(await sessionProvider.isSessionAvailable());
  };

  const toSessionPage = () => {
    navigate("/session");
  };

  return (
    <PageWrapper>
      Hey this is a main page
      <Button onClick={isSessionValid}>check availability</Button>
      <div>{msg}</div>
      <Button disabled={!valid} onClick={toSessionPage}>
        Enter to the AR
      </Button>
      <input
        placeholder="ip"
        value={wsUrl.ip}
        onChange={(e) => setWsUrl((prev) => ({ ...prev, ip: e.target.value }))}
      />
      <input
        placeholder="port"
        value={wsUrl.port}
        onChange={(e) =>
          setWsUrl((prev) => ({ ...prev, port: e.target.value }))
        }
      />
      <div>{`wsurl: ws://${wsUrl.ip}:${wsUrl.port}`}</div>
      <button
        type="submit"
        disabled={!isValidWsUrl(wsUrl)}
        onClick={() => {
          const ws = new WebSocket(`ws://${wsUrl.ip}:${wsUrl.port}`);
          console.log("socket", ws);

          ws.onopen = () => {
            setMsg("Connected to websocket");
            setSocket(ws);
          };
          ws.onmessage = (event) => {
            setFile(event.data);
          };
          ws.onerror = (error) => {
            console.log(error);
            setMsg("Failed to connect websocket, please check the url again");
          };
          ws.onclose = () => {
            setSocket(null);
          };
          setSocket(ws);
        }}
      >
        Connect
      </button>
      <button
        type="submit"
        disabled={!socket}
        onClick={() => {
          if (socket) {
            socket.close();
            setSocket(null);
          }
        }}
      >
        Disconnect
      </button>
      {file && (
        <div style={{ border: "1px solid black" }}>
          <div>File Received</div>
          <button
            onClick={() => {
              downloadBlob(file);
            }}
          >
            Download as a file
          </button>
          <button onClick={() => indexedDbManager.storeFile(file)}>
            Store in the db
          </button>
        </div>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;

  background-color: #efefef;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const Button = styled.button`
  background-color: #d6d1cc;
  border: none;

  cursor: pointer;
`;
