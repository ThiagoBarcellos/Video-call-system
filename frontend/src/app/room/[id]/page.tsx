"use client";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { SocketContext } from "@/contexts/SocketContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

interface IAnswer {
  sender: string;
  description: RTCSessionDescriptionInit;
}

interface ICandidates {
  sender: string;
  candidate: RTCIceCandidate;
}

interface IDataStream {
  id: string;
  stream: MediaStream;
}

export default function Room({ params }: { params: { id: string } }) {
  const { socket } = useContext(SocketContext);
  const localStream = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [videoMediaStream, setVideoMediaStream] = useState<MediaStream | null>(
    null
  );
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const [remoteStreams, setRemoteStreams] = useState<IDataStream[]>([]);
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    socket?.on("connect", async () => {
      socket?.emit("subscribe", {
        roomId: params.id,
        socketId: socket.id,
      });
      await initCamera();
    });

    socket?.on("new user", (data) => {
      createPeerConnection(data.socketId, false);
      socket.emit("newUserStart", {
        to: data.socketId,
        sender: socket.id,
      });
    });

    socket?.on("newUserStart", (data) => {
      createPeerConnection(data.sender, true);
    });

    socket?.on("sdp", (data) => handleAnswer(data));

    socket?.on("ice candidates", (data) => handleIceCandidates(data));
  }, [socket]);

  const handleIceCandidates = async (data: ICandidates) => {
    const peerConnection = peerConnections.current[data.sender];
    if (data.candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const handleAnswer = async (data: IAnswer) => {
    const peerConnection = peerConnections.current[data.sender];
    if (data.description.type == "offer") {
      await peerConnection.setRemoteDescription(data.description);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket?.emit("sdp", {
        to: data.sender,
        sender: socket?.id,
        description: peerConnection.localDescription,
      });
    } else if (data.description.type == "answer") {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.description)
      );
    }
  };

  const createPeerConnection = async (
    socketId: string,
    createOffer: boolean
  ) => {
    const config = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };

    const peer = new RTCPeerConnection(config);
    peerConnections.current[socketId] = peer;
    const peerConnection = peerConnections.current[socketId];

    if (videoMediaStream) {
      videoMediaStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, videoMediaStream);
      });
    } else {
      const video = await initCamera(true);
      video?.getTracks().forEach((track) => {
        peerConnection.addTrack(track, video);
      });
    }

    if (createOffer) {
      const peerConnection = peerConnections.current[socketId];

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket?.emit("sdp", {
        to: socketId,
        sender: socket?.id,
        description: peerConnection.localDescription,
      });
    }

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      const dataStream: IDataStream = {
        id: socketId,
        stream: remoteStream,
      };

      setRemoteStreams((prevState: IDataStream[]) => {
        if (!prevState.some((stream) => stream.id === socketId)) {
          return [...prevState, dataStream];
        }
        return prevState;
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("ice candidates", {
          to: socketId,
          sender: socket?.id,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onsignalingstatechange = (event) => {
      switch (peerConnection.signalingState) {
        case "closed":
          setRemoteStreams((prevState) =>
            prevState.filter((stream) => stream.id !== socketId)
          );

          break;
      }
    };
    peerConnection.onconnectionstatechange = (event) => {
      switch (peerConnection.connectionState) {
        case "disconnected":
          setRemoteStreams((prevState) =>
            prevState.filter((stream) => stream.id !== socketId)
          );
          break;
        case "failed":
          setRemoteStreams((prevState) =>
            prevState.filter((stream) => stream.id !== socketId)
          );
          break;
        case "closed":
          setRemoteStreams((prevState) =>
            prevState.filter((stream) => stream.id !== socketId)
          );
          break;
      }
    };
  };

  const logout = () => {
    videoMediaStream?.getTracks().forEach((track) => {
      track.stop();
    });

    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.close();
    });

    socket?.disconnect();
    router.push("/");
  };

  const initCamera = async (remote?: boolean) => {
    const video = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
      },
    });
    
    if(remote){
      return video;
    } else {
      setVideoMediaStream(video);
      if (localStream.current) {
        localStream.current.srcObject = video;
      }
    }
  };

  return (
    <div className="h-screen">
      <Header />
      <div className="flex h-[75%] ">
        <div className="md:w-[80%] w-full h-full m-3 ">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-8 h-full">
            <div className="bg-gray-950 w-full rounded-md h-full p-2 relative ">
              <video
                className="h-full w-full mirror-mode"
                autoPlay
                playsInline
                ref={localStream}
              />
              <span className="absolute bottom-3">lorem ipsum</span>
            </div>

            {remoteStreams.map((stream, index) => {
              return (
                <div
                  className="bg-gray-950 w-full rounded-md h-full p-2 relative "
                  key={index}
                >
                  <video
                    className="h-full w-full"
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video && video.srcObject != stream.stream)
                        video.srcObject = stream.stream;
                    }}
                  />
                  <span className="absolute bottom-3">lorem ipsum</span>
                </div>
              );
            })}
          </div>
        </div>
        <Chat roomId={params.id} />
      </div>
      <Footer
        videoMediaStream={videoMediaStream!}
        peerConnections={peerConnections}
        localStream={localStream}
        logout={logout}
      />
    </div>
  );
}
