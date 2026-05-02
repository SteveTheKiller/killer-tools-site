<script setup lang="ts">
import _ from 'lodash';
import { useMediaRecorder } from './useMediaRecorder';

interface Media { type: 'image' | 'video'; value: string; createdAt: Date }

const {
  videoInputs: cameras,
  audioInputs: microphones,
  permissionGranted,
  isSupported,
  ensurePermissions,
} = useDevicesList({
  requestPermissions: true,
  constraints: { video: true, audio: true },
  onUpdated() { refreshCurrentDevices(); },
});

const video = ref<HTMLVideoElement>();
const medias = ref<Media[]>([]);
const currentCamera = ref(cameras.value[0]?.deviceId);
const currentMicrophone = ref(microphones.value[0]?.deviceId);
const permissionCannotBePrompted = ref(false);

const { stream, start, stop, enabled: isMediaStreamAvailable } = useUserMedia({
  constraints: computed(() => ({
    video: { deviceId: currentCamera.value },
    ...(currentMicrophone.value ? { audio: { deviceId: currentMicrophone.value } } : {}),
  })),
  autoSwitch: true,
});

const { isRecordingSupported, onRecordAvailable, startRecording, stopRecording, pauseRecording, recordingState, resumeRecording } = useMediaRecorder({ stream });

onRecordAvailable((value) => {
  medias.value.unshift({ type: 'video', value, createdAt: new Date() });
});

function refreshCurrentDevices() {
  if (_.isNil(currentCamera) || !cameras.value.find(i => i.deviceId === currentCamera.value)) {
    currentCamera.value = cameras.value[0]?.deviceId;
  }
  if (_.isNil(microphones) || !microphones.value.find(i => i.deviceId === currentMicrophone.value)) {
    currentMicrophone.value = microphones.value[0]?.deviceId;
  }
}

function takeScreenshot() {
  if (!video.value) {
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;
  canvas.getContext('2d')?.drawImage(video.value, 0, 0);
  medias.value.unshift({ type: 'image', value: canvas.toDataURL('image/png'), createdAt: new Date() });
}

watchEffect(() => {
  if (video.value && stream.value) {
    video.value.srcObject = stream.value;
  }
});

onBeforeUnmount(() => stop());

async function requestPermissions() {
  try {
    await ensurePermissions();
  }
  catch {
    permissionCannotBePrompted.value = true;
  }
}

function downloadMedia({ type, value, createdAt }: Media) {
  const link = document.createElement('a');
  link.href = value;
  link.download = `${type}-${createdAt.getTime()}.${type === 'image' ? 'png' : 'webm'}`;
  link.click();
}

// Recording timer
const recordingSeconds = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

watch(recordingState, (state) => {
  if (state === 'recording') {
    recordingSeconds.value = 0;
    timerInterval = setInterval(() => recordingSeconds.value++, 1000);
  }
  else if (state === 'paused') {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }
  else if (state === 'stopped') {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    recordingSeconds.value = 0;
  }
});

const recordingTime = computed(() => {
  const m = Math.floor(recordingSeconds.value / 60).toString().padStart(2, '0');
  const s = (recordingSeconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

// Custom dropdowns
const cameraOpen = ref(false);
const micOpen = ref(false);

const cameraLabel = computed(() => cameras.value.find(c => c.deviceId === currentCamera.value)?.label ?? 'Select camera');
const micLabel = computed(() => microphones.value.find(m => m.deviceId === currentMicrophone.value)?.label ?? 'Select microphone');

function closeOnBlur(openRef: Ref<boolean>) {
  return (e: FocusEvent) => {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel?.closest?.('.cr-dropdown')) {
      openRef.value = false;
    }
  };
}

function formatDate(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
</script>

<template>
  <div class="cr-wrap">
    <!-- Not supported -->
    <div v-if="!isSupported" class="cr-panel cr-message">
      <icon-mdi-camera-off class="cr-message-icon" />
      <span>Your browser does not support camera recording.</span>
    </div>

    <!-- Permission needed -->
    <div v-else-if="!permissionGranted" class="cr-panel cr-message">
      <icon-mdi-lock class="cr-message-icon" />
      <p>Camera and microphone access required.</p>
      <div v-if="permissionCannotBePrompted" class="cr-alert">
        Permission was blocked. Grant access manually via your browser's address bar lock icon.
      </div>
      <button v-else class="cr-btn cr-btn-primary" @click="requestPermissions()">
        <icon-mdi-lock-open />
        Grant permission
      </button>
    </div>

    <!-- Main UI -->
    <div v-else class="cr-panel">

      <!-- Device selects -->
      <div class="cr-device-row">
        <!-- Camera dropdown -->
        <div class="cr-device-field">
          <span class="cr-sublabel">VIDEO</span>
          <div class="cr-dropdown" tabindex="0" @blur="closeOnBlur(cameraOpen)($event)">
            <button type="button" class="cr-dropdown-trigger" @click="cameraOpen = !cameraOpen">
              <icon-mdi-camera class="cr-device-icon" />
              <span class="cr-dropdown-text">{{ cameraLabel }}</span>
              <icon-mdi-chevron-down class="cr-chevron" :class="{ 'cr-chevron-open': cameraOpen }" />
            </button>
            <div v-if="cameraOpen" class="cr-dropdown-menu">
              <button
                v-for="cam in cameras" :key="cam.deviceId" type="button"
                class="cr-dropdown-item" :class="{ 'cr-dropdown-item-active': cam.deviceId === currentCamera }"
                @click="currentCamera = cam.deviceId; cameraOpen = false"
              >
                {{ cam.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mic dropdown -->
        <div v-if="microphones.length > 0" class="cr-device-field">
          <span class="cr-sublabel">AUDIO</span>
          <div class="cr-dropdown" tabindex="0" @blur="closeOnBlur(micOpen)($event)">
            <button type="button" class="cr-dropdown-trigger" @click="micOpen = !micOpen">
              <icon-mdi-microphone class="cr-device-icon" />
              <span class="cr-dropdown-text">{{ micLabel }}</span>
              <icon-mdi-chevron-down class="cr-chevron" :class="{ 'cr-chevron-open': micOpen }" />
            </button>
            <div v-if="micOpen" class="cr-dropdown-menu">
              <button
                v-for="mic in microphones" :key="mic.deviceId" type="button"
                class="cr-dropdown-item" :class="{ 'cr-dropdown-item-active': mic.deviceId === currentMicrophone }"
                @click="currentMicrophone = mic.deviceId; micOpen = false"
              >
                {{ mic.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Start webcam button -->
      <div v-if="!isMediaStreamAvailable" class="cr-start-wrap">
        <button class="cr-btn cr-btn-primary cr-btn-lg" @click="start()">
          <icon-mdi-camera />
          Start webcam
        </button>
      </div>

      <!-- Video + controls -->
      <div v-else class="cr-video-wrap">
        <!-- Recording indicator -->
        <div v-if="recordingState !== 'stopped'" class="cr-rec-badge" :class="{ 'cr-rec-paused': recordingState === 'paused' }">
          <span class="cr-rec-dot" />
          {{ recordingState === 'paused' ? 'PAUSED' : 'REC' }}
          <span class="cr-rec-time">{{ recordingTime }}</span>
        </div>

        <video ref="video" autoplay playsinline class="cr-video" />

        <!-- Controls bar -->
        <div class="cr-controls-bar">
          <button class="cr-btn" @click="takeScreenshot()">
            <icon-mdi-camera />
            Screenshot
          </button>

          <div class="cr-rec-controls">
            <template v-if="isRecordingSupported">
              <button v-if="recordingState === 'stopped'" class="cr-btn cr-btn-rec" @click="startRecording()">
                <icon-mdi-record />
                Record
              </button>
              <button v-if="recordingState === 'recording'" class="cr-btn" @click="pauseRecording()">
                <icon-mdi-pause />
                Pause
              </button>
              <button v-if="recordingState === 'paused'" class="cr-btn cr-btn-primary" @click="resumeRecording()">
                <icon-mdi-play />
                Resume
              </button>
              <button v-if="recordingState !== 'stopped'" class="cr-btn cr-btn-stop" @click="stopRecording()">
                <icon-mdi-stop />
                Stop
              </button>
            </template>
            <span v-else class="cr-unsupported">Recording not supported in this browser</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Media gallery -->
    <div v-if="medias.length > 0" class="cr-gallery">
      <div class="cr-gallery-header">
        <span class="cr-sublabel">CAPTURES ({{ medias.length }})</span>
        <button class="cr-clear-btn" @click="medias = []">
          Clear all
        </button>
      </div>
      <div class="cr-gallery-grid">
        <div v-for="(media, index) in medias" :key="index" class="cr-media-card">
          <div class="cr-media-badge">
            {{ media.type === 'image' ? 'PNG' : 'WEBM' }}
          </div>
          <img v-if="media.type === 'image'" :src="media.value" class="cr-media-preview" alt="screenshot">
          <video v-else :src="media.value" controls class="cr-media-preview" />
          <div class="cr-media-footer">
            <span class="cr-media-time">{{ formatDate(media.createdAt) }}</span>
            <div class="cr-media-actions">
              <button class="cr-icon-btn" title="Download" @click="downloadMedia(media)">
                <icon-mdi-download />
              </button>
              <button class="cr-icon-btn cr-icon-btn-danger" title="Delete" @click="medias = medias.filter((_, i) => i !== index)">
                <icon-mdi-delete-outline />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cr-wrap {
  flex: 1 1 560px;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Panel ── */
.cr-panel {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(30, 165, 76, 0.25);
  border-radius: 8px;
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cr-message {
  align-items: center;
  text-align: center;
  gap: 12px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
}

.cr-message-icon {
  font-size: 2rem;
  color: rgba(30, 165, 76, 0.4);
}

.cr-alert {
  font-size: 0.75rem;
  color: #e05555;
  background: rgba(224,85,85,0.1);
  border: 1px solid rgba(224,85,85,0.25);
  border-radius: 5px;
  padding: 8px 12px;
  max-width: 400px;
}

/* ── Sublabel ── */
.cr-sublabel {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}

/* ── Device row ── */
.cr-device-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cr-device-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1 1 200px;
  min-width: 0;
}

.cr-device-icon {
  color: rgba(30, 165, 76, 0.5);
  flex-shrink: 0;
  font-size: 0.9rem;
}

/* ── Custom dropdown ── */
.cr-dropdown {
  position: relative;
  outline: none;
}

.cr-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(30,165,76,0.2);
  border-radius: 5px;
  padding: 7px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.75);
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;
  box-sizing: border-box;
}

.cr-dropdown-trigger:hover,
.cr-dropdown:focus-within .cr-dropdown-trigger {
  border-color: rgba(30,165,76,0.55);
}

.cr-dropdown-text {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cr-chevron {
  margin-left: auto;
  color: rgba(30,165,76,0.5);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.cr-chevron-open { transform: rotate(180deg); }

.cr-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(10,10,10,0.97);
  border: 1px solid rgba(30,165,76,0.3);
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}

.cr-dropdown-item {
  display: block;
  width: 100%;
  padding: 7px 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(30,165,76,0.06);
  text-align: left;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cr-dropdown-item:last-child { border-bottom: none; }
.cr-dropdown-item:hover { background: rgba(30,165,76,0.1); color: #fff; }
.cr-dropdown-item-active { color: #1ea54c; background: rgba(30,165,76,0.08); }

/* ── Video ── */
.cr-start-wrap {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.cr-video-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cr-video {
  width: 100%;
  border-radius: 6px;
  border: 1px solid rgba(30,165,76,0.15);
  background: #000;
  display: block;
}

/* ── Recording badge ── */
.cr-rec-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: rgba(224,85,85,0.15);
  border: 1px solid rgba(224,85,85,0.4);
  border-radius: 4px;
  padding: 3px 10px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: #e05555;
  letter-spacing: 0.08em;
}

.cr-rec-paused {
  background: rgba(224,160,32,0.15);
  border-color: rgba(224,160,32,0.4);
  color: #e0a020;
}

.cr-rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e05555;
  animation: cr-blink 1s infinite;
}

.cr-rec-paused .cr-rec-dot {
  background: #e0a020;
  animation: none;
}

@keyframes cr-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.cr-rec-time {
  font-size: 0.72rem;
  opacity: 0.8;
  margin-left: 4px;
}

/* ── Controls bar ── */
.cr-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.cr-rec-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cr-unsupported {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
  font-style: italic;
}

/* ── Buttons ── */
.cr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 5px;
  border: 1px solid rgba(30,165,76,0.35);
  background: transparent;
  color: rgba(30,165,76,0.8);
  font-size: 0.78rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}

.cr-btn:hover {
  background: rgba(30,165,76,0.1);
  border-color: rgba(30,165,76,0.65);
  color: #1ea54c;
}

.cr-btn-primary {
  background: rgba(30,165,76,0.12);
  border-color: rgba(30,165,76,0.5);
  color: #1ea54c;
}

.cr-btn-primary:hover {
  background: rgba(30,165,76,0.22);
  border-color: #1ea54c;
}

.cr-btn-lg {
  padding: 10px 24px;
  font-size: 0.88rem;
}

.cr-btn-rec {
  border-color: rgba(224,85,85,0.4);
  color: #e05555;
}

.cr-btn-rec:hover {
  background: rgba(224,85,85,0.1);
  border-color: #e05555;
  color: #e05555;
}

.cr-btn-stop {
  border-color: rgba(224,85,85,0.35);
  color: rgba(224,85,85,0.7);
}

.cr-btn-stop:hover {
  background: rgba(224,85,85,0.1);
  border-color: #e05555;
  color: #e05555;
}

/* ── Gallery ── */
.cr-gallery {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cr-gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cr-clear-btn {
  font-size: 0.65rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255,255,255,0.5);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.12s;
}

.cr-clear-btn:hover { color: #e05555; }

.cr-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.cr-media-card {
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(30,165,76,0.2);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.cr-media-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(30,165,76,0.3);
  border-radius: 3px;
  padding: 1px 6px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  color: rgba(30,165,76,0.7);
  letter-spacing: 0.08em;
}

.cr-media-preview {
  width: 100%;
  display: block;
  max-height: 200px;
  object-fit: cover;
  background: #000;
}

.cr-media-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-top: 1px solid rgba(30,165,76,0.1);
}

.cr-media-time {
  font-size: 0.65rem;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  color: rgba(255,255,255,0.3);
}

.cr-media-actions {
  display: flex;
  gap: 6px;
}

.cr-icon-btn {
  width: 26px;
  height: 26px;
  background: transparent;
  border: 1px solid rgba(30,165,76,0.2);
  border-radius: 4px;
  color: rgba(30,165,76,0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.cr-icon-btn:hover {
  background: rgba(30,165,76,0.1);
  border-color: rgba(30,165,76,0.55);
  color: #1ea54c;
}

.cr-icon-btn-danger:hover {
  background: rgba(224,85,85,0.1);
  border-color: rgba(224,85,85,0.5);
  color: #e05555;
}
</style>
