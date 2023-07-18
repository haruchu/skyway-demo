import {
  nowInSec,
  SkyWayAuthToken,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  uuidV4,
  LocalVideoStream,
  RoomPublication,
  LocalStream,
  P2PRoom,
  SfuRoom,
} from "@skyway-sdk/room";

const token = new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: "77b6f44d-df51-457e-89fa-53b73847245c",
      turn: true,
      actions: ["read"],
      channels: [
        {
          id: "*",
          name: "*",
          actions: ["write"],
          members: [
            {
              id: "*",
              name: "*",
              actions: ["write"],
              publication: {
                actions: ["write"],
              },
              subscription: {
                actions: ["write"],
              },
            },
          ],
          sfuBots: [
            {
              actions: ["write"],
              forwardings: [
                {
                  actions: ["write"],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}).encode("LJMJn+4oBxLtMxeSR1+FLIeNyon/e7MykpkSFF9X8e8=");

const initVideoFunc = async (roomId: string) => {
  (async () => {
    const localVideo = document.getElementById(
      "local-video"
    ) as HTMLVideoElement;
    const remoteVideos = document.getElementById(
      "remote-media-area"
    ) as HTMLVideoElement;
    const leaveButton = document.getElementById("leave") as HTMLButtonElement;

    const myId = document.getElementById("my-id") as HTMLElement;

    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();

    let room: SfuRoom | P2PRoom;

    // Render local stream
    localVideo.muted = true;
    localVideo.playsInline = true;
    video.attach(localVideo);
    await localVideo.play();

    const context = await SkyWayContext.Create(token, {
      log: { level: "warn", format: "object" },
    });

    room = await SkyWayRoom.FindOrCreate(context, {
      type: "p2p",
      name: roomId,
    });

    const member = await room.join();
    myId.textContent = member.id;


    const userVideo: { [index: string]: HTMLVideoElement } = {};

    member.onPublicationSubscribed.add(async ({ stream, subscription }) => {
      if (stream.contentType === "data") return;

      const publisherId = subscription.publication.publisher.id;
      if (!userVideo[publisherId]) {
        const newVideo = document.createElement("video");
        newVideo.playsInline = true;
        newVideo.autoplay = true;
        newVideo.setAttribute(
          "data-member-id",
          subscription.publication.publisher.id
        );

        remoteVideos.append(newVideo);
        userVideo[publisherId] = newVideo;
      }
      const newVideo = userVideo[publisherId];
      stream.attach(newVideo);

      if (subscription.contentType === "video" && room.type === "sfu") {
        newVideo.onclick = () => {
          if (subscription.preferredEncoding === "low") {
            subscription.changePreferredEncoding("high");
          } else {
            subscription.changePreferredEncoding("low");
          }
        };
      }
    });
    const subscribe = async (publication: RoomPublication<LocalStream>) => {
      if (publication.publisher.id === member.id) return;
      await member.subscribe(publication.id);
    };
    room.onStreamPublished.add((e) => subscribe(e.publication));
    room.publications.forEach(subscribe);

    await member.publish(audio);
    if (room.type === "sfu") {
      await member.publish(video, {
        encodings: [
          { maxBitrate: 10_000, id: "low" },
          { maxBitrate: 800_000, id: "high" },
        ],
      });
    } else {
      await member.publish(video);
    }
    const disposeVideoElement = (remoteVideo: HTMLVideoElement) => {
      const stream = remoteVideo.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();
    };

    room.onMemberLeft.add((e) => {
      if (e.member.id === member.id) return;

      const remoteVideo = remoteVideos.querySelector(
        `[data-member-id="${e.member.id}"]`
      ) as HTMLVideoElement;
      disposeVideoElement(remoteVideo);
    });

    member.onLeft.once(() => {
      Array.from(remoteVideos.children).forEach((element) => {
        disposeVideoElement(element as HTMLVideoElement);
      });
      room.dispose();
      //   room = undefined;
    });

    leaveButton.addEventListener("click", () => member.leave(), {
      once: true,
    });
  })();
};

const onShare = (roomId: string) => {
    (async () => {
      const context = await SkyWayContext.Create(token);
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
          stopTrackWhenDisabled: true,
        });
        await share.publish(stream);
  
        displayStream.getTracks()[0].addEventListener("ended", async () => {
          share.leave();
        });
      };
    })();
  };

export { initVideoFunc, onShare };
