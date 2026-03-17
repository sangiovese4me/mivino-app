"use client";

import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader } from 'lucide-react';

// NOTE: Authentication is client-side only and is not production-ready.
// Replace handleLogin with a real API call before deploying.

const currentYear = new Date().getFullYear();

function isInPeakWindow(wine) {
  if (!wine.aiData?.peakWindow) return false;
  const { start, end } = wine.aiData.peakWindow;
  return currentYear >= start && currentYear <= end;
}

async function fetchWineInfo(wineName, vintage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are a sommelier. For the wine "${wineName}" vintage ${vintage}, respond ONLY with a JSON object (no markdown, no backticks) with these exact keys:
{
  "region": "string - region/appellation of origin",
  "tastingNotes": "string - 2-3 sentence tasting profile",
  "foodPairings": ["food1", "food2", "food3"],
  "peakWindow": { "start": number, "end": number },
  "peakSummary": "string - one sentence about when to drink"
}`
        }
      ]
    })
  });
  const data = await response.json();
  const text = data.content.map(i => i.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export default function MiVinoApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wines, setWines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWine, setNewWine] = useState({ name: '', vintage: 2020, price: 0 });
  const [expandedWine, setExpandedWine] = useState(null);

  const handleLogin = () => {
    if (email && password) setIsLoggedIn(true);
  };

  const handleAddWine = async () => {
    if (!newWine.name) return;

    const vintage = parseInt(newWine.vintage);
    const price = parseFloat(newWine.price);

    if (vintage < 1800 || vintage > currentYear) {
      alert('Please enter a valid vintage year.');
      return;
    }
    if (price < 0) {
      alert('Price cannot be negative.');
      return;
    }

    const id = Date.now();
    const wineEntry = { ...newWine, vintage, price, id, aiData: null, aiLoading: true, aiError: false };

    setWines(prev => [...prev, wineEntry]);
    setNewWine({ name: '', vintage: 2020, price: 0 });
    setShowAddForm(false);
    setExpandedWine(id);

    try {
      const aiData = await fetchWineInfo(newWine.name, vintage);
      setWines(prev => prev.map(w => w.id === id ? { ...w, aiData, aiLoading: false } : w));
    } catch (e) {
      setWines(prev => prev.map(w => w.id === id ? { ...w, aiLoading: false, aiError: true } : w));
    }
  };

  // TODO: Replace with real label-scanning logic (e.g. camera API + OCR)
  const handleScanWine = async () => {
    const randomWines = ['Cabernet Sauvignon', 'Sauvignon Blanc', 'Pinot Noir'];
    const name = randomWines[Math.floor(Math.random() * randomWines.length)];
    const vintage = 2020;
    const id = Date.now();

    setWines(prev => [...prev, { name, vintage, price: 50, id, aiData: null, aiLoading: true, aiError: false }]);
    setExpandedWine(id);

    try {
      const aiData = await fetchWineInfo(name, vintage);
      setWines(prev => prev.map(w => w.id === id ? { ...w, aiData, aiLoading: false } : w));
    } catch (e) {
      setWines(prev => prev.map(w => w.id === id ? { ...w, aiLoading: false, aiError: true } : w));
    }
  };

  const handleRemoveWine = (id) => {
    setWines(wines.filter(w => w.id !== id));
    if (expandedWine === id) setExpandedWine(null);
  };

  const peakCount = wines.filter(isInPeakWindow).length;

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    background: '#334155',
    border: '1px solid #6d28d9',
    borderRadius: '8px',
    color: 'white',
    boxSizing: 'border-box',
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', maxWidth: '400px', width: '100%', border: '1px solid #6d28d9' }}>
          <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '10px', fontSize: '28px' }}>MiVino</h1>
          <p style={{ color: '#a78bfa', textAlign: 'center', marginBottom: '30px' }}>Your Personal Wine Cellar</p>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }} />
          <button onClick={handleLogin} style={{ width: '100%', padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign In
          </button>
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '15px', fontSize: '12px' }}>Demo: Use any email/password</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      {/* Header */}
      <div style={{ background: '#0f0f1e', padding: '20px', borderBottom: '1px solid #6d28d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>MiVino</h1>
          <p style={{ margin: '4px 0 0 0', color: '#a78bfa', fontSize: '12px' }}>Welcome, {email.split('@')[0]}</p>
        </div>
        <button onClick={() => { setIsLoggedIn(false); setWines([]); setEmail(''); setPassword(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>
          Logout
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #6d28d9', textAlign: 'center' }}>
            <p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 8px 0' }}>BOTTLES</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{wines.length}</p>
          </div>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #6d28d9', textAlign: 'center' }}>
            <p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 8px 0' }}>VALUE</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#22c55e' }}>${wines.reduce((sum, w) => sum + (w.price || 0), 0).toFixed(0)}</p>
          </div>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #6d28d9', textAlign: 'center' }}>
            <p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 8px 0' }}>PEAK NOW</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: peakCount > 0 ? '#f59e0b' : '#ef4444' }}>{peakCount}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => setShowAddForm(true)} style={{ padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Add Wine
          </button>
          <button onClick={handleScanWine} style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            📷 Scan Wine
          </button>
        </div>

        {/* Wine List */}
        {wines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <p style={{ fontSize: '18px' }}>Your cellar is empty</p>
            <p style={{ fontSize: '14px' }}>Scan or add wines to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {wines.map(wine => {
              const isPeak = isInPeakWindow(wine);
              const isExpanded = expandedWine === wine.id;

              return (
                <div key={wine.id} style={{ background: '#1e293b', borderRadius: '8px', border: `1px solid ${isPeak ? '#f59e0b' : '#6d28d9'}`, overflow: 'hidden' }}>
                  {/* Wine Card Header */}
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{wine.name}</p>
                        {isPeak && (
                          <span style={{ background: '#f59e0b', color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                            PEAK NOW
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0 0', color: '#a78bfa', fontSize: '12px' }}>
                        Vintage: {wine.vintage}
                        {wine.aiData?.region ? ` · ${wine.aiData.region}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ margin: 0, color: '#22c55e', fontWeight: 'bold' }}>${wine.price}</p>
                      <button
                        onClick={() => setExpandedWine(isExpanded ? null : wine.id)}
                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '4px' }}
                        aria-label="Toggle wine details"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <button
                        onClick={() => handleRemoveWine(wine.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        aria-label="Remove wine"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded AI Info */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #334155', padding: '16px' }}>
                      {wine.aiLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa' }}>
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontSize: '14px' }}>Fetching wine details from AI sommelier...</span>
                          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                      )}

                      {wine.aiError && (
                        <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>
                          Could not fetch wine info. Check your connection and try again.
                        </p>
                      )}

                      {wine.aiData && (
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {/* Tasting Notes */}
                          <div>
                            <p style={{ margin: '0 0 6px 0', color: '#a78bfa', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasting Notes</p>
                            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>{wine.aiData.tastingNotes}</p>
                          </div>

                          {/* Food Pairings */}
                          <div>
                            <p style={{ margin: '0 0 8px 0', color: '#a78bfa', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Food Pairings</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {wine.aiData.foodPairings?.map((food, i) => (
                                <span key={i} style={{ background: '#334155', color: '#e2e8f0', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #475569' }}>
                                  {food}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Peak Window */}
                          <div style={{ background: isPeak ? 'rgba(245, 158, 11, 0.1)' : '#0f172a', borderRadius: '8px', padding: '12px', border: `1px solid ${isPeak ? '#f59e0b' : '#334155'}` }}>
                            <p style={{ margin: '0 0 4px 0', color: isPeak ? '#f59e0b' : '#a78bfa', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Peak Drinking Window · {wine.aiData.peakWindow?.start}–{wine.aiData.peakWindow?.end}
                            </p>
                            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px' }}>{wine.aiData.peakSummary}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Wine Modal */}
        {showAddForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#1e293b', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '30px', width: '100%', maxWidth: '500px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: 'white' }}>Add Wine</h2>
              <p style={{ margin: '0 0 20px 0', color: '#a78bfa', fontSize: '13px' }}>AI will automatically fetch region, tasting notes, food pairings & peak window.</p>

              <input type="text" placeholder="Wine Name (e.g. Barolo, Château Margaux)" value={newWine.name} onChange={e => setNewWine({ ...newWine, name: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Vintage" value={newWine.vintage} onChange={e => setNewWine({ ...newWine, vintage: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Price" value={newWine.price} min="0" onChange={e => setNewWine({ ...newWine, price: e.target.value })} style={{ ...inputStyle, marginBottom: '20px' }} />

              <button onClick={handleAddWine} style={{ width: '100%', padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>
                Add to Cellar
              </button>
              <button onClick={() => setShowAddForm(false)} style={{ width: '100%', padding: '12px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
