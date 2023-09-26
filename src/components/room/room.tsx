import {
  LocalVideoStream,
  RemoteVideoStream,
  RoomPublication,
  RoomSubscription,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
} from "@skyway-sdk/room";
import { FC, useEffect, useRef, useState } from "react";
import { contextOptions, tokenString } from "./const";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RemoteVideo, StyledVideo, VideoContent, Wrapper } from "./style";

const Room = () => {
  const navigate = useNavigate();
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [videoSubscriptions, setVideoSubscriptions] = useState<
    RoomSubscription<RemoteVideoStream>[]
  >([]);
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(searchParams.get("roomId") ?? "");

  const init = async () => {
    const context = await SkyWayContext.Create(tokenString, contextOptions);
    const room = await SkyWayRoom.FindOrCreate(context, {
      name: roomId,
      type: "p2p",
    });
    const me = await room.join();

    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();

    if (localVideoRef.current) {
      localVideoRef.current.muted = true;
      localVideoRef.current.playsInline = true;
      video.attach(localVideoRef.current);
      await localVideoRef.current.play();
    }

    await me.publish(audio);
    await me.publish(video);

    me.onPublicationSubscribed.add((e) => {
      if (e.stream.contentType === "audio") {
        const container = audioContainerRef.current!;
        const audio = document.createElement("audio");
        audio.srcObject = new MediaStream([e.stream.track]);
        audio.play();
        container.appendChild(audio);
        e.subscription.onCanceled.once(() => {
          container.removeChild(audio);
        });
      }
    });
    me.onSubscriptionListChanged.add(() => {
      setVideoSubscriptions(
        me.subscriptions.filter(
          (subscription): subscription is RoomSubscription<RemoteVideoStream> =>
            subscription.contentType === "video"
        )
      );
    });

    const subscribe = async (publication: RoomPublication) => {
      if (publication.publisher.id !== me.id) {
        await me.subscribe(publication);
      }
    };
    room.onStreamPublished.add(async (e) => {
      await subscribe(e.publication);
    });

    const leaveButton = document.getElementById("leave") as HTMLButtonElement;
    leaveButton.addEventListener("click", () => me.leave(), {
      once: true,
    });

    await Promise.all(room.publications.map(subscribe));
  };

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
    init();
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
