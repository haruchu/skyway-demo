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
import { StyledVideo, VideoContent, Wrapper } from "./style";

const Room = () => {
  const navigate = useNavigate();
  const audioContainer = useRef<HTMLDivElement>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const [videoSubscriptions, setVideoSubscriptions] = useState<
    RoomSubscription<RemoteVideoStream>[]
  >([]);
  const [searchParams] = useSearchParams();
  const [roomName, setRoomName] = useState(searchParams.get("roomId") ?? "");

  const main = async () => {
    const context = await SkyWayContext.Create(tokenString, contextOptions);
    const room = await SkyWayRoom.FindOrCreate(context, {
      name: roomName,
      type: "p2p",
    });
    const member = await room.join();

    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();

    if (localVideo.current) {
      localVideo.current.muted = true;
      localVideo.current.playsInline = true;
      video.attach(localVideo.current);
      await localVideo.current.play();
    }

    await member.publish(audio);
    await member.publish(video, {
      encodings: [
        { id: "low", maxBitrate: 10_000 },
        { id: "high", maxBitrate: 800_000 },
      ],
    });

    member.onPublicationSubscribed.add((e) => {
      if (e.stream.contentType === "audio") {
        const container = audioContainer.current!;
        const audio = document.createElement("audio");
        audio.srcObject = new MediaStream([e.stream.track]);
        audio.play();
        container.appendChild(audio);
        e.subscription.onCanceled.once(() => {
          container.removeChild(audio);
        });
      }
    });
    member.onSubscriptionListChanged.add(() => {
      setVideoSubscriptions(
        member.subscriptions.filter(
          (subscription): subscription is RoomSubscription<RemoteVideoStream> =>
            subscription.contentType === "video"
        )
      );
    });

    const subscribe = async (publication: RoomPublication) => {
      if (publication.publisher.id !== member.id) {
        if (publication.contentType === "video") {
          await member.subscribe(publication);
        } else {
          await member.subscribe(publication);
        }
      }
    };
    room.onStreamPublished.add(async (e) => {
      await subscribe(e.publication);
    });

    const leaveButton = document.getElementById("leave") as HTMLButtonElement;
    leaveButton.addEventListener("click", () => member.leave(), {
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
        const stream = new LocalVideoStream(displayTrack, {
          height: 100,
          width: 800,
          stopTrackWhenDisabled: true,
        });
        await share.publish(stream);
        await new Promise((resolve) => setTimeout(resolve, 500));

        displayStream.getTracks()[0].addEventListener("ended", async () => {
          share.leave();
        });
      };
    })();
  };

  useEffect(() => {
    setRoomName(searchParams.get("roomId") ?? "");
    main();
  }, []);

  return (
    <Wrapper>
      <div>
        <div>room Id: {roomName}</div>
        <button id="leave" onClick={() => navigate("/")}>
          退出
        </button>
        <button id="share" onClick={() => onShare(roomName)}>
          共有
        </button>
      </div>
      <VideoContent>
        <StyledVideo ref={localVideo}></StyledVideo>
        {videoSubscriptions.map((subscription) => (
          <Video key={subscription.id} subscription={subscription} />
        ))}
      </VideoContent>
      <div ref={audioContainer} />
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
    <StyledVideo
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
