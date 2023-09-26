import {
  LocalVideoStream,
  RemoteVideoStream,
  RoomSubscription,
  SkyWayContext,
  SkyWayRoom,
} from "@skyway-sdk/room";
import { FC, useEffect, useRef, useState } from "react";
import { tokenString } from "./const";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RemoteVideo, StyledVideo, VideoContent, Wrapper } from "./style";
import { init } from "./func";

const Room = () => {
  const navigate = useNavigate();
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [videoSubscriptions, setVideoSubscriptions] = useState<
    RoomSubscription<RemoteVideoStream>[]
  >([]);
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(searchParams.get("roomId") ?? "");

  const onShare = (roomId: string) => {
    (async () => {
      const context = await SkyWayContext.Create(tokenString);
      const room = await SkyWayRoom.FindOrCreate(context, {
        type: "p2p",
        name: roomId,
      });
      const share = await room.join();
      const shareButton = document.getElementById("share") as HTMLButtonElement;
      shareButton.onclick = async () => {
        const displayStream = await navigator.mediaDevices.getDisplayMedia();
        const [displayTrack] = displayStream.getVideoTracks();
        const stream = new LocalVideoStream(displayTrack);
        await share.publish(stream);
        await new Promise((resolve) => setTimeout(resolve, 500));
        displayStream.getTracks()[0].addEventListener("ended", async () => {
          share.leave();
        });
      };
    })();
  };

  useEffect(() => {
    init(roomId, localVideoRef, audioContainerRef, setVideoSubscriptions);
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
      </div>
      <VideoContent>
        <StyledVideo ref={localVideoRef}></StyledVideo>
        {videoSubscriptions.map((subscription) => (
          <Video key={subscription.id} subscription={subscription} />
        ))}
      </VideoContent>
      <div ref={audioContainerRef} />
    </Wrapper>
  );
};

const Video: FC<{ subscription: RoomSubscription<RemoteVideoStream> }> = ({
  subscription,
}) => {
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
