"use client";
import React, { useState } from ‘react’;
import { Plus, Trash2, AlertCircle, Utensils, Camera, LogOut, Menu, X } from ‘lucide-react’;

export default function MiVinoApp() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [email, setEmail] = useState(’’);
const [password, setPassword] = useState(’’);
const [wines, setWines] = useState([]);
const [showAddForm, setShowAddForm] = useState(false);
const [newWine, setNewWine] = useState({ name: ‘’, vintage: 2020, price: 0 });

const handleLogin = () => {
if (email && password) {
setIsLoggedIn(true);
}
};

const handleAddWine = () => {
if (newWine.name) {
setWines([…wines, { …newWine, id: Date.now() }]);
setNewWine({ name: ‘’, vintage: 2020, price: 0 });
setShowAddForm(false);
}
};

const handleRemoveWine = (id) => {
setWines(wines.filter(w => w.id !== id));
};

if (!isLoggedIn) {
return (
<div style={{ minHeight: ‘100vh’, background: ‘#0f172a’, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’, padding: ‘20px’ }}>
<div style={{ background: ‘#1e293b’, padding: ‘40px’, borderRadius: ‘12px’, maxWidth: ‘400px’, width: ‘100%’, border: ‘1px solid #6d28d9’ }}>
<h1 style={{ color: ‘white’, textAlign: ‘center’, marginBottom: ‘10px’, fontSize: ‘28px’ }}>MiVino</h1>
<p style={{ color: ‘#a78bfa’, textAlign: ‘center’, marginBottom: ‘30px’ }}>Your Personal Wine Cellar</p>

```
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#334155', border: '1px solid #6d28d9', borderRadius: '8px', color: 'white' }}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#334155', border: '1px solid #6d28d9', borderRadius: '8px', color: 'white' }}
/>

<button
onClick={handleLogin}
style={{ width: '100%', padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
>
Sign In
</button>

<p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '15px', fontSize: '12px' }}>Demo: Use any email/password</p>
</div>
</div>
);
```

}

return (
<div style={{ minHeight: ‘100vh’, background: ‘#0f172a’, color: ‘white’ }}>
<div style={{ background: ‘#0f0f1e’, padding: ‘20px’, borderBottom: ‘1px solid #6d28d9’, display: ‘flex’, justifyContent: ‘space-between’, alignItems: ‘center’ }}>
<div>
<h1 style={{ margin: 0, fontSize: ‘28px’ }}>MiVino</h1>
<p style={{ margin: ‘4px 0 0 0’, color: ‘#a78bfa’, fontSize: ‘12px’ }}>Welcome, {email.split(’@’)[0]}</p>
</div>
<button
onClick={() => { setIsLoggedIn(false); setWines([]); setEmail(’’); setPassword(’’); }}
style={{ background: ‘none’, border: ‘none’, color: ‘#ef4444’, cursor: ‘pointer’, fontSize: ‘16px’ }}
>
Logout
</button>
</div>

```
<div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
<p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 8px 0' }}>READY</p>
<p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>0</p>
</div>
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
<button
onClick={() => setShowAddForm(true)}
style={{ padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
>
+ Add Wine
</button>
<button
onClick={() => { const randomWines = ['Cabernet Sauvignon', 'Sauvignon Blanc', 'Pinot Noir']; const name = randomWines[Math.floor(Math.random() * randomWines.length)]; setWines([...wines, { name, vintage: 2020, price: 50, id: Date.now() }]); }}
style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
>
📷 Scan Wine
</button>
</div>

{wines.length === 0 ? (
<div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
<p style={{ fontSize: '18px' }}>Your cellar is empty</p>
<p style={{ fontSize: '14px' }}>Scan or add wines to get started</p>
</div>
) : (
<div style={{ display: 'grid', gap: '12px' }}>
{wines.map((wine) => (
<div
key={wine.id}
style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #6d28d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
>
<div>
<p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>{wine.name}</p>
<p style={{ margin: '4px 0 0 0', color: '#a78bfa', fontSize: '12px' }}>Vintage: {wine.vintage}</p>
</div>
<div style={{ textAlign: 'right', marginRight: '12px' }}>
<p style={{ margin: 0, color: '#22c55e', fontWeight: 'bold' }}>${wine.price}</p>
</div>
<button
onClick={() => handleRemoveWine(wine.id)}
style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
>
X
</button>
</div>
))}
</div>
)}

{showAddForm && (
<div style={{ fixed: 'true', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
<div style={{ background: '#1e293b', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '30px', width: '100%', maxWidth: '500px' }}>
<h2 style={{ margin: '0 0 20px 0', color: 'white' }}>Add Wine</h2>

<input
type="text"
placeholder="Wine Name"
value={newWine.name}
onChange={(e) => setNewWine({...newWine, name: e.target.value})}
style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#334155', border: '1px solid #6d28d9', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
/>

<input
type="number"
placeholder="Vintage"
value={newWine.vintage}
onChange={(e) => setNewWine({...newWine, vintage: parseInt(e.target.value)})}
style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#334155', border: '1px solid #6d28d9', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
/>

<input
type="number"
placeholder="Price"
value={newWine.price}
onChange={(e) => setNewWine({...newWine, price: parseFloat(e.target.value)})}
style={{ width: '100%', padding: '12px', marginBottom: '20px', background: '#334155', border: '1px solid #6d28d9', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
/>

<button
onClick={handleAddWine}
style={{ width: '100%', padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}
>
Add to Cellar
</button>

<button
onClick={() => setShowAddForm(false)}
style={{ width: '100%', padding: '12px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
>
Cancel
</button>
</div>
</div>
)}
</div>
</div>
```

);
}
