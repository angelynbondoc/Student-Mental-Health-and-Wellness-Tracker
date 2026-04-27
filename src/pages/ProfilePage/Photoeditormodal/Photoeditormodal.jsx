// =============================================================================
// PhotoEditorModal.jsx
// Full-screen modal for profile picture selection and positioning.
//
// Features:
//   - Preset avatar gallery (NEU-themed illustrated avatars via DiceBear API)
//   - Upload custom photo (drag & drop or file picker)
//   - Drag to reposition the photo inside the circular crop frame
//   - Zoom slider to scale the image
//   - Live circular preview
// =============================================================================
import React, { useState, useRef, useCallback,  } from "react";
import { X, Upload, ZoomIn, ZoomOut, Check, RefreshCw } from "lucide-react";
import "./PhotoEditorModal.css";

// ── Preset avatars — DiceBear "thumbs" style (SVG, no attribution needed) ────
// Each seed produces a unique illustrated character
const PRESET_SEEDS = [
  "felix",
  "luna",
  "kai",
  "nova",
  "river",
  "sage",
  "eden",
  "quinn",
  "blake",
  "skye",
  "morgan",
  "drew",
  "alex",
  "jamie",
  "casey",
  "riley",
  "taylor",
  "jordan",
  "avery",
  "hayden",
  "reese",
  "peyton",
];

const AVATAR_STYLE = "thumbs"; // DiceBear style

function presetUrl(seed) {
  return `https://api.dicebear.com/7.x/${AVATAR_STYLE}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear`;
}

// ── Circular crop preview ─────────────────────────────────────────────────────
function CropCircle({ src, offsetX, offsetY, scale, size = 160, isPreset }) {
  if (!src)
    return (
      <div
        className="pem-crop-placeholder"
        style={{ width: size, height: size }}
      >
        <Upload size={28} />
        <span>No photo yet</span>
      </div>
    );

  if (isPreset)
    return (
      <div className="pem-crop-circle" style={{ width: size, height: size }}>
        <img
          src={src}
          alt="avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );

  return (
    <div
      className="pem-crop-circle"
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      <img
        src={src}
        alt="preview"
        style={{
          position: "absolute",
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          transformOrigin: "center center",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function PhotoEditorModal({ current, onSave, onClose }) {
  const [tab, setTab] = useState(() =>
    current && !current.startsWith("https://api.dicebear")
      ? "upload"
      : "presets",
  );
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Upload state
  const [uploadSrc, setUploadSrc] = useState(() =>
    current && !current.startsWith("https://api.dicebear") ? current : null,
  );
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const cropRef = useRef(null);



  // ── File handling ──────────────────────────────────────────────────────────
  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadSrc(e.target.result);
      setOffsetX(0);
      setOffsetY(0);
      setScale(1);
      setSelectedPreset(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFilePick = (e) => loadFile(e.target.files?.[0]);
  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    loadFile(e.dataTransfer.files?.[0]);
  };

  // ── Drag-to-reposition ────────────────────────────────────────────────────
  const onMouseDown = useCallback(
    (e) => {
      if (!uploadSrc) return;
      e.preventDefault();
      setDragging(true);
      setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    },
    [uploadSrc, offsetX, offsetY],
  );

  const onMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      setOffsetX(e.clientX - dragStart.x);
      setOffsetY(e.clientY - dragStart.y);
    },
    [dragging, dragStart],
  );

  const onMouseUp = useCallback(() => setDragging(false), []);

  // Touch support
  const onTouchStart = useCallback(
    (e) => {
      if (!uploadSrc) return;
      const t = e.touches[0];
      setDragging(true);
      setDragStart({ x: t.clientX - offsetX, y: t.clientY - offsetY });
    },
    [uploadSrc, offsetX, offsetY],
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      setOffsetX(t.clientX - dragStart.x);
      setOffsetY(t.clientY - dragStart.y);
    },
    [dragging, dragStart],
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (tab === "presets" && selectedPreset) {
      onSave({ photo_url: presetUrl(selectedPreset), is_preset: true });
    } else if (tab === "upload" && uploadSrc) {
      // For upload, save src + positioning metadata
      onSave({
        photo_url: uploadSrc,
        offsetX,
        offsetY,
        scale,
        is_preset: false,
      });
    }
  };

  const canSave =
    (tab === "presets" && selectedPreset) || (tab === "upload" && uploadSrc);

  return (
    <div className="pem-overlay" onClick={onClose}>
      <div className="pem-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pem-header">
          <h2 className="pem-title">Choose Profile Picture</h2>
          <button className="pem-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="pem-tabs">
          <button
            className={`pem-tab${tab === "presets" ? " pem-tab--active" : ""}`}
            onClick={() => setTab("presets")}
          >
            Preset Avatars
          </button>
          <button
            className={`pem-tab${tab === "upload" ? " pem-tab--active" : ""}`}
            onClick={() => setTab("upload")}
          >
            Upload Photo
          </button>
        </div>

        <div className="pem-body">
          {/* ── PRESETS TAB ─────────────────────────────────────────────── */}
          {tab === "presets" && (
            <div className="pem-presets-layout">
              <div className="pem-presets-grid">
                {PRESET_SEEDS.map((seed) => {
                  const url = presetUrl(seed);
                  const active = selectedPreset === seed;
                  return (
                    <button
                      key={seed}
                      className={`pem-preset-item${active ? " pem-preset-item--active" : ""}`}
                      onClick={() => setSelectedPreset(seed)}
                      title={seed}
                    >
                      <img
                        src={url}
                        alt={seed}
                        className="pem-preset-img"
                        loading="lazy"
                      />
                      {active && (
                        <div className="pem-preset-check">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live preview */}
              <div className="pem-preview-col">
                <p className="pem-preview-label">Preview</p>
                <CropCircle
                  src={selectedPreset ? presetUrl(selectedPreset) : null}
                  isPreset
                  size={120}
                />
                {!selectedPreset && (
                  <p className="pem-preview-hint">Select an avatar above</p>
                )}
              </div>
            </div>
          )}

          {/* ── UPLOAD TAB ──────────────────────────────────────────────── */}
          {tab === "upload" && (
            <div className="pem-upload-layout">
              {/* Drop zone (shown when no image loaded) */}
              {!uploadSrc && (
                <div
                  className={`pem-dropzone${dragOver ? " pem-dropzone--over" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="pem-drop-icon">
                    <Upload size={28} />
                  </div>
                  <p className="pem-drop-main">Drag & drop your photo here</p>
                  <p className="pem-drop-sub">
                    or click to browse · PNG, JPG, WEBP
                  </p>
                </div>
              )}

              {/* Editor (shown when image loaded) */}
              {uploadSrc && (
                <div className="pem-editor">
                  <p className="pem-editor-hint">
                    Drag inside the circle to reposition
                  </p>

                  {/* Crop frame with drag */}
                  <div
                    ref={cropRef}
                    className={`pem-crop-wrap${dragging ? " pem-crop-wrap--dragging" : ""}`}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onMouseUp}
                  >
                    <CropCircle
                      src={uploadSrc}
                      offsetX={offsetX}
                      offsetY={offsetY}
                      scale={scale}
                      size={200}
                      isPreset={false}
                    />
                    <div className="pem-crop-ring" />
                  </div>

                  {/* Zoom slider */}
                  <div className="pem-zoom-row">
                    <button
                      className="pem-zoom-btn"
                      onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <input
                      type="range"
                      className="pem-zoom-slider"
                      min={0.5}
                      max={3}
                      step={0.05}
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                    />
                    <button
                      className="pem-zoom-btn"
                      onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>

                  {/* Change / reset */}
                  <div className="pem-editor-actions">
                    <button
                      className="pem-text-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={13} /> Change photo
                    </button>
                    <button
                      className="pem-text-btn pem-text-btn--danger"
                      onClick={() => {
                        setUploadSrc(null);
                        setOffsetX(0);
                        setOffsetY(0);
                        setScale(1);
                      }}
                    >
                      <X size={13} /> Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="pem-file-hidden"
                onChange={handleFilePick}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pem-footer">
          <button className="pp-btn pp-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="pp-btn pp-btn--primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            <Check size={14} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
}
