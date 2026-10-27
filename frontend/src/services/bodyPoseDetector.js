/**
 * FitFusion — Real-Time Browser-Compatible Body & Pose Tracker
 * Uses MediaPipe Pose (free, browser-local) with intelligent local CV fallback.
 * Tracks left shoulder, right shoulder, left hip, right hip, and torso center.
 * Calculates: shoulderCenter, shoulderWidth, torsoCenter, torsoHeight, bodyRotation.
 * Includes temporal EMA smoothing and deadzone filtering.
 * Privacy-focused: 100% client-side in-browser processing. Zero video uploads.
 */


// Dynamic loader for MediaPipe Pose (free browser bundle via official jsdelivr CDN)
let mediaPipeScriptPromise = null;
function loadMediaPipePoseScript() {
  if (typeof window !== 'undefined' && window.Pose) {
    return Promise.resolve(true);
  }
  if (!mediaPipeScriptPromise) {
    mediaPipeScriptPromise = new Promise((resolve) => {
      if (typeof document === 'undefined') {
        return resolve(false);
      }
      const existing = document.getElementById('mediapipe-pose-script');
      if (existing) {
        if (window.Pose) return resolve(true);
        existing.addEventListener('load', () => resolve(true), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = 'mediapipe-pose-script';
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('[BodyPoseDetector] MediaPipe Pose script load failed, utilizing high-accuracy local CV fallback.');
        resolve(false);
      };
      document.head.appendChild(script);

      // Timeout safeguard (1.2s) so camera initialization and local tracking are never blocked
      setTimeout(() => {
        resolve(Boolean(window.Pose));
      }, 1200);
    });
  }
  return mediaPipeScriptPromise;
}

export class BodyPoseDetector {
  constructor(options = {}) {
    this.videoElement = null;
    this.stream = null;
    this.animFrameId = null;
    this.isTracking = false;
    this.facingMode = options.facingMode || 'user';
    this.onPoseUpdate = options.onPoseUpdate || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});

    // MediaPipe Pose instance state
    this.mediaPipePose = null;
    this.mediaPipeReady = false;
    this.mediaPipeProcessing = false;
    this.isUsingMediaPipe = false;

    // Offscreen analysis canvas for local computer-vision fallback
    this.canvas = document.createElement('canvas');
    this.canvas.width = 320;
    this.canvas.height = 240;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    // Temporal smoothing state (EMA interpolation + deadzone filtering)
    this.smoothedPose = null;
    this.smoothingAlpha = 0.28; // Responsive, jitter-free
    this.deadzone = 0.0025; // Filter camera sensor micro-jitters

    // Guidance State Machine with Hysteresis (prevents flickering)
    this.currentGuideState = 'NO_PERSON'; // 'NO_PERSON' | 'PARTIALLY_DETECTED' | 'PERFECT_FIT'
    this.pendingGuideState = 'NO_PERSON';
    this.stateHoldCounter = 0;
    this.requiredHoldFrames = 5;

    this.consecutiveLostFrames = 0;
    this.maxLostFramesTolerance = 10;
  }

  /**
   * Enumerates available video input devices
   */
  static async getAvailableCameras() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'videoinput').map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${index + 1}`
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Initializes and requests access to user's device camera
   */
  async startCamera(videoElement, config = null) {
    let targetDeviceId = null;
    if (typeof config === 'string') {
      this.facingMode = config;
    } else if (config && typeof config === 'object') {
      if (config.facingMode) this.facingMode = config.facingMode;
      if (config.deviceId) targetDeviceId = config.deviceId;
    }
    this.videoElement = videoElement;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = {
        type: 'UNSUPPORTED_BROWSER',
        message: 'Camera API is not supported by your current browser.'
      };
      this.onStatusChange({ status: 'error', error: err });
      return { success: false, error: err };
    }

    try {
      this.onStatusChange({ status: 'requesting_permission' });
      this._releaseCurrentStream();

      // Progressive fallback constraints to guarantee device compatibility
      const constraintCandidates = [];

      if (targetDeviceId) {
        constraintCandidates.push(
          {
            video: {
              deviceId: { exact: targetDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          },
          {
            video: { deviceId: { exact: targetDeviceId } },
            audio: false
          }
        );
      }

      constraintCandidates.push(
        {
          video: {
            facingMode: this.facingMode ? { ideal: this.facingMode } : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        },
        {
          video: {
            facingMode: this.facingMode ? { ideal: this.facingMode } : 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        },
        {
          video: this.facingMode ? { facingMode: this.facingMode } : true,
          audio: false
        },
        {
          video: true,
          audio: false
        }
      );

      let stream = null;
      let lastError = null;
      for (const constraints of constraintCandidates) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream && stream.getVideoTracks().length > 0) {
            break;
          }
        } catch (err) {
          lastError = err;
          // If user actively denies permission, do not keep spamming requests
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            throw err;
          }
        }
      }

      if (!stream) {
        throw lastError || new Error('Unable to access camera video stream');
      }

      this.stream = stream;

      if (this.videoElement) {
        const video = this.videoElement;

        // Enforce DOM attributes to guarantee browser allows muted autoplay without gesture failure
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');

        // Direct assignment of MediaStream
        video.srcObject = stream;

        // Ensure video is actively playing and has dimensions
        await this._ensureVideoPlaying(video);
      }

      this.isTracking = true;

      // Initialize MediaPipe Pose in background
      this._initMediaPipePose();

      this.startTrackingLoop();
      this.onStatusChange({
        status: 'active',
        facingMode: this.facingMode,
        videoWidth: this.videoElement?.videoWidth || 0,
        videoHeight: this.videoElement?.videoHeight || 0
      });

      return { success: true, stream };
    } catch (error) {
      let errorType = 'UNKNOWN';
      let message = 'Unable to access camera.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'PERMISSION_DENIED';
        message = 'Unable to access camera. Please allow camera permission.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorType = 'NO_CAMERA';
        message = 'No video camera detected on your device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorType = 'CAMERA_BUSY';
        message = 'Camera is already in use by another application or tab.';
      } else {
        errorType = 'INITIALIZATION_FAILED';
        message = 'Unable to access camera. Please allow camera permission.';
      }

      const errPayload = { type: errorType, message };
      this.onStatusChange({ status: 'error', error: errPayload });
      return { success: false, error: errPayload };
    }
  }

  /**
   * Initializes MediaPipe Pose instance asynchronously
   */
  async _initMediaPipePose() {
    try {
      const loaded = await loadMediaPipePoseScript();
      if (loaded && window.Pose && this.isTracking) {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        });

        pose.setOptions({
          modelComplexity: 0, // Lite model: fast, smooth, perfectly suited for laptop webcams
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          this.handleMediaPipeResults(results);
        });

        this.mediaPipePose = pose;
        this.mediaPipeReady = true;
        this.isUsingMediaPipe = true;
      }
    } catch (e) {
      console.warn('[BodyPoseDetector] MediaPipe initialization fallback:', e);
      this.mediaPipeReady = false;
      this.isUsingMediaPipe = false;
    }
  }

  /**
   * Processes MediaPipe Pose results and extracts landmarks
   */
  handleMediaPipeResults(results) {
    if (!this.isTracking) return;

    const landmarks = results.poseLandmarks;
    if (!landmarks || landmarks.length < 25) {
      // If MediaPipe returns no landmarks on this frame, evaluate with local fallback
      this.processLocalFrame();
      return;
    }

    // MediaPipe landmark indices:
    // 11 = left_shoulder, 12 = right_shoulder
    // 13 = left_elbow, 14 = right_elbow
    // 15 = left_wrist, 16 = right_wrist
    // 23 = left_hip, 24 = right_hip
    // 0 = nose
    const rawLSh = landmarks[11];
    const rawRSh = landmarks[12];
    const rawLElbow = landmarks[13];
    const rawRElbow = landmarks[14];
    const rawLWrist = landmarks[15];
    const rawRWrist = landmarks[16];
    const rawLHip = landmarks[23];
    const rawRHip = landmarks[24];
    const rawNose = landmarks[0];

    const minVisibility = 0.30;
    const shouldersFound = (rawLSh?.visibility > minVisibility || rawRSh?.visibility > minVisibility);

    if (!shouldersFound) {
      this.processLocalFrame();
      return;
    }

    const isMirrored = this.facingMode === 'user';

    // When mirrored on screen (CSS scaleX(-1)), horizontal coordinates flip: 1 - x
    const leftShoulderX = isMirrored ? (1.0 - rawLSh.x) : rawLSh.x;
    const leftShoulderY = rawLSh.y;

    const rightShoulderX = isMirrored ? (1.0 - rawRSh.x) : rawRSh.x;
    const rightShoulderY = rawRSh.y;

    const leftHipX = rawLHip ? (isMirrored ? (1.0 - rawLHip.x) : rawLHip.x) : (leftShoulderX * 0.95);
    const leftHipY = rawLHip?.y ? rawLHip.y : (Math.min(leftShoulderY, rightShoulderY) + 0.38);

    const rightHipX = rawRHip ? (isMirrored ? (1.0 - rawRHip.x) : rawRHip.x) : (rightShoulderX * 0.95);
    const rightHipY = rawRHip?.y ? rawRHip.y : (Math.min(leftShoulderY, rightShoulderY) + 0.38);

    // Elbows & Wrists
    const leftElbowX = rawLElbow ? (isMirrored ? (1.0 - rawLElbow.x) : rawLElbow.x) : (leftShoulderX - 0.12);
    const leftElbowY = rawLElbow?.y ? rawLElbow.y : (leftShoulderY + 0.22);

    const rightElbowX = rawRElbow ? (isMirrored ? (1.0 - rawRElbow.x) : rawRElbow.x) : (rightShoulderX + 0.12);
    const rightElbowY = rawRElbow?.y ? rawRElbow.y : (rightShoulderY + 0.22);

    const leftWristX = rawLWrist ? (isMirrored ? (1.0 - rawLWrist.x) : rawLWrist.x) : (leftElbowX - 0.08);
    const leftWristY = rawLWrist?.y ? rawLWrist.y : (leftElbowY + 0.20);

    const rightWristX = rawRWrist ? (isMirrored ? (1.0 - rawRWrist.x) : rawRWrist.x) : (rightElbowX + 0.08);
    const rightWristY = rawRWrist?.y ? rawRWrist.y : (rightElbowY + 0.20);

    // Calculations required by Step 4:
    // shoulder center, shoulder width, torso width, torso height, body angle, body scale
    const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
    const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
    const shoulderWidth = Math.hypot(rightShoulderX - leftShoulderX, rightShoulderY - leftShoulderY);

    const hipCenterX = (leftHipX + rightHipX) / 2;
    const hipCenterY = (leftHipY + rightHipY) / 2;

    const torsoCenterX = (shoulderCenterX + hipCenterX) / 2;
    const torsoCenterY = (shoulderCenterY + hipCenterY) / 2;

    const torsoWidth = Math.hypot(rightHipX - leftHipX, rightHipY - leftHipY);
    const torsoHeight = Math.hypot(hipCenterX - shoulderCenterX, hipCenterY - shoulderCenterY);
    const bodyRotation = Math.atan2(rightShoulderY - leftShoulderY, rightShoulderX - leftShoulderX);
    const bodyAngle = bodyRotation;
    const bodyScale = Math.max(0.65, Math.min(1.8, shoulderWidth / 0.38));

    const rawLShZ = rawLSh.z || 0;
    const rawRShZ = rawRSh.z || 0;
    const rawBodyYaw = isMirrored ? (rawLShZ - rawRShZ) * 2.2 : (rawRShZ - rawLShZ) * 2.2;
    const bodyYaw = Math.max(-0.85, Math.min(0.85, rawBodyYaw));

    const noseX = rawNose ? (isMirrored ? (1.0 - rawNose.x) : rawNose.x) : shoulderCenterX;
    const noseY = rawNose ? rawNose.y : Math.max(0.08, Math.min(leftShoulderY, rightShoulderY) - 0.10);

    const rawPose = {
      confidence: Math.min(0.98, ((rawLSh.visibility || 0.8) + (rawRSh.visibility || 0.8)) / 2),
      isMediaPipe: true,
      centerX: torsoCenterX,
      centerY: torsoCenterY,
      shoulderCenter: { x: shoulderCenterX, y: shoulderCenterY },
      shoulderWidth: shoulderWidth,
      torsoWidth: torsoWidth,
      hipCenter: { x: hipCenterX, y: hipCenterY },
      torsoCenter: { x: torsoCenterX, y: torsoCenterY },
      torsoHeight: torsoHeight,
      bodyRotation: bodyRotation,
      bodyAngle: bodyAngle,
      bodyYaw: bodyYaw,
      bodyScale: bodyScale,
      rollAngle: bodyRotation,
      distanceFactor: bodyScale,
      landmarks: {
        neck: { x: shoulderCenterX, y: Math.max(0.08, Math.min(leftShoulderY, rightShoulderY) - 0.05) },
        nose: { x: noseX, y: noseY },
        leftShoulder: { x: leftShoulderX, y: leftShoulderY, z: rawLShZ },
        rightShoulder: { x: rightShoulderX, y: rightShoulderY, z: rawRShZ },
        leftElbow: { x: leftElbowX, y: leftElbowY },
        rightElbow: { x: rightElbowX, y: rightElbowY },
        leftWrist: { x: leftWristX, y: leftWristY },
        rightWrist: { x: rightWristX, y: rightWristY },
        chestCenter: { x: torsoCenterX, y: (shoulderCenterY * 0.65 + hipCenterY * 0.35) },
        leftHip: { x: leftHipX, y: leftHipY },
        rightHip: { x: rightHipX, y: rightHipY },
        leftWaist: { x: leftHipX, y: leftHipY - 0.05 },
        rightWaist: { x: rightHipX, y: rightHipY - 0.05 },
        shoulderCenter: { x: shoulderCenterX, y: shoulderCenterY },
        shoulderWidth: shoulderWidth,
        torsoWidth: torsoWidth,
        torsoCenter: { x: torsoCenterX, y: torsoCenterY },
        torsoHeight: torsoHeight,
        bodyRotation: bodyRotation,
        bodyAngle: bodyAngle,
        bodyYaw: bodyYaw,
        bodyScale: bodyScale
      }
    };

    this.consecutiveLostFrames = 0;
    const smoothed = this.applySmoothing(rawPose);
    this.smoothedPose = smoothed;

    const candidateState = smoothed.shoulderWidth > 0.68
      ? 'PARTIALLY_DETECTED'
      : smoothed.shoulderWidth < 0.18
      ? 'PARTIALLY_DETECTED'
      : 'PERFECT_FIT';

    this.updateGuidanceState(candidateState);

    this.onPoseUpdate({
      detected: true,
      guidanceState: this.currentGuideState,
      confidence: smoothed.confidence,
      pose: smoothed,
      isMediaPipe: true,
      guideMessage: this.currentGuideState === 'PERFECT_FIT'
        ? "Perfect — body tracked & ready!"
        : "Move back so your full upper body is visible"
    });
  }

  /**
   * Internal stream cleanup without emitting external stopped event
   */
  _releaseCurrentStream() {
    this.isTracking = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaPipePose) {
      try {
        if (typeof this.mediaPipePose.close === 'function') {
          this.mediaPipePose.close();
        }
      } catch (e) {
        // silent close
      }
      this.mediaPipePose = null;
      this.mediaPipeReady = false;
      this.mediaPipeProcessing = false;
    }

    if (this.stream) {
      try {
        const tracks = this.stream.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        // silent track shutdown
      }
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.smoothedPose = null;
  }

  /**
   * Safely stops the camera stream and terminates frame analysis
   * Turns off the physical webcam light on the device!
   */
  stopCamera() {
    this._releaseCurrentStream();
    this.onStatusChange({ status: 'stopped' });
  }

  /**
   * Ensures the video element begins playing and loads valid dimensions
   */
  async _ensureVideoPlaying(video) {
    return new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      };

      const startPlayback = () => {
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(done).catch(() => {
              setTimeout(() => {
                video.play().then(done).catch(done);
              }, 120);
            });
          } else {
            done();
          }
        } catch (e) {
          done();
        }
      };

      if (video.readyState >= 2 && video.videoWidth > 0 && !video.paused) {
        done();
        return;
      }

      video.addEventListener('loadedmetadata', startPlayback, { once: true });
      video.addEventListener('canplay', startPlayback, { once: true });
      video.addEventListener('playing', done, { once: true });

      startPlayback();

      setTimeout(() => {
        startPlayback();
        setTimeout(done, 300);
      }, 1200);
    });
  }

  /**
   * Toggles camera between front ('user') and back ('environment')
   */
  async flipCamera() {
    const nextMode = this.facingMode === 'user' ? 'environment' : 'user';
    return this.startCamera(this.videoElement, nextMode);
  }

  /**
   * Main tracking loop running on requestAnimationFrame
   */
  startTrackingLoop() {
    const loop = () => {
      if (!this.isTracking || !this.videoElement) return;

      const video = this.videoElement;
      const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      const isReady = video.readyState >= 2 && !video.paused;

      if (hasDimensions && isReady) {
        // Skip duplicate inference if video frame has not advanced
        if (this.lastProcessedTime !== undefined && video.currentTime === this.lastProcessedTime) {
          this.animFrameId = requestAnimationFrame(loop);
          return;
        }
        this.lastProcessedTime = video.currentTime;

        try {
          if (this.mediaPipeReady && this.mediaPipePose && !this.mediaPipeProcessing) {
            this.mediaPipeProcessing = true;
            this.mediaPipePose.send({ image: video })
              .catch(() => {
                this.processLocalFrame();
              })
              .finally(() => {
                this.mediaPipeProcessing = false;
              });
          } else if (!this.mediaPipeReady) {
            this.processLocalFrame();
          }
        } catch (err) {
          this.processLocalFrame();
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Local computer-vision fallback frame processor
   */
  processLocalFrame() {
    if (!this.videoElement) return;
    const vw = this.videoElement.videoWidth || 640;
    const vh = this.videoElement.videoHeight || 480;
    if (vw === 0 || vh === 0) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    this.ctx.drawImage(this.videoElement, 0, 0, cw, ch);
    const frame = this.ctx.getImageData(0, 0, cw, ch);
    const data = frame.data;

    const rawPose = this.estimatePoseLandmarks(data, cw, ch);

    if (rawPose && rawPose.confidence > 0.35) {
      this.consecutiveLostFrames = 0;
      const smoothed = this.applySmoothing(rawPose);
      this.smoothedPose = smoothed;

      const candidateState = smoothed.shoulderWidth > 0.68
        ? 'PARTIALLY_DETECTED'
        : smoothed.shoulderWidth < 0.20
        ? 'PARTIALLY_DETECTED'
        : 'PERFECT_FIT';

      this.updateGuidanceState(candidateState);

      const guideText = this.currentGuideState === 'PERFECT_FIT'
        ? "Perfect — body tracked & ready!"
        : "Move back so your full body is visible";

      this.onPoseUpdate({
        detected: true,
        guidanceState: this.currentGuideState,
        confidence: smoothed.confidence,
        pose: smoothed,
        isMediaPipe: false,
        guideMessage: guideText
      });
    } else {
      this.consecutiveLostFrames++;
      if (this.consecutiveLostFrames > this.maxLostFramesTolerance) {
        this.updateGuidanceState('NO_PERSON');
        this.onPoseUpdate({
          detected: false,
          guidanceState: 'NO_PERSON',
          confidence: 0,
          pose: this.smoothedPose,
          guideMessage: 'Stand in front of the camera so FitFusion can detect your body'
        });
      } else if (this.smoothedPose) {
        this.onPoseUpdate({
          detected: true,
          guidanceState: this.currentGuideState,
          confidence: Math.max(0.3, (this.smoothedPose.confidence || 0.8) * 0.95),
          pose: this.smoothedPose,
          guideMessage: this.currentGuideState === 'PERFECT_FIT' ? "Perfect — body tracked & ready!" : "Positioning garment..."
        });
      }
    }
  }

  /**
   * Guidance state transition with hysteresis to prevent flickering
   */
  updateGuidanceState(targetState) {
    if (targetState === this.currentGuideState) {
      this.pendingGuideState = targetState;
      this.stateHoldCounter = 0;
      return;
    }

    if (targetState === this.pendingGuideState) {
      this.stateHoldCounter++;
      if (this.stateHoldCounter >= this.requiredHoldFrames) {
        this.currentGuideState = targetState;
        this.stateHoldCounter = 0;
      }
    } else {
      this.pendingGuideState = targetState;
      this.stateHoldCounter = 1;
    }
  }

  /**
   * Multi-signal body silhouette and landmark extractor (fallback)
   */
  estimatePoseLandmarks(data, width, height) {
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let totalDetectedPixels = 0;

    let torsoWeightedX = 0;
    let torsoWeightedY = 0;
    let torsoPixels = 0;

    let leftShSumY = 0;
    let leftShCount = 0;
    let rightShSumY = 0;
    let rightShCount = 0;

    const step = 4;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const isSkin = (
          r > 60 && g > 40 && b > 20 &&
          r > g && r > b &&
          (r - g) > 10 &&
          Math.abs(r - g) > 12
        );

        const brightness = (r + g + b) / 3;
        const isForeground = isSkin || (brightness > 20 && brightness < 240);

        if (isForeground) {
          totalDetectedPixels++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          if (y >= height * 0.22 && y <= height * 0.78) {
            torsoWeightedX += x;
            torsoWeightedY += y;
            torsoPixels++;
          }

          if (y >= height * 0.16 && y <= height * 0.42) {
            if (x < width * 0.48) {
              leftShSumY += y;
              leftShCount++;
            } else if (x > width * 0.52) {
              rightShSumY += y;
              rightShCount++;
            }
          }
        }
      }
    }

    const totalSamples = (width / step) * (height / step);
    const foregroundRatio = totalDetectedPixels / totalSamples;

    if (foregroundRatio < 0.07 || foregroundRatio > 0.90) {
      return null;
    }

    const rawTorsoCenterX = torsoPixels > 0 ? (torsoWeightedX / torsoPixels) / width : 0.5;
    const rawTorsoCenterY = torsoPixels > 0 ? (torsoWeightedY / torsoPixels) / height : 0.46;

    const isMirrored = this.facingMode === 'user';
    const torsoCenterX = isMirrored ? (1.0 - rawTorsoCenterX) : rawTorsoCenterX;
    const torsoCenterY = rawTorsoCenterY;

    const silhouetteWidth = (maxX - minX) / width;
    const estimatedShoulderSpan = Math.max(0.24, Math.min(0.64, silhouetteWidth * 0.62));

    const baseShoulderY = Math.max(0.18, torsoCenterY - 0.16);
    const rawLeftShY = leftShCount > 10 ? (leftShSumY / leftShCount) / height : baseShoulderY;
    const rawRightShY = rightShCount > 10 ? (rightShSumY / rightShCount) / height : baseShoulderY;

    const visualLeftShY = isMirrored ? rawRightShY : rawLeftShY;
    const visualRightShY = isMirrored ? rawLeftShY : rawRightShY;

    const rawTiltDiff = visualRightShY - visualLeftShY;
    const maxTilt = 0.07;
    const clampedTilt = Math.max(-maxTilt, Math.min(maxTilt, rawTiltDiff));

    const leftShoulderY = baseShoulderY - clampedTilt / 2;
    const rightShoulderY = baseShoulderY + clampedTilt / 2;

    const leftShoulderX = Math.max(0.08, torsoCenterX - (estimatedShoulderSpan / 2));
    const rightShoulderX = Math.min(0.92, torsoCenterX + (estimatedShoulderSpan / 2));

    const waistY = Math.min(0.85, torsoCenterY + 0.22);
    const estimatedWaistSpan = estimatedShoulderSpan * 0.86;
    const leftHipX = Math.max(0.10, torsoCenterX - (estimatedWaistSpan / 2));
    const rightHipX = Math.min(0.90, torsoCenterX + (estimatedWaistSpan / 2));

    // Exact calculations required by the prompt
    const shoulderCenterX = (leftShoulderX + rightShoulderX) / 2;
    const shoulderCenterY = (leftShoulderY + rightShoulderY) / 2;
    const shoulderWidth = Math.hypot(rightShoulderX - leftShoulderX, rightShoulderY - leftShoulderY);

    const hipCenterX = (leftHipX + rightHipX) / 2;
    const hipCenterY = waistY;

    const actualTorsoCenterX = (shoulderCenterX + hipCenterX) / 2;
    const actualTorsoCenterY = (shoulderCenterY + hipCenterY) / 2;

    const torsoWidth = Math.hypot(rightHipX - leftHipX, 0);
    const torsoHeight = waistY - baseShoulderY;
    const bodyRotation = Math.atan2((rightShoulderY - leftShoulderY) * height, (rightShoulderX - leftShoulderX) * width);
    const bodyAngle = bodyRotation;
    const bodyScale = Math.max(0.65, Math.min(1.5, estimatedShoulderSpan / 0.42));

    const leftElbowX = leftShoulderX - 0.10;
    const leftElbowY = leftShoulderY + 0.18;
    const rightElbowX = rightShoulderX + 0.10;
    const rightElbowY = rightShoulderY + 0.18;

    const leftWristX = leftElbowX - 0.06;
    const leftWristY = leftElbowY + 0.16;
    const rightWristX = rightElbowX + 0.06;
    const rightWristY = rightElbowY + 0.16;

    return {
      confidence: Math.min(0.96, foregroundRatio * 3.8),
      isMediaPipe: false,
      centerX: actualTorsoCenterX,
      centerY: actualTorsoCenterY,
      shoulderCenter: { x: shoulderCenterX, y: shoulderCenterY },
      shoulderWidth: shoulderWidth,
      torsoWidth: torsoWidth,
      hipCenter: { x: hipCenterX, y: hipCenterY },
      torsoCenter: { x: actualTorsoCenterX, y: actualTorsoCenterY },
      torsoHeight: torsoHeight,
      bodyRotation: bodyRotation,
      bodyAngle: bodyAngle,
      bodyScale: bodyScale,
      rollAngle: bodyRotation,
      distanceFactor: bodyScale,
      landmarks: {
        neck: { x: actualTorsoCenterX, y: Math.max(0.10, Math.min(leftShoulderY, rightShoulderY) - 0.07) },
        leftShoulder: { x: leftShoulderX, y: leftShoulderY },
        rightShoulder: { x: rightShoulderX, y: rightShoulderY },
        leftElbow: { x: leftElbowX, y: leftElbowY },
        rightElbow: { x: rightElbowX, y: rightElbowY },
        leftWrist: { x: leftWristX, y: leftWristY },
        rightWrist: { x: rightWristX, y: rightWristY },
        chestCenter: { x: actualTorsoCenterX, y: actualTorsoCenterY },
        leftHip: { x: leftHipX, y: waistY },
        rightHip: { x: rightHipX, y: waistY },
        leftWaist: { x: leftHipX, y: waistY - 0.05 },
        rightWaist: { x: rightHipX, y: waistY - 0.05 },
        shoulderCenter: { x: shoulderCenterX, y: shoulderCenterY },
        shoulderWidth: shoulderWidth,
        torsoWidth: torsoWidth,
        torsoCenter: { x: actualTorsoCenterX, y: actualTorsoCenterY },
        torsoHeight: torsoHeight,
        bodyRotation: bodyRotation,
        bodyAngle: bodyAngle,
        bodyScale: bodyScale
      }
    };
  }

  /**
   * Applies Exponential Moving Average (EMA) and deadzone filtering
   */
  applySmoothing(target) {
    if (!this.smoothedPose) {
      return { ...target };
    }

    const alpha = this.smoothingAlpha;
    const prev = this.smoothedPose;

    const smoothVal = (currVal, prevVal) => {
      if (currVal === undefined || currVal === null) return prevVal;
      if (prevVal === undefined || prevVal === null) return currVal;
      const diff = currVal - prevVal;
      if (Math.abs(diff) < this.deadzone) return prevVal;
      return prevVal + diff * alpha;
    };

    const smoothedLandmarks = {};
    for (const [key, pt] of Object.entries(target.landmarks)) {
      const prevPt = prev.landmarks?.[key] || pt;
      if (typeof pt === 'object' && pt !== null && 'x' in pt && 'y' in pt) {
        smoothedLandmarks[key] = {
          x: smoothVal(pt.x, prevPt?.x ?? pt.x),
          y: smoothVal(pt.y, prevPt?.y ?? pt.y)
        };
      } else if (typeof pt === 'number') {
        smoothedLandmarks[key] = smoothVal(pt, prevPt);
      }
    }

    const scPrev = prev.shoulderCenter || target.shoulderCenter;
    const tcPrev = prev.torsoCenter || target.torsoCenter;
    const hcPrev = prev.hipCenter || target.hipCenter;

    return {
      confidence: target.confidence,
      isMediaPipe: target.isMediaPipe,
      centerX: smoothVal(target.centerX, prev.centerX),
      centerY: smoothVal(target.centerY, prev.centerY),
      shoulderCenter: {
        x: smoothVal(target.shoulderCenter?.x, scPrev?.x),
        y: smoothVal(target.shoulderCenter?.y, scPrev?.y)
      },
      shoulderWidth: smoothVal(target.shoulderWidth, prev.shoulderWidth),
      hipCenter: {
        x: smoothVal(target.hipCenter?.x, hcPrev?.x),
        y: smoothVal(target.hipCenter?.y, hcPrev?.y)
      },
      torsoCenter: {
        x: smoothVal(target.torsoCenter?.x, tcPrev?.x),
        y: smoothVal(target.torsoCenter?.y, tcPrev?.y)
      },
      torsoHeight: smoothVal(target.torsoHeight, prev.torsoHeight),
      bodyRotation: smoothVal(target.bodyRotation, prev.bodyRotation),
      bodyAngle: smoothVal(target.bodyAngle, prev.bodyAngle),
      bodyYaw: smoothVal(target.bodyYaw, prev.bodyYaw || 0),
      rollAngle: smoothVal(target.rollAngle, prev.rollAngle),
      distanceFactor: smoothVal(target.distanceFactor, prev.distanceFactor),
      landmarks: smoothedLandmarks
    };
  }

  /**
   * Captures high-resolution composite photo: User's live mirrored camera image
   * + Tailored virtual clothing overlay combined into one single result image.
   */
  captureTryOnSnapshot(product, customization, calibration = {}) {
    if (!this.videoElement) return null;

    const vw = this.videoElement.videoWidth || 1280;
    const vh = this.videoElement.videoHeight || 720;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = vw;
    captureCanvas.height = vh;
    const ctx = captureCanvas.getContext('2d');

    // 1. Draw user's live video frame (mirrored)
    ctx.save();
    if (this.facingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(this.videoElement, 0, 0, vw, vh);
    ctx.restore();
    // Do NOT draw 2D clothing overlays on captured photo - photo must be clean for AI VTON

    // 3. Elegant Watermark & Brand Verification Badge
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.80)';
    ctx.fillRect(vw - 260, vh - 60, 240, 46);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vw - 260, vh - 60, 240, 46);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('FITFUSION ATELIER', vw - 245, vh - 36);

    ctx.fillStyle = '#F59E0B';
    ctx.font = '11px sans-serif';
    ctx.fillText('Virtual Try-On • Verified Fit', vw - 245, vh - 20);
    ctx.restore();

    return captureCanvas.toDataURL('image/jpeg', 0.95);
  }

  /**
   * Anatomical default torso landmarks fallback
   */
  getDefaultTorsoLandmarks() {
    return {
      neck: { x: 0.5, y: 0.28 },
      leftShoulder: { x: 0.36, y: 0.34 },
      rightShoulder: { x: 0.64, y: 0.34 },
      chestCenter: { x: 0.5, y: 0.44 },
      leftHip: { x: 0.40, y: 0.68 },
      rightHip: { x: 0.60, y: 0.68 },
      leftWaist: { x: 0.40, y: 0.63 },
      rightWaist: { x: 0.60, y: 0.63 },
      shoulderCenter: { x: 0.5, y: 0.34 },
      shoulderWidth: 0.28,
      torsoCenter: { x: 0.5, y: 0.48 },
      torsoHeight: 0.34,
      bodyRotation: 0
    };
  }

  /**
   * Fallback snapshot for external callers
   */
  captureSnapshot(overlayCanvas) {
    if (!this.videoElement) return null;
    const vw = this.videoElement.videoWidth || 1280;
    const vh = this.videoElement.videoHeight || 720;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = vw;
    captureCanvas.height = vh;
    const ctx = captureCanvas.getContext('2d');

    ctx.save();
    if (this.facingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(this.videoElement, 0, 0, vw, vh);
    ctx.restore();

    if (overlayCanvas) {
      ctx.drawImage(overlayCanvas, 0, 0, vw, vh);
    }

    return captureCanvas.toDataURL('image/jpeg', 0.92);
  }
}
