import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf7f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
        <svg width="48" height="48" viewBox="-5 -5 58 54" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="4"  r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="14" cy="16" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="30" cy="16" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="6"  cy="28" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="22" cy="28" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="38" cy="28" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="0"  cy="40" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="14" cy="40" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="30" cy="40" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
          <circle cx="44" cy="40" r="4" fill="none" stroke="#5c1a2e" strokeWidth="1.5"/>
        </svg>
        <h1 style={{ color: '#5c1a2e', fontSize: '32px', fontWeight: '500', margin: '8px 0 4px' }}>MiVino</h1>
        <p style={{ color: '#b5a09a', fontSize: '13px', margin: 0 }}>Your personal wine cellar</p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#5c1a2e',
            colorBackground: '#ffffff',
            colorInputBackground: '#faf7f5',
            colorInputText: '#5c1a2e',
            borderRadius: '10px',
            fontFamily: 'system-ui, sans-serif',
          },
          elements: {
            card: { boxShadow: 'none', border: '1px solid #e0d4ce', borderRadius: '20px' },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
          }
        }}
      />
    </div>
  );
}
