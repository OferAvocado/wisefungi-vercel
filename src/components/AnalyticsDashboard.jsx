import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, Globe, Clock, Activity, AlertTriangle } from 'lucide-react';

export default function AnalyticsDashboard({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`/api/analytics_admin?timeframe=${timeframe}`, {
          headers: {
            'Authorization': token
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white', direction: 'ltr' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="#4ade80" /> Admin Analytics
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '8px' }}>
          {['24h', '7d', '30d', 'all'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? '#4ade80' : 'transparent',
                color: timeframe === tf ? 'black' : 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: timeframe === tf ? 'bold' : 'normal'
              }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div style={{ padding: '2rem', background: 'rgba(255,0,0,0.1)', border: '1px solid red', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle color="red" />
          <p>Error loading analytics: {error}</p>
        </div>
      ) : loading || !data ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading metrics...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Top Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', marginBottom: '10px' }}>
                <Eye size={18} /> Total Views
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{data.overview?.total_visits || 0}</div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', marginBottom: '10px' }}>
                <Users size={18} /> Unique Visitors (Hash)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{data.overview?.unique_visitors || 0}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Top Paths */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <Activity size={18} /> Top Pages
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#aaa', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ paddingBottom: '10px' }}>Path</th>
                    <th style={{ paddingBottom: '10px', textAlign: 'right' }}>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.topPaths || []).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0', wordBreak: 'break-all' }}>{row.path}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{row.views}</td>
                    </tr>
                  ))}
                  {(!data.topPaths || data.topPaths.length === 0) && (
                    <tr><td colSpan="2" style={{ padding: '20px 0', textAlign: 'center', color: '#666' }}>No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Geographic Data */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <Globe size={18} /> Top Countries
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#aaa', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ paddingBottom: '10px' }}>Country Code</th>
                    <th style={{ paddingBottom: '10px', textAlign: 'right' }}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.geo || []).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0' }}>{row.country || 'Unknown'}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{row.visits}</td>
                    </tr>
                  ))}
                  {(!data.geo || data.geo.length === 0) && (
                    <tr><td colSpan="2" style={{ padding: '20px 0', textAlign: 'center', color: '#666' }}>No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
