import { useRef, useState } from "react";

const MAX_SECONDS = 10;

/**
 * Records a 5-10s audio/video "vibe" clip via the browser's native
 * MediaRecorder API, auto-stopping at MAX_SECONDS. Calls onRecorded(blob)
 * when done so the parent can hand it off to uploadToCloudinary().
 */
export default function VoiceRecorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onRecorded(blob);
      stream.getTracks().forEach((track) => track.stop());
      clearInterval(timerRef.current);
      setSeconds(0);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);

    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SECONDS) {
          stopRecording();
          return 0;
        }
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div>
      {!recording ? (
        <button type="button" onClick={startRecording}>
          🎙️ Record vibe clip
        </button>
      ) : (
        <button type="button" onClick={stopRecording}>
          ⏹ Stop ({MAX_SECONDS - seconds}s left)
        </button>
      )}
    </div>
  );
}
