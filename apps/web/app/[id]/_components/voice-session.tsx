import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useState } from "react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

export const VoiceSession = () => {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <VoiceSetup />
    </AgoraRTCProvider>
  );
};

const VoiceSetup = () => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected(); // Store the user's connection status
  const [appId, setAppId] = useState("");
  const [channel, setChannel] = useState("okay");
  const [token, setToken] = useState("");
  const [micOn, setMic] = useState(true);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);

  useJoin(
    { appid: appId, channel: channel, token: token, uid: 121101628 },
    calling
  );
  usePublish([localMicrophoneTrack]);

  const remoteUsers = useRemoteUsers();

  return (
    <>
      <div>
        {isConnected ? (
          <div>
            <div>
              <LocalUser
                audioTrack={localMicrophoneTrack}
                playAudio={false} // Plays the local user's audio track. You use this to test your mic before joining a channel.
                micOn={micOn}
              >
                <samp>You</samp>
              </LocalUser>
            </div>
            {remoteUsers.map((user) => (
              <div key={user.uid}>
                <RemoteUser user={user}>
                  <samp>{user.uid}</samp>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <input
              onChange={(e) => setAppId(e.target.value)}
              placeholder="<Your app ID>"
              value={appId}
            />
            <input
              onChange={(e) => setChannel(e.target.value)}
              placeholder="<Your channel Name>"
              value={channel}
            />
            <input
              onChange={(e) => setToken(e.target.value)}
              placeholder="<Your token>"
              value={token}
            />

            <button
              disabled={!appId || !channel}
              onClick={() => setCalling(true)}
            >
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div style={{ padding: "20px" }}>
          <div>
            <button onClick={() => setMic((a) => !a)}>
              {micOn ? "Disable mic" : "Enable mic"}
            </button>
            <button onClick={() => setCalling((a) => !a)}>
              {calling ? "End calling" : "Start calling"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
