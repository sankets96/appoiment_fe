'use client';

/**
 * ProfilePhotoEditor
 * ------------------
 * A modal photo editor for avatar uploads.
 *
 * Flow:
 *   1. User opens the modal — empty state shows "Drag & drop or click to upload".
 *   2. They drop/select a file — it previews in a circular crop stage.
 *   3. They pan (drag), zoom (slider / +/-), and rotate (90° steps) freely.
 *   4. On Save, the visible square is rendered to a 1024×1024 canvas and
 *      handed back to the parent as a JPEG File via the `onSave` callback.
 *
 * The editor is fully self-contained: it does not touch the network.
 * The parent is responsible for POSTing the resulting File to the backend.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from './index';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const OUTPUT_SIZE = 1024;
const JPEG_QUALITY = 0.92;

const ZoomIcon = ({ type }) =>
  type === 'in' ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );

const RotateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ResetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const CameraIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SpinnerIcon = () => (
  <span className="ppe-spinner" aria-hidden="true" />
);

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function ProfilePhotoEditor({ open, onClose, onSave, currentPhotoUrl }) {
  const toast = useToast();
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragStateRef = useRef(null); // { startX, startY, originX, originY, active }

  const [image, setImage] = useState(null); // { url, naturalW, naturalH, file }
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(false);

  // Reset everything when the modal opens/closes
  useEffect(() => {
    if (!open) {
      // Defer cleanup so the close animation can finish if any.
      const t = setTimeout(() => {
        if (image?.url) URL.revokeObjectURL(image.url);
        setImage(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
        setRotation(0);
        setDragging(false);
        setSaving(false);
        setDragOverStage(false);
        setStageSize(320);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track stage size (so we can size the loaded <img> to match the visible
  // stage). Re-measure on resize.
  const [stageSize, setStageSize] = useState(320);
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = stageRef.current?.getBoundingClientRect();
      if (r?.width) setStageSize(r.width);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [open, image]);

  // Escape key closes the modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  const validateFile = useCallback(
    (file) => {
      if (!file) return false;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast?.showToast(
          'Please choose a JPG, PNG, GIF, or WebP image.',
          'error',
          'Invalid file type'
        );
        return false;
      }
      if (file.size > MAX_BYTES) {
        toast?.showToast('Image must be 5 MB or smaller.', 'error', 'File too large');
        return false;
      }
      return true;
    },
    [toast]
  );

  const loadFile = useCallback(
    (file) => {
      if (!validateFile(file)) return;
      // Revoke previous blob URL
      if (image?.url) URL.revokeObjectURL(image.url);
      const url = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        setImage({ url, naturalW: probe.naturalWidth, naturalH: probe.naturalHeight, file });
        setScale(1);
        setOffset({ x: 0, y: 0 });
        setRotation(0);
      };
      probe.onerror = () => {
        URL.revokeObjectURL(url);
        toast?.showToast('We could not read that image. Try another file.', 'error', 'Read failed');
      };
      probe.src = url;
    },
    [image, validateFile, toast]
  );

  const onFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = ''; // allow re-selecting the same file
  };

  // ── Pointer drag (mouse + touch + pen) ──────────────────────
  const onPointerDown = (e) => {
    if (!image || saving) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
      active: true,
    };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    const ds = dragStateRef.current;
    if (!ds?.active) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    setOffset({ x: ds.originX + dx, y: ds.originY + dy });
  };

  const endDrag = (e) => {
    if (!dragStateRef.current?.active) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragStateRef.current.active = false;
    setDragging(false);
  };

  // ── Drag and drop on the stage ─────────────────────────────
  const onDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.types?.includes('Files')) setDragOverStage(true);
  };
  const onDragLeave = () => setDragOverStage(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOverStage(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) loadFile(f);
  };

  // ── Toolbar actions ────────────────────────────────────────
  const setScaleClamped = (s) => setScale(clamp(s, MIN_SCALE, MAX_SCALE));

  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  // ── Canvas crop → JPEG File ────────────────────────────────
  // Strategy:
  //   1. The CSS renders the image inside `.ppe-canvas` with a `cover`-fit
  //      base size: `Math.max(stage/stage) * min(naturalW, naturalH)`, so
  //      the image's shorter side equals the stage and the longer side
  //      spills outside. That matches what the user sees.
  //   2. We reproduce that in canvas: draw the image at the displayed
  //      size onto an offscreen canvas, then sample the centered square
  //      out of it. Rotation, user scale, and pan are all applied on
  //      the offscreen canvas so the math stays in one coordinate space.
  const buildCroppedFile = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!image) return reject(new Error('No image loaded'));
      const stage = stageRef.current;
      if (!stage) return reject(new Error('Stage missing'));

      const stageRect = stage.getBoundingClientRect();
      const stageSize = stageRect.width; // square

      const source = new Image();
      source.onload = () => {
        // Base "fit cover" sizing: the image's shorter visible side
        // equals the stage size. The user scale multiplies on top.
        const baseScale = Math.max(
          stageSize / image.naturalW,
          stageSize / image.naturalH
        );
        const dispW = image.naturalW * baseScale * scale;
        const dispH = image.naturalH * baseScale * scale;

        const centerX = stageSize / 2;
        const centerY = stageSize / 2;

        // Offscreen canvas matching the displayed (post-rotation) bounding box.
        // For non-90° rotations we approximate by taking the diagonal so
        // nothing gets clipped; for 90° multiples it is exact.
        const absCos = Math.abs(Math.cos((rotation * Math.PI) / 180));
        const absSin = Math.abs(Math.sin((rotation * Math.PI) / 180));
        const offW = Math.ceil(dispW * absCos + dispH * absSin);
        const offH = Math.ceil(dispW * absSin + dispH * absCos);

        const off = document.createElement('canvas');
        off.width = offW;
        off.height = offH;
        const offCtx = off.getContext('2d');
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = 'high';
        offCtx.translate(offW / 2, offH / 2);
        offCtx.rotate((rotation * Math.PI) / 180);
        offCtx.drawImage(
          source,
          -dispW / 2,
          -dispH / 2,
          dispW,
          dispH
        );

        // Position of the offscreen canvas in stage coordinates.
        // The displayed image's center is at (centerX + offset.x, centerY + offset.y).
        const offLeft = centerX + offset.x - offW / 2;
        const offTop = centerY + offset.y - offH / 2;

        // Sample the visible square out of the offscreen canvas.
        const sx = clamp(-offLeft, 0, offW);
        const sy = clamp(-offTop, 0, offH);
        const sw = clamp(stageSize - Math.max(0, offLeft), 0, offW - sx);
        const sh = clamp(stageSize - Math.max(0, offTop), 0, offH - sy);

        if (sw <= 0 || sh <= 0) {
          return reject(new Error('Image is fully outside the visible area. Reset and try again.'));
        }

        const out = document.createElement('canvas');
        out.width = OUTPUT_SIZE;
        out.height = OUTPUT_SIZE;
        const ctx = out.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        ctx.drawImage(off, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        out.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Could not encode image'));
            const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      };
      source.onerror = () => reject(new Error('Failed to decode source image'));
      source.src = image.url;
    });
  }, [image, scale, offset, rotation]);

  const handleSave = async () => {
    if (!image || saving) return;
    setSaving(true);
    try {
      const file = await buildCroppedFile();
      await onSave?.(file);
      // Parent is responsible for closing on success, but close here too
      // in case the parent forgot. Safe because we check `saving` in onClose.
      onClose?.();
    } catch (err) {
      toast?.showToast(err.message || 'Failed to process image', 'error', 'Crop failed');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // Base "fit-cover" size: image's SHORTER side equals the stage at
  // scale=1; the longer side spills outside the visible circle. This
  // must match the canvas math in `buildCroppedFile` so the saved crop
  // matches what the user sees.
  const coverScale = image
    ? Math.max(stageSize / image.naturalW, stageSize / image.naturalH)
    : 0;
  const baseFitW = image ? image.naturalW * coverScale : 0;
  const baseFitH = image ? image.naturalH * coverScale : 0;

  return (
    <div
      className="ppe-backdrop fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
      }}
    >
      <div className="ppe-modal" role="dialog" aria-modal="true" aria-label="Edit profile photo">
        {/* Header */}
        <div className="ppe-header">
          <div className="ppe-title">Edit profile photo</div>
          <button
            type="button"
            className="ppe-close"
            onClick={() => !saving && onClose?.()}
            aria-label="Close"
            disabled={saving}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Stage */}
        <div className="ppe-stage-wrap">
          <div
            ref={stageRef}
            className={`ppe-stage${dragOverStage ? ' ppe-stage--over' : ''}${image ? ' ppe-stage--loaded' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !image && fileInputRef.current?.click()}
          >
            {/* The visible circular mask is implemented with a CSS clip-path
                on the inner layer so the image transform stays simple. */}
            <div className="ppe-mask">
              {image ? (
                <div
                  className="ppe-canvas"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                >
                  <div
                    className="ppe-img-wrap"
                    style={{
                      width: baseFitW,
                      height: baseFitH,
                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale}) rotate(${rotation}deg)`,
                      transition: dragging ? 'none' : 'transform 0.18s ease',
                    }}
                  >
                    <img
                      src={image.url}
                      alt="Selected photo preview"
                      draggable={false}
                      className="ppe-img"
                    />
                  </div>
                </div>
              ) : (
                <div className="ppe-empty">
                  <div className="ppe-empty-icon"><CameraIcon /></div>
                  <div className="ppe-empty-title">Add a profile photo</div>
                  <div className="ppe-empty-sub">Drag &amp; drop an image here, or</div>
                  <button
                    type="button"
                    className="ppe-empty-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Choose photo
                  </button>
                  <div className="ppe-empty-hint">JPG, PNG, GIF, or WebP · up to 5 MB</div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden file input — used by both empty state and drop fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            style={{ display: 'none' }}
            onChange={onFileInput}
          />
        </div>

        {/* Toolbar — only when an image is loaded */}
        {image && (
          <div className="ppe-toolbar">
            <button
              type="button"
              className="ppe-iconbtn"
              onClick={() => setScaleClamped(scale - 0.1)}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomIcon type="out" />
            </button>
            <div className="ppe-zoom-wrap">
              <input
                type="range"
                min={MIN_SCALE}
                max={MAX_SCALE}
                step={0.01}
                value={scale}
                onChange={(e) => setScaleClamped(Number(e.target.value))}
                className="ppe-zoom"
                aria-label="Zoom"
              />
              <div className="ppe-zoom-readout">{Math.round(scale * 100)}%</div>
            </div>
            <button
              type="button"
              className="ppe-iconbtn"
              onClick={() => setScaleClamped(scale + 0.1)}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIcon type="in" />
            </button>

            <div className="ppe-toolbar-divider" />

            <button
              type="button"
              className="ppe-iconbtn"
              onClick={handleRotate}
              aria-label="Rotate 90°"
              title="Rotate"
            >
              <RotateIcon />
            </button>
            <button
              type="button"
              className="ppe-iconbtn"
              onClick={handleReset}
              aria-label="Reset"
              title="Reset"
            >
              <ResetIcon />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="ppe-footer">
          <button
            type="button"
            className="ppe-btn ppe-btn--ghost"
            onClick={() => !saving && onClose?.()}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ppe-btn ppe-btn--primary"
            onClick={handleSave}
            disabled={!image || saving}
          >
            {saving ? (
              <>
                <SpinnerIcon /> Saving…
              </>
            ) : (
              'Save photo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
