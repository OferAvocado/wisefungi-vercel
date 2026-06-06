import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Eye, Globe, Clock, Activity, AlertTriangle, Calendar } from 'lucide-react';

const COUNTRY_NAMES = {
  il: { en: 'Israel', he: 'ישראל' },
  us: { en: 'United States', he: 'ארצות הברית' },
  gb: { en: 'United Kingdom', he: 'בריטניה' },
  de: { en: 'Germany', he: 'גרמניה' },
  fr: { en: 'France', he: 'צרפת' },
  ca: { en: 'Canada', he: 'קנדה' },
  ru: { en: 'Russia', he: 'רוסיה' },
  es: { en: 'Spain', he: 'ספרד' },
  it: { en: 'Italy', he: 'איטליה' },
  au: { en: 'Australia', he: 'אוסטרליה' },
  cn: { en: 'China', he: 'סין' },
  jp: { en: 'Japan', he: 'יפן' },
  in: { en: 'India', he: 'הודו' },
  br: { en: 'Brazil', he: 'ברזיל' },
  nl: { en: 'Netherlands', he: 'הולנד' },
  ua: { en: 'Ukraine', he: 'אוקראינה' },
  pl: { en: 'Poland', he: 'פולין' },
  tr: { en: 'Turkey', he: 'טורקיה' },
  se: { en: 'Sweden', he: 'שבדיה' },
  ch: { en: 'Switzerland', he: 'שוויץ' },
  za: { en: 'South Africa', he: 'דרום אפריקה' },
  mx: { en: 'Mexico', he: 'מקסיקו' },
  sg: { en: 'Singapore', he: 'סינגפור' },
  nz: { en: 'New Zealand', he: 'ניו זילנד' },
  at: { en: 'Austria', he: 'אוסטריה' },
  be: { en: 'Belgium', he: 'בלגיה' },
  no: { en: 'Norway', he: 'נורווגיה' },
  dk: { en: 'Denmark', he: 'דנמרק' },
  fi: { en: 'Finland', he: 'פינלנד' },
  ie: { en: 'Ireland', he: 'אירלנד' },
  pt: { en: 'Portugal', he: 'פורטוגל' },
  gr: { en: 'Greece', he: 'יוון' },
  kr: { en: 'South Korea', he: 'דרום קוריאה' },
  hk: { en: 'Hong Kong', he: 'הונג קונג' },
  tw: { en: 'Taiwan', he: 'טייוואן' },
  th: { en: 'Thailand', he: 'תאילנד' },
  vn: { en: 'Vietnam', he: 'וייטנאם' },
  my: { en: 'Malaysia', he: 'מלזיה' },
  ph: { en: 'Philippines', he: 'פיליפינים' },
  id: { en: 'Indonesia', he: 'אינדונזיה' },
  sa: { en: 'Saudi Arabia', he: 'ערב הסעודית' },
  ae: { en: 'United Arab Emirates', he: 'איחוד האמירויות' },
  ro: { en: 'Romania', he: 'רומניה' },
  hu: { en: 'Hungary', he: 'הונגריה' },
  cz: { en: 'Czech Republic', he: 'צ׳כיה' },
  cl: { en: 'Chile', he: 'צ׳ילה' },
  ar: { en: 'Argentina', he: 'ארגנטינה' },
  co: { en: 'Colombia', he: 'קולומביה' },
  pe: { en: 'Peru', he: 'פרו' },
  eg: { en: 'Egypt', he: 'מצרים' }
};

export default function AnalyticsDashboard({ onBack, currentLang = 'he' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');
  const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });
  const [error, setError] = useState(null);
  const [mapSvg, setMapSvg] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  const mapContainerRef = useRef(null);

  // Fetch world.svg once on mount
  useEffect(() => {
    fetch('/world.svg')
      .then(res => {
        if (!res.ok) throw new Error('Could not load world map SVG');
        return res.text();
      })
      .then(svgText => {
        // Clean XML and DocType headers so React doesn't complain
        const cleanSvg = svgText
          .replace(/<\?xml.*?\?>/i, '')
          .replace(/<!DOCTYPE.*?>/gi, '');
        setMapSvg(cleanSvg);
      })
      .catch(err => {
        console.error('Error loading world map:', err);
      });
  }, []);

  // Fetch Analytics data on timeframe/customDates changes
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      let url = `/api/analytics_admin?timeframe=${timeframe}`;
      
      if (timeframe === 'custom') {
        if (!customDates.startDate || !customDates.endDate) {
          setLoading(false);
          return; // Wait for both dates to be filled
        }
        url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': token
        }
      });
      
      if (res.status === 401) {
        // Log out admin if token is invalid
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }

      if (!res.ok) {
        throw new Error(currentLang === 'he' ? 'שגיאה בטעינת נתוני אנליטיקס' : 'Failed to fetch analytics');
      }
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    fetchAnalytics();
  };

  // SVG Map interactions
  const handleMapMouseMove = (e) => {
    const target = e.target;
    if (target && target.tagName.toLowerCase() === 'path') {
      const countryId = target.getAttribute('id');
      if (!countryId) return;

      const code = countryId.toLowerCase();
      const countryObj = COUNTRY_NAMES[code];
      const countryName = countryObj 
        ? (currentLang === 'he' ? countryObj.he : countryObj.en) 
        : countryId.toUpperCase();

      const geoEntry = data?.geo?.find(g => g.country && g.country.toLowerCase() === code);
      const visits = geoEntry ? geoEntry.visits : 0;

      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        content: currentLang === 'he' 
          ? `${countryName}: ${visits} כניסות` 
          : `${countryName}: ${visits} visits`
      });
    }
  };

  const handleMapMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Render Chart helper
  const renderChart = () => {
    if (!data || !data.series || data.series.length === 0) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{currentLang === 'he' ? 'אין מספיק נתונים להצגת גרף' : 'No chart data available'}</div>;
    }

    const series = data.series;
    const maxVisits = Math.max(...series.map(d => d.visits), 1);
    
    // SVG Settings
    const width = 1000;
    const height = 240;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Generate Points
    const points = series.map((d, i) => {
      const x = padding.left + (series.length > 1 ? (i / (series.length - 1)) * chartWidth : chartWidth / 2);
      const y = padding.top + chartHeight - (d.visits / maxVisits) * chartHeight;
      return { x, y, visits: d.visits, rawDate: d.time_bucket };
    });

    // Generate SVG path for line
    let linePath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    }

    // Generate SVG path for gradient area
    let areaPath = '';
    if (points.length > 0) {
      areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
    }

    // Format time axis label
    const formatLabel = (isoStr) => {
      try {
        const d = new Date(isoStr);
        if (timeframe === '24h') {
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } catch (e) {
        return '';
      }
    };

    // Filter x labels to prevent overlaps (show approx 6 labels max)
    const labelInterval = Math.max(Math.floor(series.length / 6), 1);

    return (
      <div className="chart-wrapper glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
          <Clock size={16} /> {currentLang === 'he' ? 'מגמת ביקורים' : 'Traffic Trend'}
        </h3>
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ minWidth: '700px', display: 'block' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = padding.top + chartHeight * p;
              const value = Math.round(maxVisits * (1 - p));
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <text x={padding.left - 10} y={y + 4} fill="#888" fontSize="10" textAnchor="end">{value}</text>
                </g>
              );
            })}

            {/* Area & Line */}
            {points.length > 0 && (
              <>
                <path d={areaPath} fill="url(#chartGrad)" />
                <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}

            {/* X Labels */}
            {points.map((p, i) => {
              if (i % labelInterval === 0 || i === points.length - 1) {
                return (
                  <text key={i} x={p.x} y={padding.top + chartHeight + 20} fill="#888" fontSize="10" textAnchor="middle">
                    {formatLabel(p.rawDate)}
                  </text>
                );
              }
              return null;
            })}

            {/* Hover Points & Interactive Targets */}
            {points.map((p, i) => {
              const displayDate = new Date(p.rawDate).toLocaleString([], { 
                month: 'short', 
                day: 'numeric',
                hour: timeframe === '24h' ? '2-digit' : undefined,
                minute: timeframe === '24h' ? '2-digit' : undefined,
                hour12: false
              });

              return (
                <g key={i} className="chart-dot-group">
                  {/* Visual Circle */}
                  <circle cx={p.x} cy={p.y} r="4" fill="#111" stroke="#4ade80" strokeWidth="2" />
                  
                  {/* Bigger Invisible Circle for Hover Trigger */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="15" 
                    fill="transparent" 
                    style={{ cursor: 'pointer' }}
                    onMouseMove={(e) => {
                      setTooltip({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        content: currentLang === 'he'
                          ? `${displayDate}: ${p.visits} כניסות`
                          : `${displayDate}: ${p.visits} visits`
                      });
                    }}
                    onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Compile Dynamic CSS for World Map Colorization
  const maxVisits = data?.geo ? Math.max(...data.geo.map(g => g.visits), 1) : 1;
  const mapColorStyles = (data?.geo || []).map(g => {
    if (!g.country) return '';
    const code = g.country.toLowerCase();
    const intensity = g.visits / maxVisits; // 0 to 1
    // Color scale lightness ranges from 75% (low traffic) down to 35% (high traffic) for nice green values
    const lightness = 75 - intensity * 40; 
    const color = `hsl(142, 70%, ${lightness}%)`;
    return `
      #world-map #${code}, #world-map .${code} {
        fill: ${color} !important;
      }
    `;
  }).join('\n');

  // Timeframe labels in English & Hebrew
  const labels = {
    '24h': currentLang === 'he' ? '24 שעות' : '24 Hours',
    '7d': currentLang === 'he' ? 'שבוע' : '7 Days',
    '30d': currentLang === 'he' ? 'חודש' : '30 Days',
    'ytd': currentLang === 'he' ? 'מתחילת השנה' : 'YTD',
    'all': currentLang === 'he' ? 'הכל' : 'All Time',
    'custom': currentLang === 'he' ? 'מותאם אישית' : 'Custom'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white', direction: 'ltr', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Injected Stylesheet for self-contained visual styling */}
      <style>{`
        #world-map {
          width: 100%;
          height: auto;
          max-height: 480px;
        }
        #world-map path {
          fill: rgba(255, 255, 255, 0.08);
          stroke: rgba(0, 0, 0, 0.4);
          stroke-width: 0.6px;
          transition: fill 0.25s ease, stroke 0.25s ease;
          cursor: pointer;
        }
        #world-map path:hover {
          fill: rgba(255, 255, 255, 0.3) !important;
          stroke: #4ade80 !important;
          stroke-width: 1.2px !important;
        }
        .chart-dot-group circle {
          transition: r 0.2s ease;
        }
        .chart-dot-group:hover circle {
          r: 6px;
        }
        .timeframe-btn {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #ccc;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .timeframe-btn:hover {
          background: rgba(255,255,255,0.08);
          color: white;
          border-color: rgba(255,255,255,0.25);
        }
        .timeframe-btn.active {
          background: #4ade80;
          color: #0b0f19;
          border-color: #4ade80;
          font-weight: bold;
          box-shadow: 0 0 12px rgba(74, 222, 128, 0.3);
        }
        ${mapColorStyles}
      `}</style>

      {/* Floating Tooltip */}
      {tooltip.visible && (
        <div style={{
          position: 'fixed',
          top: tooltip.y - 45,
          left: tooltip.x + 15,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '6px 12px',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 9999,
          fontSize: '0.85rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          color: 'white',
          transform: 'translate(-50%, -50%)',
          whiteSpace: 'nowrap'
        }}>
          {tooltip.content}
        </div>
      )}

      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack}
            className="timeframe-btn"
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="#4ade80" size={28} /> {currentLang === 'he' ? 'לוח בקרה אנליטיקס' : 'Analytics Dashboard'}
          </h1>
        </div>

        {/* Timeframe selector controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`timeframe-btn ${timeframe === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Picker Drawer */}
      {timeframe === 'custom' && (
        <form onSubmit={handleApplyCustomRange} className="glass-panel" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          marginBottom: '2rem', 
          padding: '1.2rem', 
          borderRadius: '12px', 
          background: 'rgba(0,0,0,0.15)', 
          border: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#aaa" />
            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>{currentLang === 'he' ? 'טווח תאריכים:' : 'Custom Period:'}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="date" 
              required
              value={customDates.startDate}
              onChange={e => setCustomDates(prev => ({ ...prev, startDate: e.target.value }))}
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 12px', color: 'white' }}
            />
            <span style={{ color: '#888' }}>→</span>
            <input 
              type="date" 
              required
              value={customDates.endDate}
              onChange={e => setCustomDates(prev => ({ ...prev, endDate: e.target.value }))}
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 12px', color: 'white' }}
            />
          </div>

          <button 
            type="submit" 
            className="timeframe-btn active"
            style={{ padding: '6px 16px', fontSize: '0.9rem' }}
          >
            {currentLang === 'he' ? 'החל' : 'Apply'}
          </button>
        </form>
      )}

      {/* Error state */}
      {error ? (
        <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <AlertTriangle color="#ef4444" size={24} />
          <p style={{ margin: 0, fontWeight: 'bold' }}>Error: {error}</p>
        </div>
      ) : loading || !data ? (
        /* Loading spinner */
        <div style={{ textAlign: 'center', padding: '6rem', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span>{currentLang === 'he' ? 'טוען נתונים...' : 'Loading metrics...'}</span>
        </div>
      ) : (
        /* Main Analytics Dashboard Contents */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Overview Scoreboard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                <Eye size={18} color="#4ade80" /> {currentLang === 'he' ? 'סך הכל ביקורים' : 'Total Visits'}
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: '1' }}>{data.overview?.total_visits || 0}</div>
            </div>
            
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                <Users size={18} color="#60a5fa" /> {currentLang === 'he' ? 'מבקרים ייחודיים' : 'Unique Visitors'}
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: '1' }}>{data.overview?.unique_visitors || 0}</div>
            </div>
          </div>

          {/* Time Series Chart Section */}
          {renderChart()}

          {/* Map & Countries Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* World Map Component Card */}
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                <Globe size={18} /> {currentLang === 'he' ? 'מפת פילוג גאוגרפי' : 'Geographic Distribution Map'}
              </h3>
              
              <div 
                ref={mapContainerRef}
                className="world-map-container"
                onMouseMove={handleMapMouseMove}
                onMouseLeave={handleMapMouseLeave}
                dangerouslySetInnerHTML={{ __html: mapSvg }}
                style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}
              />
            </div>
          </div>

          {/* Paths & Countries Details Tables row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
            
            {/* Top Paths Table Card */}
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <Activity size={18} /> {currentLang === 'he' ? 'דפים נצפים מובילים' : 'Top Viewed Pages'}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ paddingBottom: '12px', fontWeight: '600', fontSize: '0.85rem' }}>{currentLang === 'he' ? 'נתיב דף' : 'Page Path'}</th>
                    <th style={{ paddingBottom: '12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>{currentLang === 'he' ? 'צפיות' : 'Views'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.topPaths || []).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 0', fontSize: '0.9rem', color: '#e2e8f0', wordBreak: 'break-all', fontFamily: 'monospace' }}>{row.path}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: '#4ade80' }}>{row.views}</td>
                    </tr>
                  ))}
                  {(!data.topPaths || data.topPaths.length === 0) && (
                    <tr><td colSpan="2" style={{ padding: '24px 0', textAlign: 'center', color: '#666' }}>{currentLang === 'he' ? 'אין נתונים זמינים' : 'No data available'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Top Countries List Table Card */}
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <Globe size={18} /> {currentLang === 'he' ? 'מדינות מובילות' : 'Top Countries'}
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ paddingBottom: '12px', fontWeight: '600', fontSize: '0.85rem' }}>{currentLang === 'he' ? 'מדינה' : 'Country'}</th>
                    <th style={{ paddingBottom: '12px', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>{currentLang === 'he' ? 'ביקורים' : 'Visits'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.geo || []).slice(0, 10).map((row, i) => {
                    const code = row.country ? row.country.toLowerCase() : '';
                    const countryObj = COUNTRY_NAMES[code];
                    const countryName = countryObj 
                      ? (currentLang === 'he' ? countryObj.he : countryObj.en) 
                      : row.country || 'Unknown';
                    
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 0', fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '20px', fontSize: '0.85rem', color: '#888' }}>#{i+1}</span>
                          {countryName}
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: '#60a5fa' }}>{row.visits}</td>
                      </tr>
                    );
                  })}
                  {(!data.geo || data.geo.length === 0) && (
                    <tr><td colSpan="2" style={{ padding: '24px 0', textAlign: 'center', color: '#666' }}>{currentLang === 'he' ? 'אין נתונים זמינים' : 'No data available'}</td></tr>
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
