"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader, Camera, X } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';

const currentYear = new Date().getFullYear();

const WINE_TYPES = {
  red:      { label: 'Red',      color: '#5c1a2e', bg: '#f5eef0', border: '#e0c8cf' },
  white:    { label: 'White',    color: '#8a7a30', bg: '#faf8e8', border: '#ddd8a0' },
  sparkling:{ label: 'Sparkling',color: '#c4724a', bg: '#fdf5f0', border: '#f0c8a8' },
  rose:     { label: 'Rosé',     color: '#b85c78', bg: '#fdf0f3', border: '#f0b8c8' },
  orange:   { label: 'Orange',   color: '#c47830', bg: '#fdf6ee', border: '#f0d0a0' },
};

const C = {
  burgundy: '#5c1a2e',
  cream: '#faf7f5',
  white: '#ffffff',
  border: '#e0d4ce',
  borderLight: '#e8e0d8',
  muted: '#b5a09a',
  body: '#8a7a75',
  sageDark: '#4a7a50',
  sageBg: 'rgba(122,158,126,0.12)',
  sageBorder: 'rgba(122,158,126,0.3)',
};

function isInPeakWindow(wine) {
  if (!wine.aiData?.peakWindow) return false;
  const { start, end } = wine.aiData.peakWindow;
  return currentYear >= start && currentYear <= end;
}

async function fetchWineInfo(wineName, vintage, region = '') {
  const response = await fetch('/api/wine-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wineName, vintage, region })
  });
  const data = await response.json();
  const text = data.content.map(i => i.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

function detectWineType(wineName, aiData) {
  const type = (aiData?.wineType || '').toLowerCase();
  const name = wineName.toLowerCase();
  if (type.includes('sparkling') || type.includes('champagne') || type.includes('prosecco') ||
      name.includes('champagne') || name.includes('prosecco') || name.includes('cava') ||
      name.includes('sparkling') || name.includes('crémant')) return 'sparkling';
  if (type.includes('orange') || name.includes('orange') || name.includes('ramato')) return 'orange';
  if (type.includes('ros') || name.includes('ros') || name.includes('rosato') || name.includes('rosado')) return 'rose';
  if (type.includes('white') || name.includes('blanc') || name.includes('grigio') ||
      name.includes('chardonnay') || name.includes('riesling') || name.includes('sauvignon blanc') ||
      name.includes('pinot grigio') || name.includes('viognier') || name.includes('albarino')) return 'white';
  return 'red';
}

// Resize image to max 1024px before sending
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 1024;
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Capture frame from video as base64
function captureFrame(videoEl) {
  const canvas = document.createElement('canvas');
  const maxSize = 1024;
  let { videoWidth: width, videoHeight: height } = videoEl;
  if (width > height) {
    if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
  } else {
    if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
  }
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(videoEl, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
}

// Camera Viewfinder Component
function CameraViewfinder({ onCapture, onClose, onFallback }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setCameraReady] = useState(false);
  const [error, setCameraError] = useState('');

  useEffect(() => {
    let active = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        if (!active) return;
        if (err.name === 'NotAllowedError') {
          setCameraError('Camera access denied. Please allow camera access in your browser settings, or use the upload option below.');
        } else if (err.name === 'NotFoundError') {
          setCameraError('No camera found on this device. Please use the upload option below.');
        } else {
          setCameraError('Could not access camera. Please use the upload option below.');
        }
      }
    }
    startCamera();
    return () => {
      active = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && ready) {
      const base64 = captureFrame(videoRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      onCapture(base64);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Close button */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '48px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <p style={{ color: '#fff', fontSize: '14px', margin: 0, opacity: 0.8 }}>Point camera at wine label</p>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>
      </div>

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ flex: 1, objectFit: 'cover', width: '100%' }}
      />

      {/* Label guide overlay */}
      {ready && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70%', height: '40%', border: '2px solid rgba(255,255,255,0.6)', borderRadius: '12px', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: '20px' }}>
            <p style={{ color: '#fff', fontSize: '11px', margin: 0, whiteSpace: 'nowrap' }}>Align label within frame</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', background: 'rgba(0,0,0,0.85)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: '14px', margin: '0 0 16px', lineHeight: '1.5' }}>{error}</p>
          <button onClick={onFallback} style={{ background: C.burgundy, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
            Upload Photo Instead
          </button>
        </div>
      )}

      {/* Loading state */}
      {!ready && !error && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <Loader size={32} style={{ color: '#fff', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: '#fff', fontSize: '14px', margin: 0 }}>Starting camera...</p>
        </div>
      )}

      {/* Bottom controls */}
      <div style={{ padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
        {ready && (
          <button
            onClick={handleCapture}
            style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', border: '2px solid #ddd' }} />
          </button>
        )}
        <button onClick={onFallback} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.8)', borderRadius: '20px', padding: '8px 20px', fontSize: '12px', cursor: 'pointer' }}>
          Upload from gallery instead
        </button>
      </div>
    </div>
  );
}

export default function MiVinoApp() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [wines, setWines] = useState(() => {
    try {
      const saved = localStorage.getItem('mivino_wines');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWine, setNewWine] = useState({ name: '', vintage: 2020, price: 0 });
  const [expandedWine, setExpandedWine] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanError, setScanError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('mivino_wines', JSON.stringify(wines)); } catch {}
  }, [wines]);

  const processBase64 = useCallback(async (base64) => {
    setShowCamera(false);
    setScanning(true);
    setScanError('');
    try {
      const response = await fetch('/api/scan-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      });
      const data = await response.json();
      if (data.error) { setScanError(data.error); setScanning(false); return; }
      const { wineName, vintage, region = '' } = data;
      const id = Date.now();
      const guessedType = detectWineType(wineName, null);
      setWines(prev => [...prev, { name: wineName, vintage, price: 0, id, wineType: guessedType, aiData: null, aiLoading: true, aiError: false }]);
      setExpandedWine(id);
      setScanning(false);
      try {
        const aiData = await fetchWineInfo(wineName, vintage, region);
        const aiType = detectWineType(wineName, aiData);
        setWines(prev => prev.map(w => w.id === id ? { ...w, aiData, aiLoading: false, wineType: aiType } : w));
      } catch {
        setWines(prev => prev.map(w => w.id === id ? { ...w, aiLoading: false, aiError: true } : w));
      }
    } catch {
      setScanError('Could not process image. Please try again.');
      setScanning(false);
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImage(file);
      await processBase64(base64);
    } catch {
      setScanError('Could not read image file. Please try again.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddWine = async () => {
    if (!newWine.name) return;
    const vintage = parseInt(newWine.vintage);
    const price = parseFloat(newWine.price);
    if (vintage < 1800 || vintage > currentYear) { alert('Please enter a valid vintage year.'); return; }
    if (price < 0) { alert('Price cannot be negative.'); return; }
    const id = Date.now();
    const guessedType = detectWineType(newWine.name, null);
    setWines(prev => [...prev, { ...newWine, vintage, price, id, wineType: guessedType, aiData: null, aiLoading: true, aiError: false }]);
    setNewWine({ name: '', vintage: 2020, price: 0 });
    setShowAddForm(false);
    setExpandedWine(id);
    try {
      const aiData = await fetchWineInfo(newWine.name, vintage, '');
      const aiType = detectWineType(newWine.name, aiData);
      setWines(prev => prev.map(w => w.id === id ? { ...w, aiData, aiLoading: false, wineType: aiType } : w));
    } catch {
      setWines(prev => prev.map(w => w.id === id ? { ...w, aiLoading: false, aiError: true } : w));
    }
  };

  const handleRemoveWine = (id) => {
    setWines(wines.filter(w => w.id !== id));
    if (expandedWine === id) setExpandedWine(null);
  };

  const handleChangeType = (id, type) => {
    setWines(prev => prev.map(w => w.id === id ? { ...w, wineType: type } : w));
    setEditingType(null);
  };

  const peakCount = wines.filter(isInPeakWindow).length;
  const totalValue = wines.reduce((sum, w) => sum + (w.price || 0), 0);

  const inputStyle = {
    width: '100%', padding: '12px 14px', marginBottom: '12px',
    background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px',
    color: C.burgundy, fontSize: '15px', boxSizing: 'border-box', outline: 'none',
  };

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={32} style={{ color: C.burgundy, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: 'system-ui, sans-serif' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Hidden file input fallback */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* Camera Viewfinder */}
      {showCamera && (
        <CameraViewfinder
          onCapture={processBase64}
          onClose={() => setShowCamera(false)}
          onFallback={() => { setShowCamera(false); fileInputRef.current?.click(); }}
        />
      )}

      {/* Header */}
      <div style={{ background: C.white, padding: '48px 20px 20px', borderBottom: `1px solid ${C.borderLight}` }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <svg width="44" height="44" viewBox="-5 -5 58 54" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="4"  r="4" fill="#5c1a2e"/>
              <circle cx="14" cy="16" r="4" fill="#5c1a2e"/>
              <circle cx="30" cy="16" r="4" fill="#5c1a2e"/>
              <circle cx="6"  cy="28" r="4" fill="#5c1a2e"/>
              <circle cx="22" cy="28" r="4" fill="#5c1a2e"/>
              <circle cx="38" cy="28" r="4" fill="#5c1a2e"/>
              <circle cx="0"  cy="40" r="4" fill="#5c1a2e"/>
              <circle cx="14" cy="40" r="4" fill="#5c1a2e"/>
              <circle cx="30" cy="40" r="4" fill="#5c1a2e"/>
              <circle cx="44" cy="40" r="4" fill="#5c1a2e"/>
            </svg>
            <div>
              <p style={{ color: C.muted, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 4px' }}>Your Cellar</p>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '500', color: C.burgundy }}>MiVino</h1>
              <p style={{ margin: '3px 0 0', color: C.muted, fontSize: '13px' }}>{user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]} · {wines.length} {wines.length === 1 ? 'bottle' : 'bottles'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            style={{ background: 'none', border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: '500px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Bottles', value: wines.length, color: C.burgundy },
            { label: 'Value', value: `$${totalValue}`, color: C.burgundy },
            { label: 'Peak Now', value: peakCount, color: peakCount > 0 ? C.sageDark : C.muted },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.white, borderRadius: '14px', padding: '14px 12px', border: `1px solid ${C.borderLight}` }}>
              <p style={{ color: C.muted, fontSize: '10px', margin: '0 0 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontSize: '22px', fontWeight: '500', margin: 0, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setShowAddForm(true)} style={{ padding: '14px', background: C.burgundy, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>
            + Add Wine
          </button>
          <button
            onClick={() => { setScanError(''); setShowCamera(true); }}
            disabled={scanning}
            style={{ padding: '14px', background: C.white, color: scanning ? C.muted : C.burgundy, border: `1px solid ${C.border}`, borderRadius: '12px', fontWeight: '500', fontSize: '14px', cursor: scanning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {scanning ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={14} />}
            {scanning ? 'Scanning...' : 'Scan Label'}
          </button>
        </div>

        {/* Scan Error */}
        {scanError && (
          <div style={{ background: '#fdf0f0', border: '1px solid #f0c8c8', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px', color: '#b91c1c', fontSize: '13px' }}>{scanError}</p>
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.burgundy, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
              Upload photo instead
            </button>
          </div>
        )}

        {/* Collection Label */}
        <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: C.muted, margin: '0 0 12px', textTransform: 'uppercase' }}>Collection</p>

        {/* Wine List */}
        {wines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
            <p style={{ fontSize: '16px', margin: '0 0 6px', color: C.burgundy, fontWeight: '500' }}>Your cellar is empty</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Add a wine manually or scan a label to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {wines.map(wine => {
              const isPeak = isInPeakWindow(wine);
              const isExpanded = expandedWine === wine.id;
              const wineType = WINE_TYPES[wine.wineType || 'red'];
              const isEditingThisType = editingType === wine.id;
              return (
                <div key={wine.id} style={{ background: C.white, borderRadius: '16px', border: `1px solid ${isPeak ? C.sageBorder : C.borderLight}`, overflow: 'hidden' }}>
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                        <p style={{ margin: 0, fontWeight: '500', fontSize: '15px', color: wineType.color }}>{wine.name}</p>
                        {isPeak && (
                          <span style={{ fontSize: '10px', background: C.sageBg, color: C.sageDark, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${C.sageBorder}` }}>Peak Now</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, color: C.muted, fontSize: '12px' }}>
                          {wine.vintage}{wine.aiData?.region ? ` · ${wine.aiData.region}` : ''}
                        </p>
                        <button
                          onClick={() => setEditingType(isEditingThisType ? null : wine.id)}
                          style={{ background: wineType.bg, border: `1px solid ${wineType.border}`, color: wineType.color, fontSize: '10px', padding: '2px 8px', borderRadius: '20px', cursor: 'pointer' }}
                        >
                          {wineType.label}
                        </button>
                      </div>
                      {isEditingThisType && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                          {Object.entries(WINE_TYPES).map(([key, t]) => (
                            <button key={key} onClick={() => handleChangeType(wine.id, key)}
                              style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.color, fontSize: '11px', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', fontWeight: wine.wineType === key ? '600' : '400' }}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
                      <p style={{ margin: 0, color: C.burgundy, fontWeight: '500', fontSize: '14px' }}>${wine.price}</p>
                      <button onClick={() => setExpandedWine(isExpanded ? null : wine.id)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px' }} aria-label="Toggle details">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button onClick={() => handleRemoveWine(wine.id)} style={{ background: 'none', border: 'none', color: C.border, cursor: 'pointer', padding: '4px' }} aria-label="Remove wine">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${C.borderLight}`, padding: '16px' }}>
                      {wine.aiLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted }}>
                          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontSize: '13px' }}>Consulting AI sommelier...</span>
                        </div>
                      )}
                      {wine.aiError && <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>Could not fetch wine info. Please try again later.</p>}
                      {wine.aiData && (
                        <div style={{ display: 'grid', gap: '14px' }}>
                          <div>
                            <p style={{ margin: '0 0 5px', color: C.muted, fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tasting Notes</p>
                            <p style={{ margin: 0, color: C.body, fontSize: '13px', lineHeight: '1.6' }}>{wine.aiData.tastingNotes}</p>
                          </div>
                          {wine.aiData.grapeVarieties && (
                            <div>
                              <p style={{ margin: '0 0 5px', color: C.muted, fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Grape Varieties</p>
                              <p style={{ margin: 0, color: C.body, fontSize: '13px', lineHeight: '1.6' }}>{wine.aiData.grapeVarieties}</p>
                            </div>
                          )}
                          <div>
                            <p style={{ margin: '0 0 8px', color: C.muted, fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Food Pairings</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {wine.aiData.foodPairings?.map((food, i) => (
                                <span key={i} style={{ background: C.cream, color: C.body, fontSize: '12px', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${C.border}` }}>{food}</span>
                              ))}
                            </div>
                          </div>
                          {wine.aiData.winemaking && (
                            <div>
                              <p style={{ margin: '0 0 5px', color: C.muted, fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Winemaking</p>
                              <p style={{ margin: 0, color: C.body, fontSize: '13px', lineHeight: '1.6' }}>{wine.aiData.winemaking}</p>
                            </div>
                          )}
                          <div style={{ background: isPeak ? C.sageBg : C.cream, borderRadius: '10px', padding: '12px', border: `1px solid ${isPeak ? C.sageBorder : C.border}` }}>
                            <p style={{ margin: '0 0 4px', color: isPeak ? C.sageDark : C.muted, fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Peak Window · {wine.aiData.peakWindow?.start}–{wine.aiData.peakWindow?.end}
                            </p>
                            <p style={{ margin: 0, color: C.body, fontSize: '13px' }}>{wine.aiData.peakSummary}</p>
                          </div>
                          {wine.aiData.wineryUrl && (
                            <div>
                              <p style={{ margin: '0 0 8px', color: C.muted, fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Links</p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <a href={wine.aiData.wineryUrl} target="_blank" rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: C.cream, color: C.burgundy, fontSize: '12px', padding: '6px 12px', borderRadius: '20px', border: `1px solid ${C.border}`, textDecoration: 'none', fontWeight: '500' }}>
                                  🍷 Winery Website
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Wine Modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(92,26,46,0.3)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '28px 24px 36px', width: '100%', maxWidth: '500px' }}>
            <div style={{ width: '36px', height: '4px', background: C.border, borderRadius: '2px', margin: '0 auto 24px' }} />
            <h2 style={{ margin: '0 0 6px', color: C.burgundy, fontWeight: '500', fontSize: '20px' }}>Add Wine</h2>
            <p style={{ margin: '0 0 20px', color: C.muted, fontSize: '13px' }}>AI will fetch region, tasting notes, type & peak window.</p>
            <input type="text" placeholder="Wine name (e.g. Barolo, Château Margaux)" value={newWine.name} onChange={e => setNewWine({ ...newWine, name: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Vintage year" value={newWine.vintage} onChange={e => setNewWine({ ...newWine, vintage: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Price ($)" value={newWine.price} min="0" onChange={e => setNewWine({ ...newWine, price: e.target.value })} style={{ ...inputStyle, marginBottom: '20px' }} />
            <button onClick={handleAddWine} style={{ width: '100%', padding: '14px', background: C.burgundy, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
              Add to Cellar
            </button>
            <button onClick={() => setShowAddForm(false)} style={{ width: '100%', padding: '14px', background: 'none', color: C.muted, border: `1px solid ${C.border}`, borderRadius: '12px', fontSize: '15px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
