"use client";
import { useEffect } from "react";
import { initVideoFunc } from "../func/main";

const CallArea = () => {
  useEffect(() => {
    initVideoFunc();
  }, []);

  return (
    <>
      <p>
        ID: <span id="my-id"></span>
      </p>
      <div>
        room name: <input id="room-name" type="text" />
        <button id="join">join</button>
        <button id="leave">leave</button>
      </div>
      <video id="local-video" width="400px" muted playsInline></video>
      <div id="button-area"></div>
      <div id="remote-media-area"></div>
    </>
  );
};
export default CallArea;
