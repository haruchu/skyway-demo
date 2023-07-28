"use client";
import { useEffect } from "react";
import { initVideoFunc, onShare } from "../../func/main2";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Wrapper } from "./style";

const CallArea = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    initVideoFunc(searchParams.get("roomId") ?? "");
    onShare(searchParams.get("roomId") ?? "");
  }, [searchParams]);

  return (
    <>
      <Wrapper id="member">
        <p>
          ID: <span id="my-id"></span>
        </p>
        <div>
          <div>room Id: {searchParams.get("roomId")}</div>
          <button id="leave" onClick={() => navigate("/")}>
            退出
          </button>
          <button id="share">共有</button>
        </div>
        <video id="local-video" width="400px" muted playsInline></video>
        <div id="button-area"></div>
        <div id="remote-media-area"></div>
      </Wrapper>
    </>
  );
};
export default CallArea;
