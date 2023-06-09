"use client";
import { useEffect, useState } from "react";
import { initVideoFunc } from "../../func/main";
import { useSearchParams } from "react-router-dom";
import { ShareVideo, Wrapper } from "./style";

const CallArea = () => {
  const [searchParams] = useSearchParams();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    initVideoFunc(searchParams.get("roomId"));
  }, [searchParams]);

  const onShare = async () => {
    const mediaStreamConstraints = {
      video: true,
    };

    const shareVideo = document.getElementById(
      "share-video"
    ) as HTMLVideoElement;
    setIsSharing(true);

    function gotLocalMediaStream(mediaStream: MediaProvider) {
      // const localStream = mediaStream;
      if (shareVideo === null) return;
      shareVideo.srcObject = mediaStream;
    }

    const localVideoStream = await navigator.mediaDevices.getDisplayMedia(
      mediaStreamConstraints
    );
    gotLocalMediaStream(localVideoStream);
    localVideoStream.getTracks()[0].addEventListener("ended", () => {
      // ここで処理を記述
      setIsSharing(false);
    });
  };

  return (
    <>
      <Wrapper isSharing={isSharing}>
        <p>
          ID: <span id="my-id"></span>
        </p>
        <div>
          <div>room Id: {searchParams.get("roomId")}</div>
          <a id="leave" href="/">
            leave
          </a>
          <button id="share" onClick={onShare}>
            share
          </button>
        </div>
        <video id="local-video" width="400px" muted playsInline></video>
        <div id="button-area"></div>
        <div id="remote-media-area"></div>
      </Wrapper>
      <ShareVideo
        id="share-video"
        autoPlay
        muted
        playsInline
        isSharing={isSharing}
      ></ShareVideo>
    </>
  );
};
export default CallArea;
