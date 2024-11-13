import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation
import SessionProvider from "../webxr/SessionProvider";
import styled from "styled-components";

export default function Main() {
  const [valid, setValid] = useState<boolean>();
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (valid == undefined) return;
    if (valid) setMsg("Availability confirmed. Please enter the session.");
    else
      setMsg("Session failed. Please try using a different browser or device.");
  }, [valid]);

  const isSessionValid = async () => {
    setValid(undefined);
    setMsg("Checking availability...");
    setValid(await SessionProvider.getInstance().isSessionAvailable());
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
