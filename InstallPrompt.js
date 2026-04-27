"use client";

import React, { useState, useEffect } from 'react';

// Colors matching MiVino design
var C = {
  burgundy: '#5c1a2e',
  cream: '#faf7f5',
  white: '#ffffff',
  border: '#e0d4ce',
  muted: '#b5a09a',
};

export default function InstallPrompt() {
  var [showPrompt, setShowPrompt] = useState(false);
  var [deferredPrompt, setDeferredPrompt] = useState(null);
  var [isIOS, setIsIOS] = useState(false);
  var [isStandalone, setIsStandalone] = useState(false);

  useEffect(function() {
    // Check if already installed as PWA
    var standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Don't show if already installed
    if (standalone) return;

    // Check if dismissed recently (don't nag — show again after 7 days)
    var dismissed = localStorage.getItem('mivino-install-dismissed');
    if (dismissed) {
      var dismissedDate = parseInt(dismissed);
      var sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedDate < sevenDays) return;
    }

    // Detect iOS
    var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isiOS);

    // On Android/Chrome, capture the install prompt
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS, show custom instructions after a short delay
    // (iOS doesn't fire beforeinstallprompt)
    if (isiOS) {
      var timer = setTimeout(function() {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds so it doesn't interrupt sign-in
    }

    return function() {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  var handleInstall = async function() {
    if (deferredPrompt) {
      // Android/Chrome: trigger native install prompt
      deferredPrompt.prompt();
      var result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  var handleDismiss = function() {
    setShowPrompt(false);
    localStorage.setItem('mivino-install-dismissed', Date.now().toString());
  };

  // Don't render if already installed or not ready to show
  if (isStandalone || !showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 2500,
      padding: '0 16px 16px',
      pointerEvents: 'none',
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        background: C.white,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 -4px 24px rgba(92, 26, 46, 0.15)',
        border: '1px solid ' + C.border,
        pointerEvents: 'auto',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="32" height="32" viewBox="-5 -5 58 54" xmlns="http://www.w3.org/2000/svg">
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
              <p style={{ margin: 0, fontWeight: '500', fontSize: '15px', color: C.burgundy }}>Install MiVino</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.muted }}>Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '18px', padding: '0 4px', lineHeight: '1' }}
            aria-label="Dismiss"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Description */}
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: C.muted, lineHeight: '1.5' }}>
          Get the full experience with camera access, faster loading, and works like a native app.
        </p>

        {/* Action */}
        {isIOS ? (
          // iOS: show manual instructions
          <div style={{ background: C.cream, borderRadius: '10px', padding: '14px', border: '1px solid ' + C.border }}>
            <p style={{ margin: 0, fontSize: '13px', color: C.burgundy, lineHeight: '1.6' }}>
              Tap the <strong>Share</strong> button
              <span style={{ fontSize: '16px', verticalAlign: 'middle' }}> {'\u2191'} </span>
              at the bottom of Safari, then tap <strong>"Add to Home Screen"</strong>
            </p>
          </div>
        ) : (
          // Android/Chrome: trigger native install
          <button
            onClick={handleInstall}
            style={{
              width: '100%', padding: '13px',
              background: C.burgundy, color: C.white,
              border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
