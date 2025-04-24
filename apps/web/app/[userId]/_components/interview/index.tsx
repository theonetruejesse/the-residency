// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   useRTCClient,
//   useLocalMicrophoneTrack,
//   useRemoteUsers,
//   useClientEvent,
//   useIsConnected,
//   useJoin,
//   usePublish,
//   RemoteUser,
//   UID,
// } from "agora-rtc-react";
// import { Doc } from "@residency/api";

// interface InterviewProps {
//   session: Doc<"sessions">;
// }

// export default function Interview(props: InterviewProps) {
//   const { session } = props;
//   // Access the client from the provider context
//   const client = useRTCClient();

//   // Track connection status
//   const isConnected = useIsConnected();

//   // Manage microphone state
//   const [isEnabled, setIsEnabled] = useState(true);
//   const { localMicrophoneTrack } = useLocalMicrophoneTrack(isEnabled);

//   // Track remote users (like our AI agent)
//   const remoteUsers = useRemoteUsers();

//   // Join the channel when component mounts
//   const { isConnected: joinSuccess } = useJoin(
//     {
//       appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
//       token: session.sessionToken,
//       channel: session.sessionId.toString(),
//       uid: session.sessionId,
//     },
//     true // Join automatically when the component mounts
//   );

//   // Publish our microphone track to the channel
//   usePublish([localMicrophoneTrack]);

//   // Set up event handlers for client events
//   useClientEvent(client, "user-joined", (user) => {
//     console.log("Remote user joined:", user.uid);
//   });

//   useClientEvent(client, "user-left", (user) => {
//     console.log("Remote user left:", user.uid);
//   });

//   // Toggle microphone on/off
//   const toggleMicrophone = async () => {
//     if (localMicrophoneTrack) {
//       await localMicrophoneTrack.setEnabled(!isEnabled);
//       setIsEnabled(!isEnabled);
//     }
//   };

//   // Clean up when component unmounts
//   useEffect(() => {
//     return () => {
//       client?.leave(); // Leave the channel when the component unmounts
//     };
//   }, [client]);

//   return (
//     <div className="p-4 bg-gray-800 rounded-lg">
//       <div className="mb-4">
//         <p className="text-white">
//           {/* Display the connection status */}
//           Connection Status: {isConnected ? "Connected" : "Disconnected"}
//         </p>
//       </div>

//       {/* Display remote users */}
//       <div className="mb-4">
//         {remoteUsers.length > 0 ? (
//           remoteUsers.map((user) => (
//             <div
//               key={user.uid}
//               className="p-2 bg-gray-700 rounded mb-2 text-white"
//             >
//               <RemoteUser user={user} />
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-400">No remote users connected</p>
//         )}
//       </div>

//       {/* Microphone control */}
//       <button
//         onClick={toggleMicrophone}
//         className={`px-4 py-2 rounded ${
//           isEnabled ? "bg-green-500" : "bg-red-500"
//         } text-white`}
//       >
//         Microphone: {isEnabled ? "On" : "Off"}
//       </button>
//     </div>
//   );
// }
