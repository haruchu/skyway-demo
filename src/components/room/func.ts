import {
  RoomSubscription,
  RemoteVideoStream,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  RoomPublication,
} from "@skyway-sdk/room";
import { tokenString, contextOptions } from "./const";

export const init = async (
  roomId: string,
  localVideoRef: React.RefObject<HTMLVideoElement>,
  audioContainerRef: React.RefObject<HTMLDivElement>,
  setVideoSubscriptions: React.Dispatch<
    React.SetStateAction<RoomSubscription<RemoteVideoStream>[]>
  >
) => {
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
