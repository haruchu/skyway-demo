"use client";
import { useEffect } from "react";
import { initVideoFunc, onShare } from "../../func/main2";
import { useSearchParams } from "react-router-dom";
import { Wrapper } from "./style";

const CallArea = () => {
  const [searchParams] = useSearchParams();

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
          <a id="leave" href="/">
            leave
          </a>
          <button id="share">share</button>
        </div>
        <video id="local-video" width="400px" muted playsInline></video>
        <div id="button-area"></div>
        <div id="remote-media-area"></div>
      </Wrapper>
    </>
  );
};
export default CallArea;
