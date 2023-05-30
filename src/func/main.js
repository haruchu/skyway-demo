import { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } from '@skyway-sdk/room';

const initVideoFunc = async (roomId) => {
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

  (async () => {
    const localVideo = document.getElementById("local-video");
    const remoteMediaArea = document.getElementById("remote-media-area");

    const myId = document.getElementById("my-id");
    const joinButton = document.getElementById("join");

    const { audio, video } =
      await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();
    video.attach(localVideo);
    await localVideo.play();

      if (roomId === "") return;
      const leaveButton = document.getElementById("leave");
      leaveButton.onclick = async () => {
        await me.leave();
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      };


      const context = await SkyWayContext.Create(token);
      const room = await SkyWayRoom.FindOrCreate(context, {
        type: "p2p",
        name: roomId,
      });
      const me = await room.join();
      console.log(room);

      myId.textContent = me.id;

      await me.publish(audio);
      await me.publish(video);

      const subscribeAndAttach = (publication) => {
        if (publication.publisher.id === me.id) return;

        (async () => {
          const { stream } = await me.subscribe(publication.id);

          let newMedia;
          switch (stream.track.kind) {
            case "video":
              newMedia = document.createElement("video");
              newMedia.playsInline = true;
              newMedia.autoplay = true;
              break;
            case "audio":
              newMedia = document.createElement("audio");
              newMedia.style.display = "none";
              newMedia.controls = true;
              newMedia.autoplay = true;
              break;
            default:
              return;
          }
          stream.attach(newMedia);
          remoteMediaArea.appendChild(newMedia);
        })();
      };

      room.publications.forEach(subscribeAndAttach);
      room.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
  })();
};

export {initVideoFunc};