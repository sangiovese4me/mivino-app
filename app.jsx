import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Utensils, Camera, Clock, MapPin, TrendingUp, Lightbulb, Wine, LogOut, Menu, X } from ‘lucide-react’;

export default function MiVinoApp() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [email, setEmail] = useState(’’);
const [password, setPassword] = useState(’’);
const [cellar, setCellar] = useState([]);
const [selectedWine, setSelectedWine] = useState(null);
const [showAddWineForm, setShowAddWineForm] = useState(false);
const [showPhotoUpload, setShowPhotoUpload] = useState(false);
const [isScanning, setIsScanning] = useState(false);
const [insights, setInsights] = useState(null);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const [newWine, setNewWine] = useState({
name: ‘’,
region: ‘’,
vintage: new Date().getFullYear(),
quantity: 1,
purchasePrice: 0,
});

// Wine database (sample)
const wineDatabase = [
{ name: ‘Caymus Vineyards Cabernet Sauvignon’, region: ‘Napa Valley, CA’, peakStart: 2024, peakEnd: 2035, pairings: [‘Ribeye Steak’, ‘Lamb Chops’, ‘Dark Chocolate’] },
{ name: ‘Cloudy Bay Sauvignon Blanc’, region: ‘Marlborough, NZ’, peakStart: 2023, peakEnd: 2026, pairings: [‘Seafood Pasta’, ‘Grilled Fish’, ‘Salad’] },
{ name: ‘Barolo Riserva’, region: ‘Piedmont, Italy’, peakStart: 2025, peakEnd: 2040, pairings: [‘Beef Braised in Wine’, ‘Truffle Risotto’, ‘Hard Cheeses’] },
{ name: ‘Sancerre’, region: ‘Loire Valley, France’, peakStart: 2022, peakEnd: 2024, pairings: [‘Goat Cheese’, ‘Asparagus’, ‘Shellfish’] },
{ name: ‘Opus One Cabernet Sauvignon’, region: ‘Napa Valley, CA’, peakStart: 2025, peakEnd: 2045, pairings: [‘Prime Rib’, ‘Lamb’, ‘Truffle Pasta’] },
];

// Login handler
const handleLogin = (e) => {
e.preventDefault();
if (email && password) {
setIsLoggedIn(true);
setCurrentUser(email.split(’@’)[0]);
setEmail(’’);
setPassword(’’);
}
};

// Logout handler
const handleLogout = () => {
setIsLoggedIn(false);
setCurrentUser(null);
setCellar([]);
};

// Add wine manually
const addWineManually = () => {
if (newWine.name.trim()) {
const dbWine = wineDatabase.find(w => w.name.toLowerCase() === newWine.name.toLowerCase());

```
  const wine = {
    id: Math.max(...cellar.map(w => w.id), 0) + 1,
    ...newWine,
    currentValue: newWine.purchasePrice * 1.08, // Slight appreciation
    peakStart: dbWine?.peakStart || newWine.vintage + 3,
    peakEnd: dbWine?.peakEnd || newWine.vintage + 15,
    region: dbWine?.region || newWine.region,
    pairings: dbWine?.pairings || ['To be determined'],
    drinkStatus: getDrinkStatus(dbWine?.peakStart || newWine.vintage + 3, dbWine?.peakEnd || newWine.vintage + 15),
    photoUrl: '🍷'
  };
  
  setCellar([...cellar, wine]);
  setNewWine({ name: '', region: '', vintage: new Date().getFullYear(), quantity: 1, purchasePrice: 0 });
  setShowAddWineForm(false);
}
```

};

// Simulate photo scan
const handlePhotoCapture = () => {
setIsScanning(true);
setTimeout(() => {
const mockWines = [
{ name: ‘Opus One Cabernet Sauvignon’, vintage: 2020, purchasePrice: 150 },
{ name: ‘Château Margaux’, vintage: 2018, purchasePrice: 200 },
{ name: ‘Screaming Eagle Cabernet’, vintage: 2019, purchasePrice: 180 },
];
const randomWine = mockWines[Math.floor(Math.random() * mockWines.length)];
const dbWine = wineDatabase.find(w => w.name.toLowerCase() === randomWine.name.toLowerCase());

```
  const wine = {
    id: Math.max(...cellar.map(w => w.id), 0) + 1,
    name: randomWine.name,
    vintage: randomWine.vintage,
    quantity: 1,
    purchasePrice: randomWine.purchasePrice,
    currentValue: randomWine.purchasePrice * 1.1,
    peakStart: dbWine?.peakStart || randomWine.vintage + 3,
    peakEnd: dbWine?.peakEnd || randomWine.vintage + 15,
    region: dbWine?.region || 'Napa Valley, CA',
    pairings: dbWine?.pairings || ['Prime Rib', 'Dark Chocolate'],
    drinkStatus: getDrinkStatus(dbWine?.peakStart || randomWine.vintage + 3, dbWine?.peakEnd || randomWine.vintage + 15),
    photoUrl: '🍷'
  };
  
  setCellar([...cellar, wine]);
  setIsScanning(false);
  setShowPhotoUpload(false);
  
  setInsights({
    title: '✅ Wine Added Successfully!',
    items: [
      `Recognized: ${wine.name}`,
      `Peak drinking: ${wine.peakStart}-${wine.peakEnd}`,
      `Current value: $${wine.currentValue.toFixed(0)}`
    ]
  });
  setTimeout(() => setInsights(null), 3000);
}, 2000);
```

};

// Determine drink status
const getDrinkStatus = (peakStart, peakEnd) => {
const currentYear = new Date().getFullYear();
if (currentYear < peakStart - 1) return ‘aging’;
if (currentYear >= peakStart && currentYear <= peakEnd) return ‘peak’;
if (currentYear > peakEnd - 2 && currentYear <= peakEnd) return ‘drinking-now’;
return ‘past-peak’;
};

// Generate insights
const generateInsights = () => {
const drinkingNow = cellar.filter(w => w.drinkStatus === ‘drinking-now’ || w.drinkStatus === ‘peak’).length;
const agingWines = cellar.filter(w => w.drinkStatus === ‘aging’).length;
const totalValue = cellar.reduce((sum, w) => sum + (w.currentValue * w.quantity), 0);
const gainLoss = cellar.reduce((sum, w) => sum + ((w.currentValue - w.purchasePrice) * w.quantity), 0);

```
setInsights({
  title: '💡 Smart Insights About Your Collection',
  items: [
    `📊 Total collection value: $${totalValue.toFixed(0)}`,
    `📈 Gain/Loss: ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(0)}`,
    `🍷 Bottles ready to drink: ${drinkingNow}`,
    `⏳ Wines still aging: ${agingWines}`,
    `🎯 ${cellar.length} total wines in your cellar`
  ]
});
setTimeout(() => setInsights(null), 5000);
```

};

// Stats calculation
const drinkingNow = cellar.filter(w => w.drinkStatus === ‘drinking-now’ || w.drinkStatus === ‘peak’).length;
const totalValue = cellar.reduce((sum, w) => sum + (w.currentValue * w.quantity), 0);
const gainLoss = cellar.reduce((sum, w) => sum + ((w.currentValue - w.purchasePrice) * w.quantity), 0);

// Helpers
const getStatusColor = (status) => {
if (status === ‘drinking-now’) return ‘bg-red-100 text-red-800 border-red-300’;
if (status === ‘peak’) return ‘bg-green-100 text-green-800 border-green-300’;
if (status === ‘aging’) return ‘bg-blue-100 text-blue-800 border-blue-300’;
return ‘bg-gray-100 text-gray-800 border-gray-300’;
};

const getStatusLabel = (status) => {
if (status === ‘drinking-now’) return ‘🚨 DRINK NOW’;
if (status === ‘peak’) return ‘✓ Peak’;
if (status === ‘aging’) return ‘⏳ Aging’;
return ‘⏭️ Past Peak’;
};

const removeWine = (id) => {
setCellar(cellar.filter(w => w.id !== id));
};

// ============ LOGIN SCREEN ============
if (!isLoggedIn) {
return (
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
<div className="bg-slate-800 border border-purple-500/30 rounded-lg p-8 max-w-md w-full backdrop-blur">
<div className="flex items-center justify-center gap-3 mb-8">
<Wine className="w-8 h-8 text-purple-400" />
<h1 className="text-3xl font-bold text-white">MiVino</h1>
</div>

```
      <p className="text-center text-purple-300 mb-8 text-sm">
        Your Personal Wine Cellar Manager
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-white text-sm font-semibold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded transition-all mt-6"
        >
          Sign In
        </button>
      </form>

      <p className="text-center text-gray-400 text-xs mt-6">
        Demo: Use any email/password to login
      </p>
    </div>
  </div>
);
```

}

// ============ MAIN APP ============
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
{/* Header */}
<div className="bg-gradient-to-b from-black to-transparent border-b border-purple-500/20 sticky top-0 z-40 backdrop-blur-sm">
<div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<Wine className="w-8 h-8 text-purple-400" />
<div>
<h1 className="text-2xl md:text-4xl font-bold text-white">MiVino</h1>
<p className="text-purple-300 text-xs">Welcome, {currentUser}</p>
</div>
</div>
<button
onClick={handleLogout}
className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded text-sm transition-all border border-red-500/30"
>
<LogOut className="w-4 h-4" />
<span className="hidden sm:inline">Logout</span>
</button>
</div>

```
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 backdrop-blur">
          <div className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">Bottles</div>
          <div className="text-2xl font-bold text-white">{cellar.reduce((sum, w) => sum + w.quantity, 0)}</div>
        </div>
        
        <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 backdrop-blur">
          <div className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">Drink Now</div>
          <div className="text-2xl font-bold text-red-400">{drinkingNow}</div>
        </div>
        
        <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 backdrop-blur">
          <div className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">Value</div>
          <div className="text-2xl font-bold text-green-400">${totalValue.toFixed(0)}</div>
        </div>
        
        <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 backdrop-blur">
          <div className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">Gain/Loss</div>
          <div className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${gainLoss.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
    {/* Insights Alert */}
    {insights && (
      <div className="mb-8 bg-blue-500/10 border border-blue-500/40 rounded-lg p-6 backdrop-blur animate-in fade-in">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-blue-100 mb-3">{insights.title}</h3>
            <ul className="space-y-1">
              {insights.items.map((item, idx) => (
                <li key={idx} className="text-blue-100/80 text-sm">→ {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )}

    {/* Drink Now Alert */}
    {drinkingNow > 0 && (
      <div className="mb-8 bg-red-500/10 border border-red-500/40 rounded-lg p-6 backdrop-blur">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-100 mb-2">🚨 Wines Ready to Drink</h3>
            <p className="text-red-100/80 text-sm">
              You have {drinkingNow} bottle(s) at peak drinking window. Don't let them age past their prime!
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Action Buttons */}
    <div className="mb-8 flex flex-wrap gap-3">
      <button
        onClick={() => setShowPhotoUpload(!showPhotoUpload)}
        className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg flex items-center gap-2 transition-all text-sm md:text-base"
      >
        <Camera className="w-4 h-4 md:w-5 md:h-5" />
        Scan Wine
      </button>
      
      <button
        onClick={() => setShowAddWineForm(!showAddWineForm)}
        className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg flex items-center gap-2 transition-all text-sm md:text-base"
      >
        <Plus className="w-4 h-4 md:w-5 md:h-5" />
        Add Wine
      </button>
      
      <button
        onClick={generateInsights}
        className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg flex items-center gap-2 transition-all text-sm md:text-base"
      >
        <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
        Insights
      </button>
    </div>

    {/* Photo Upload */}
    {showPhotoUpload && (
      <div className="mb-8 bg-white/5 border border-purple-500/50 rounded-lg p-6 md:p-8 backdrop-blur-sm">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">📸 Scan Wine Label</h3>
        
        <div className="bg-gradient-to-br from-purple-900/50 to-black border-2 border-dashed border-purple-500/50 rounded-lg p-8 md:p-12 mb-6 flex flex-col items-center justify-center hover:border-purple-400/70 transition-colors">
          <Camera className="w-12 h-12 md:w-16 md:h-16 text-purple-400/50 mb-4" />
          <p className="text-white text-base md:text-lg font-semibold mb-2">Click to scan wine label</p>
          <p className="text-purple-300/70 text-xs md:text-sm mb-6">Our AI recognizes labels and auto-fills details</p>
          
          <button
            onClick={handlePhotoCapture}
            disabled={isScanning}
            className="px-6 md:px-8 py-2 md:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all text-sm md:text-base"
          >
            {isScanning ? '🔍 Scanning...' : '📷 Take Photo'}
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-100 text-xs md:text-sm">
            <strong>💡 Demo:</strong> Click "Take Photo" to simulate scanning. In production, this would use your camera.
          </p>
        </div>
      </div>
    )}

    {/* Add Wine Form */}
    {showAddWineForm && (
      <div className="mb-8 bg-white/5 border border-purple-500/50 rounded-lg p-6 md:p-8 backdrop-blur-sm">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Add Wine Manually</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Wine Name (e.g., Caymus Cabernet)"
            value={newWine.name}
            onChange={(e) => setNewWine({...newWine, name: e.target.value})}
            className="col-span-1 md:col-span-2 bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-600 text-sm md:text-base"
          />
          <input
            type="text"
            placeholder="Region (e.g., Napa Valley)"
            value={newWine.region}
            onChange={(e) => setNewWine({...newWine, region: e.target.value})}
            className="bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-600 text-sm md:text-base"
          />
          <input
            type="number"
            placeholder="Vintage"
            value={newWine.vintage}
            onChange={(e) => setNewWine({...newWine, vintage: parseInt(e.target.value)})}
            className="bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-600 text-sm md:text-base"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newWine.quantity}
            onChange={(e) => setNewWine({...newWine, quantity: parseInt(e.target.value) || 1})}
            className="bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-600 text-sm md:text-base"
          />
          <input
            type="number"
            placeholder="Purchase Price ($)"
            value={newWine.purchasePrice}
            onChange={(e) => setNewWine({...newWine, purchasePrice: parseFloat(e.target.value) || 0})}
            className="bg-white/10 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-600 text-sm md:text-base"
          />
          <button
            onClick={addWineManually}
            className="col-span-1 md:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition-all text-sm md:text-base"
          >
            Add to Cellar
          </button>
        </div>
      </div>
    )}

    {/* Wine Grid */}
    {cellar.length === 0 ? (
      <div className="text-center py-16">
        <Wine className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
        <p className="text-white/50 text-lg">Your cellar is empty. Add wines to get started!</p>
      </div>
    ) : (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-6">Your Collection ({cellar.length} wines)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {cellar.map((wine) => (
            <div
              key={wine.id}
              onClick={() => setSelectedWine(wine)}
              className="bg-white/5 border border-purple-500/30 rounded-lg p-4 md:p-6 backdrop-blur hover:bg-white/10 hover:border-purple-400/50 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-4xl">{wine.photoUrl}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-white group-hover:text-purple-200 transition-colors truncate">
                      {wine.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-purple-300/70 mt-1 truncate">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{wine.region}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWine(wine.id);
                  }}
                  className="text-purple-600/50 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${getStatusColor(wine.drinkStatus)}`}>
                {getStatusLabel(wine.drinkStatus)}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-purple-500/20">
                <div>
                  <div className="text-purple-300/60 text-xs uppercase tracking-wider">Vintage</div>
                  <div className="text-white font-semibold text-sm">{wine.vintage}</div>
                </div>
                <div>
                  <div className="text-purple-300/60 text-xs uppercase tracking-wider">Bottles</div>
                  <div className="text-white font-semibold text-sm">{wine.quantity}</div>
                </div>
                <div>
                  <div className="text-purple-300/60 text-xs uppercase tracking-wider">Value</div>
                  <div className="text-green-400 font-semibold text-sm">${wine.currentValue.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-purple-300/60 text-xs uppercase tracking-wider">Gain/Loss</div>
                  <div className={`font-semibold text-sm ${(wine.currentValue - wine.purchasePrice) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${(wine.currentValue - wine.purchasePrice).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-purple-300/60 text-xs uppercase tracking-wider mb-2">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                Peak: {wine.peakStart}–{wine.peakEnd}
              </div>

              <div className="pt-3 border-t border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-300/60 text-xs uppercase tracking-wider mb-2">
                  <Utensils className="w-3 h-3 md:w-4 md:h-4" />
                  Pairs With
                </div>
                <div className="flex flex-wrap gap-1">
                  {wine.pairings.slice(0, 2).map((pairing, idx) => (
                    <span key={idx} className="bg-purple-500/20 text-purple-100 text-xs px-2 py-1 rounded border border-purple-500/30">
                      {pairing}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Detail Modal */}
  {selectedWine && (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => setSelectedWine(null)}
    >
      <div
        className="bg-gradient-to-br from-slate-900 to-black border border-purple-500/50 rounded-lg p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 md:gap-6 mb-6">
          <div className="text-5xl md:text-7xl flex-shrink-0">{selectedWine.photoUrl}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">{selectedWine.name}</h2>
            <p className="text-purple-300/70 mb-4 text-sm md:text-base">{selectedWine.region} • {selectedWine.vintage}</p>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedWine.drinkStatus)}`}>
              {getStatusLabel(selectedWine.drinkStatus)}
            </div>
          </div>
          <button
            onClick={() => setSelectedWine(null)}
            className="text-purple-400 hover:text-purple-300 text-2xl font-bold flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-purple-500/20">
          <div>
            <div className="text-purple-300/60 text-sm uppercase tracking-wider mb-2">Peak Drinking</div>
            <div className="text-white text-lg font-semibold">{selectedWine.peakStart}–{selectedWine.peakEnd}</div>
          </div>
          <div>
            <div className="text-purple-300/60 text-sm uppercase tracking-wider mb-2">Total Value</div>
            <div className="text-green-400 text-lg font-semibold">${(selectedWine.currentValue * selectedWine.quantity).toFixed(0)}</div>
          </div>
          <div>
            <div className="text-purple-300/60 text-sm uppercase tracking-wider mb-2">Bottles</div>
            <div className="text-white text-lg font-semibold">{selectedWine.quantity}</div>
          </div>
          <div>
            <div className="text-purple-300/60 text-sm uppercase tracking-wider mb-2">Return</div>
            <div className={`text-lg font-semibold ${(selectedWine.currentValue - selectedWine.purchasePrice) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {((((selectedWine.currentValue - selectedWine.purchasePrice) / selectedWine.purchasePrice) * 100) || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-purple-400" />
            Perfect Food Pairings
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {selectedWine.pairings.map((pairing, idx) => (
              <div key={idx} className="bg-purple-500/20 text-white px-4 py-2 rounded-lg border border-purple-500/30 text-sm">
                {pairing}
              </div>
            ))}
          </div>
        </div>

        {selectedWine.drinkStatus === 'drinking-now' && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
            <p className="text-red-200 font-semibold text-sm md:text-base">
              ⏰ Approaching peak window end. Open soon for best enjoyment!
            </p>
          </div>
        )}

        {selectedWine.drinkStatus === 'peak' && (
          <div className="bg-green-500/10 border border-green-500/40 rounded-lg p-4">
            <p className="text-green-200 font-semibold text-sm md:text-base">
              ✓ At absolute peak. Perfect time to enjoy!
            </p>
          </div>
        )}

        {selectedWine.drinkStatus === 'aging' && (
          <div className="bg-blue-500/10 border border-blue-500/40 rounded-lg p-4">
            <p className="text-blue-200 font-semibold text-sm md:text-base">
              ⏳ Still aging beautifully. Peak in {selectedWine.peakStart - new Date().getFullYear()} years!
            </p>
          </div>
        )}
      </div>
    </div>
  )}
</div>
```

);
}
