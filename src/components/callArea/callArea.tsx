"use client";
import { useEffect } from "react";
import { initVideoFunc } from "../../func/main";
import { useSearchParams } from "react-router-dom";


const CallArea = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    initVideoFunc(searchParams.get("roomId"));
  }, [searchParams]);

  return (
    <>
      <p>
        ID: <span id="my-id"></span>
      </p>
      <div>
        <div>
          room Id: {searchParams.get("roomId")}
        </div>
        <a id="leave" href="/">leave</a>
      </div>
      <video id="local-video" width="400px" muted playsInline></video>
      <div id="button-area"></div>
      <div id="remote-media-area"></div>
    </>
  );
};
export default CallArea;
