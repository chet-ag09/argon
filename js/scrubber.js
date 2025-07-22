const scrubber = document.getElementById("scrubber");
const currentTime = document.getElementById("currentTime");
const durationTime = document.getElementById("durationTime");

let currentTrack = null;
let lastUpdateTime = null;

// Format seconds into mm:ss
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Render loop that updates the scrubber smoothly
function renderLoop() {
  requestAnimationFrame(renderLoop);

  if (!currentTrack || !currentTrack.duration || !lastUpdateTime) return;

  const now = Date.now();
  const delta = (now - lastUpdateTime) / 1000;

  if (currentTrack.status === "Playing") {
    currentTrack.position = Math.min(
      currentTrack.position + delta,
      currentTrack.duration
    );
  }

  lastUpdateTime = now;

  scrubber.max = Math.floor(currentTrack.duration);
  scrubber.value = Math.floor(currentTrack.position);

  currentTime.textContent = formatTime(currentTrack.position);
  durationTime.textContent = formatTime(currentTrack.duration);
}

// Pull real data from Python
async function fetchTrackInfo() {
  try {
    const track = await window.electronAPI.getTrackInfo();

    if (!track || !track.duration || track.duration === 0) return;

    currentTrack = {
      status: track.status,
      position: track.position,
      duration: track.duration
    };

    lastUpdateTime = Date.now();
  } catch (error) {
    console.error("Error fetching track info:", error);
  }
}

renderLoop();
fetchTrackInfo();
setInterval(fetchTrackInfo, 5000);
