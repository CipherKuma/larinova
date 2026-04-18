import React from 'react';

const ACCENT = '#4F8EF7';
const MUTED = '#64748B';
const CARD_BORDER = '#E2E8F0';

export const BrowserMockup: React.FC = () => (
  <div
    style={{
      width: 1120,
      height: 680,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      border: `1px solid ${CARD_BORDER}`,
      boxShadow: '0 24px 64px rgba(0,0,0,0.10)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Top bar */}
    <div
      style={{
        height: 48,
        backgroundColor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        gap: 8,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28C840' }} />
    </div>
    {/* Content */}
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 600, color: ACCENT }}>
        kosyn-mvp-app.vercel.app
      </div>
      <div style={{ fontSize: 14, color: MUTED, marginTop: 12 }}>
        [ Drop your screen recording here ]
      </div>
    </div>
  </div>
);
