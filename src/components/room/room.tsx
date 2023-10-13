import { RemoteVideoStream, RoomSubscription } from "@skyway-sdk/room";
import { FC, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LocalVideo, RemoteVideo, VideoContent, Wrapper } from "./style";
import { init, onShare } from "./func";

const Room = () => {
  const navigate = useNavigate();
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoToggleRef = useRef<HTMLButtonElement>(null);
  const [videoSubscriptions, setVideoSubscriptions] = useState<
    RoomSubscription<RemoteVideoStream>[]
  >([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(searchParams.get("roomId") ?? "");

  useEffect(() => {
    init(
      roomId,
      localVideoRef,
      audioContainerRef,
      videoToggleRef,
      setVideoSubscriptions,
      (value: boolean) => setIsVideoEnabled(value)
    );
  }, []);

  return (
    <Wrapper>
      <div>
        <div>room Id: {roomId}</div>
        <button id="leave" onClick={() => navigate("/")}>
          退出
        </button>
        <button id="share" onClick={() => onShare(roomId)}>
          共有
        </button>
        <button ref={videoToggleRef}>
          {isVideoEnabled ? "画面オフ" : "画面オン"}
        </button>
      </div>
      <VideoContent memberCount={videoSubscriptions.length + 1}>
        <LocalVideo ref={localVideoRef} isVideoEnabled={isVideoEnabled} />
        {videoSubscriptions.map((subscription) => (
          <Video key={subscription.id} subscription={subscription} />
        ))}
      </VideoContent>
      <div ref={audioContainerRef} />
    </Wrapper>
  );
};

const Video: FC<{
  subscription: RoomSubscription<RemoteVideoStream>;
}> = ({ subscription }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isLarge, setLarge] = useState(false);

  useEffect(() => {
    ref.current!.srcObject = new MediaStream([subscription.stream!.track]);
  }, [ref.current]);

  return (
    <RemoteVideo
      muted
      autoPlay
      playsInline
      ref={ref}
      isLarge={isLarge}
      onClick={() => setLarge(!isLarge)}
    />
  );
};

export default Room;
