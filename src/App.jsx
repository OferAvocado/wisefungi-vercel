import Header from './components/Header';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Search, ChevronDown, ChevronRight, Lock, Save, Edit3, Plus, Trash2, Palette, Layout, Zap, Shield, Droplets, ArrowLeft, Home, Key, Globe } from 'lucide-react';
import { useEffect, useLayoutEffect, useState, useRef, useMemo, useCallback, Fragment } from 'react';
import translationHE from './locales/he.json';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationRU from './locales/ru.json';
import searchDataJson from './assets/searchData.json';
import originalInteractions from './assets/original_interactions.json';
import termsData from './locales/terms.json';
import RichTextEditor from './components/RichTextEditor';
import ThemeEditor from './components/ThemeEditor';
import AdminAuthModal from './components/AdminAuthModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { useAnalytics } from './hooks/useAnalytics';
import InteractionPage from './pages/InteractionPage';
import SEO from './components/SEO';
import CursorParticles from './components/CursorParticles';
import './App.css';
import SearchKeywordsDrawer from './components/SearchKeywordsDrawer';
const watermarkConfigs = {
  reishi: { tileHeight: 147, minHeight: 1572 },
  lions_mane: { tileHeight: 157, minHeight: 1572 },
  cordyceps: { tileHeight: 156, minHeight: 1348 },
  chaga: { tileHeight: 156, minHeight: 1148 },
  turkey_tail: { tileHeight: 145, minHeight: 1092 },
  tremella: { tileHeight: 141, minHeight: 1044 }
};

const defaultLocalReviews = [
  {
    id: '1',
    name: 'ניקולטה',
    rating: 5,
    comment: 'אתר מטורף מדהים כמה מפורט ונוח לשימוש איזה כיף שיש אתר ישראלי אותנטי כזה הבנתי שבנוסף יש קבוצה בווצאפ להסברה על הפטריות ועל שימוש נכון מדהים ממליצה ממש !'
  }
];



const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);
  
  // Clear old accessibility settings if this is a new app version
  // This prevents stale settings from causing issues
  const ACC_VERSION = 'v3';
  if (typeof window !== 'undefined' && localStorage.getItem('acc_version') !== ACC_VERSION) {
    ['acc_largeText','acc_highContrast','acc_grayscale','acc_highlightLinks',
     'acc_readableFont','acc_stopAnimations','acc_standardCursor'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('acc_version', ACC_VERSION);
  }
  
  // Accessibility features state
  const [largeText, setLargeText] = useState(() => localStorage.getItem('acc_largeText') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('acc_highContrast') === 'true');
  const [grayscale, setGrayscale] = useState(() => localStorage.getItem('acc_grayscale') === 'true');
  const [readableFont, setReadableFont] = useState(() => localStorage.getItem('acc_readableFont') === 'true');
  const [stopAnimations, setStopAnimations] = useState(() => localStorage.getItem('acc_stopAnimations') === 'true');
  const [standardCursor, setStandardCursor] = useState(() => {
    const saved = localStorage.getItem('acc_standardCursor');
    return saved !== null ? saved === 'true' : true;
  });


  // Synchronize state with DOM body/html classes
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    const updateClass = (state, className) => {
      if (state) {
        body.classList.add(className);
        html.classList.add(className);
      } else {
        body.classList.remove(className);
        html.classList.remove(className);
      }
    };

    updateClass(largeText, 'acc-large-text');
    updateClass(highContrast, 'acc-high-contrast');
    updateClass(grayscale, 'acc-grayscale');
    updateClass(readableFont, 'acc-readable-font');
    updateClass(stopAnimations, 'acc-stop-animations');
    updateClass(standardCursor, 'acc-standard-cursor');

    // Dynamic style tag for readable font override to ensure absolute coverage
    let styleTag = document.getElementById('acc-font-override');
    if (readableFont) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'acc-font-override';
        styleTag.innerHTML = `
          .acc-readable-font, .acc-readable-font *, .acc-readable-font #root * {
            font-family: Arial, "Arial Hebrew", Helvetica, sans-serif !important;
          }
        `;
        document.head.appendChild(styleTag);
      }
    } else {
      if (styleTag) {
        styleTag.remove();
      }
    }

    // Save to localStorage
    localStorage.setItem('acc_largeText', largeText);
    localStorage.setItem('acc_highContrast', highContrast);
    localStorage.setItem('acc_grayscale', grayscale);
    localStorage.setItem('acc_readableFont', readableFont);
    localStorage.setItem('acc_stopAnimations', stopAnimations);
    localStorage.setItem('acc_standardCursor', standardCursor);

    return () => {
      const tag = document.getElementById('acc-font-override');
      if (tag) tag.remove();
    };
  }, [largeText, highContrast, grayscale, readableFont, stopAnimations, standardCursor]);

  const handleReset = () => {
    setLargeText(false);
    setHighContrast(false);
    setGrayscale(false);
    setReadableFont(false);
    setStopAnimations(false);
    setStandardCursor(true);
  };

  return (
    <div className="accessibility-widget" ref={widgetRef}>
      {/* Floating Button */}
      <button 
        className="accessibility-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="נגישות"
        aria-label="תפריט נגישות"
      >
        <img src="/accessibility-icon.png" alt="נגישות" style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }} />
      </button>


      {/* Accessibility Panel Menu */}
      {isOpen && (
        <div className="accessibility-panel">
          <div className="accessibility-header">
            <h3>תפריט נגישות</h3>
            <button className="accessibility-close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="accessibility-menu-list">
            <button 
              className={`accessibility-option-btn ${largeText ? 'active' : ''}`}
              onClick={() => setLargeText(!largeText)}
            >
              <span>הגדלת גופן (+25%)</span>
              <span className="status-indicator"></span>
            </button>

            <button 
              className={`accessibility-option-btn ${highContrast ? 'active' : ''}`}
              onClick={() => setHighContrast(!highContrast)}
            >
              <span>ניגודיות גבוהה</span>
              <span className="status-indicator"></span>
            </button>

            <button 
              className={`accessibility-option-btn ${grayscale ? 'active' : ''}`}
              onClick={() => setGrayscale(!grayscale)}
            >
              <span>גווני אפור</span>
              <span className="status-indicator"></span>
            </button>

            <button 
              className={`accessibility-option-btn ${readableFont ? 'active' : ''}`}
              onClick={() => setReadableFont(!readableFont)}
            >
              <span>פונט קריא (Arial)</span>
              <span className="status-indicator"></span>
            </button>

            <button 
              className={`accessibility-option-btn ${stopAnimations ? 'active' : ''}`}
              onClick={() => setStopAnimations(!stopAnimations)}
            >
              <span>עצירת אנימציות</span>
              <span className="status-indicator"></span>
            </button>

            <button 
              className={`accessibility-option-btn ${standardCursor ? 'active' : ''}`}
              onClick={() => setStandardCursor(!standardCursor)}
            >
              <span>סמן עכבר רגיל</span>
              <span className="status-indicator"></span>
            </button>
          </div>

          <div className="accessibility-actions">
            <button className="accessibility-reset-btn" onClick={handleReset}>איפוס הגדרות</button>
            <button className="accessibility-statement-btn" onClick={() => setShowStatement(true)}>הצהרת נגישות</button>
          </div>
        </div>
      )}

      {/* Accessibility Statement Modal */}
      {showStatement && (
        <div className="acc-statement-backdrop" onClick={() => setShowStatement(false)}>
          <div className="acc-statement-modal" onClick={e => e.stopPropagation()}>
            <h4 className="acc-statement-title">הצהרת נגישות</h4>
            <div className="acc-statement-content">
              <p>
                אתר <strong>Wise Fungi</strong> מייחס חשיבות עליונה להנגשת שירותיו לכלל האוכלוסייה, ובפרט לאנשים עם מוגבלויות. אנו שואפים לספק חוויית גלישה שוויונית, נוחה ומכבדת לכל המבקרים באתר.
              </p>
              <p>
                התאמות הנגישות באתר זה בוצעו בהתאם לסימן ג' לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות) התשע"ג-2013, ולתקן הישראלי ת"י 5568 ברמת התאמה AA (המתבסס על הנחיות WCAG 2.1 העולמיות).
              </p>
              <p>
                <strong>פעולות שבוצעו במסגרת ההנגשה:</strong>
                ניווט מקלדת מלא, תמיכה בניגודיות גבוהה, הגדלת תצוגת טקסטים, הדגשה חזותית של קישורים, אפשרות לשימוש בגופנים נטולי סריף קריאים (Arial), והקפאת רכיבים זזים/אנימציות למניעת הסחות דעת.
              </p>
              <p>
                אם נתקלתם בקושי כלשהו במהלך הגלישה או שיש לכם משוב לשיפור הנגישות, נשמח לעמוד לרשותכם ולתקן בהקדם האפשרי דרך ערוצי התמיכה וצור הקשר באתר.
              </p>
            </div>
            <button className="acc-statement-close" onClick={() => setShowStatement(false)}>סגור הצהרה</button>
          </div>
        </div>
      )}
    </div>
  );
};


const safeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return val.split(/\n|\.\s|,|•/).map(x => x.trim()).filter(Boolean);
  }
  return [];
};

const MushroomIcon = ({ size = 20, active = true, color, style = {}, ...props }) => {
  const fillColor = color || (active ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)');
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      {...props}
    >
      <path 
        d="M40 25c-15 0-25 15-25 25 0 5 10 8 25 8s25-3 25-8c0-10-10-25-25-25zM32 58h16v12c0 3-16 3-16 0V58z" 
        fill={fillColor} 
      />
    </svg>
  );
};

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'•]/g, ' ')
    .replace(/סוכרת/g, 'סכרת')
    .replace(/יי/g, 'י')
    .split(/\s+/)
    .map(word => {
      if (word.length >= 4) {
        if (word.endsWith('ות')) return word.slice(0, -2);
        if (word.endsWith('ים')) return word.slice(0, -2);
        if (word.endsWith('ה')) return word.slice(0, -1);
        if (word.endsWith('ת')) return word.slice(0, -1);
        if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
      }
      return word;
    })
    .filter(Boolean)
    .join(' ');
};

const apiCache = { fungi: {}, ui: {} };


const intTrans = {
  he: {
    quickSearch: 'חיפוש אינטראקציות מהיר',
    directoryTitle: 'מדריך אינטראקציות מלא לפי קטגוריות',
    searchResults: 'תוצאות חיפוש',
    noResults: 'לא נמצאו אינטראקציות מתאימות לחיפוש "{{query}}"',
    category: 'קטגוריה',
    do_not_combine: 'אין לשלב — סיכון גבוה',
    use_caution: 'יש לנקוט זהירות',
    potential_synergy: 'סינרגיה פוטנציאלית',
    insufficient: 'אין מספיק מחקר / ראיות',
  },
  en: {
    quickSearch: 'Quick Interaction Search',
    directoryTitle: 'Full Interaction Directory by Category',
    searchResults: 'Search Results',
    noResults: 'No interactions matching "{{query}}"',
    category: 'Category',
    do_not_combine: 'Do NOT Combine — High Risk',
    use_caution: 'Use Caution — Moderate Interaction',
    potential_synergy: 'Potential Synergy — Helpful Combination',
    insufficient: 'Unknown / Insufficient Research',
  },
  es: {
    quickSearch: 'Búsqueda rápida de interacciones',
    directoryTitle: 'Directorio completo de interacciones por categoría',
    searchResults: 'Resultados de búsqueda',
    noResults: 'No se encontraron interacciones para "{{query}}"',
    category: 'Categoría',
    do_not_combine: 'NO Combinar — Riesgo Alto',
    use_caution: 'Usar con Precaución — Interacción Moderada',
    potential_synergy: 'Sinergia Potencial — Combinación Útil',
    insufficient: 'Desconocido / Investigación Insuficiente',
  },
  ru: {
    quickSearch: 'Быстрый поиск взаимодействий',
    directoryTitle: 'Полный справочник взаимодействий по категориям',
    searchResults: 'Результаты поиска',
    noResults: 'Нет взаимодействий по запросу "{{query}}"',
    category: 'Категория',
    do_not_combine: 'НЕ комбинировать — Высокий риск',
    use_caution: 'Соблюдать осторожность — Умеренное взаимодействие',
    potential_synergy: 'Потенциальная синергия — Полезное сочетание',
    insufficient: 'Недостаточно исследований',
  }
};

function App() {
  const { i18n, t } = useTranslation();
  const rawLang = i18n.language || 'he';
  const detectedLang = rawLang.split('-')[0].toLowerCase();
  const currentLang = ['he', 'en', 'es', 'ru'].includes(detectedLang) ? detectedLang : 'en';
  const tInt = (key, query = '') => {
    const lang = currentLang || 'en';
    const str = (intTrans[lang] || intTrans['en'])[key] || '';
    return str.replace('{{query}}', query);
  };
  const [mushroomsData, setMushroomsData] = useState(null);
  const [interactionsData, setInteractionsData] = useState(null);
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionQuery, setInteractionQuery] = useState('');
  const [expandedCats, setExpandedCats] = useState({ do_not_combine: false, use_caution: false, potential_synergy: false, insufficient: false });
  const [isSticky, setIsSticky] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [visualSelectedId, setVisualSelectedId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isKeywordsDrawerOpen, setIsKeywordsDrawerOpen] = useState(false);
  const [uiContent, setUiContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLangOpen, setIsModalLangOpen] = useState(false);
  const modalLangSelectorRef = useRef(null);

  // Analytics Hook
  const { trackPage } = useAnalytics();

  // Logo click counter for secret admin access
  const [logoClicks, setLogoClicks] = useState(0);

  // Reviews States
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!isModalLangOpen) return;
    const handleClickOutside = (event) => {
      if (modalLangSelectorRef.current && !modalLangSelectorRef.current.contains(event.target)) {
        setIsModalLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isModalLangOpen]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(3);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewEditing, setIsReviewEditing] = useState(false);
  const [editedReviews, setEditedReviews] = useState({});
  const [reviewSubmitError, setReviewSubmitError] = useState('');
  const reviewFormRef = useRef(null);

  useEffect(() => {
    if (!isReviewFormOpen) return;
    const handleClickOutside = (event) => {
      if (reviewFormRef.current && !reviewFormRef.current.contains(event.target)) {
        setIsReviewFormOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isReviewFormOpen]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        setReviews(defaultLocalReviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews(defaultLocalReviews);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      setReviewSubmitError(t('labels.review_error_empty'));
      return;
    }
    setIsSubmittingReview(true);
    setReviewSubmitError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReviewName,
          rating: newReviewRating,
          comment: newReviewComment
        })
      });
      if (res.ok) {
        setNewReviewName('');
        setNewReviewRating(3);
        setNewReviewComment('');
        setIsReviewFormOpen(false);
        await fetchReviews();
      } else {
        const errData = await res.json();
        setReviewSubmitError(errData.error || 'Failed to submit review');
      }
    } catch (err) {
      setReviewSubmitError('Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm(currentLang === 'he' ? 'האם אתה בטוח שברצונך למחוק ביקורת זו?' : 'Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id,
          secret: 'wise-fungi-secret'
        })
      });
      if (res.ok) {
        await fetchReviews();
      } else {
        alert('Failed to delete review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReview = async (id, updatedData) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id,
          name: updatedData.name,
          rating: updatedData.rating,
          comment: updatedData.comment,
          secret: 'wise-fungi-secret'
        })
      });
      if (res.ok) {
        const copy = { ...editedReviews };
        delete copy[id];
        setEditedReviews(copy);
        await fetchReviews();
        alert(currentLang === 'he' ? 'הביקורת עודכנה בהצלחה!' : 'Review updated successfully!');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Scroll restoration manual to prevent browser from scrolling to previous scroll position on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Explicitly reset selected mushroom on fresh entry/reload to put user on the home page
    setSelectedMushroom(null);
    
    // Track initial page load
    trackPage();

    const performScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    performScroll();
    // Run with small delays to ensure layout completes and overrides any browser restoration behavior
    const t1 = setTimeout(performScroll, 50);
    const t2 = setTimeout(performScroll, 150);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []); // Run EXACTLY ONCE on mount (page load/refresh)

  useEffect(() => {
    // Check if already an admin in this session
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) setIsAdmin(true);

    const fetchData = async () => {
      try {
        if (apiCache.fungi[currentLang]) {
          setMushroomsData(apiCache.fungi[currentLang]);
          setUiContent(apiCache.ui[currentLang]);
          setInteractionsData(originalInteractions);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        
        // Fetch from API with cache busting
        const response = await fetch(`/api/fungi?lang=${currentLang}&t=${Date.now()}`, { cache: 'no-store' });
        const dbData = await response.json();
        
        // Fetch UI content
        const uiResp = await fetch(`/api/ui?lang=${currentLang}&t=${Date.now()}`, { cache: 'no-store' });
        const uiData = await uiResp.json();
        
        let finalData;
        if (Object.keys(dbData).length > 0) {
          finalData = dbData;
        } else {
          // Fallback to local if DB is empty
          const dataMap = { 'he': translationHE, 'en': translationEN, 'es': translationES, 'ru': translationRU };
          const localData = dataMap[currentLang] || translationHE;
          finalData = localData.mushrooms;
        }
        
        apiCache.fungi[currentLang] = finalData;
        apiCache.ui[currentLang] = uiData || {};

        setMushroomsData(finalData);
        setInteractionsData(originalInteractions);
        setUiContent(apiCache.ui[currentLang]);
        
      } catch (err) {
        console.error("Fetch error, falling back to local JSON:", err);
        const dataMap = { 'he': translationHE, 'en': translationEN, 'es': translationES, 'ru': translationRU };
        const localData = dataMap[currentLang] || translationHE;
        setMushroomsData(localData.mushrooms);
        setInteractionsData(originalInteractions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchReviews();
  }, [currentLang, t]);

  useEffect(() => {
    const preloadLanguages = async () => {
      const langs = ['he', 'en', 'es', 'ru'];
      for (const l of langs) {
        if (l === currentLang || apiCache.fungi[l]) continue;
        try {
          const response = await fetch(`/api/fungi?lang=${l}&t=${Date.now()}`, { cache: 'no-store' });
          const dbData = await response.json();
          const uiResp = await fetch(`/api/ui?lang=${l}&t=${Date.now()}`, { cache: 'no-store' });
          const uiData = await uiResp.json();
          
          if (Object.keys(dbData).length > 0) {
            apiCache.fungi[l] = dbData;
          } else {
            const dataMap = { 'he': translationHE, 'en': translationEN, 'es': translationES, 'ru': translationRU };
            apiCache.fungi[l] = (dataMap[l] || translationHE).mushrooms;
          }
          apiCache.ui[l] = uiData || {};
        } catch (e) {
          // ignore
        }
      }
    };
    setTimeout(preloadLanguages, 1500); // delay preload so it doesn't block initial render
  }, [currentLang]);

  useEffect(() => {
    // The user requested that the scrollbar be on the RIGHT for Hebrew and LEFT for other languages.
    // The global scrollbar position is determined by the `dir` of `html`.
    // By setting `html` to 'ltr' in Hebrew, the scrollbar goes to the right.
    // But we must set `body` to 'rtl' so the actual content is still right-to-left.
    const isHe = currentLang === 'he';
    document.documentElement.dir = isHe ? 'rtl' : 'ltr';
    document.body.dir = isHe ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;

    const handleScroll = () => {
      // Trigger sticky state after scrolling past 100px
      // Keep sticky if we've scrolled down at all and there's an active search
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentLang]);

  useEffect(() => {
    if (selectedMushroom && mushroomsData && mushroomsData[selectedMushroom.id]) {
      setSelectedMushroom({ id: selectedMushroom.id, ...mushroomsData[selectedMushroom.id] });
      // Track specific mushroom view
      trackPage(`/${currentLang}/mushroom/${selectedMushroom.id}`);
    }
  }, [mushroomsData]);

  useEffect(() => {
    if (selectedMushroom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedMushroom]);

  useLayoutEffect(() => {
    setInteractionQuery('');
    setExpandedCats({
      do_not_combine: false,
      use_caution: false,
      potential_synergy: false,
      insufficient: false
    });
  }, [selectedMushroom, activeTab]);



  const modalBodyRef = useRef(null);
  const tabsRef = useRef(null);
  const footerLineRef = useRef(null);
  const modalContentRef = useRef(null);
  const [bgStartY, setBgStartY] = useState(300);
  const [bgBottom, setBgBottom] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);

  useLayoutEffect(() => {
    const updateBgStart = () => {
      if (tabsRef.current && modalContentRef.current) {
        const sepRect = tabsRef.current.getBoundingClientRect();
        const modalRect = modalContentRef.current.getBoundingClientRect();
        setBgStartY(sepRect.bottom - modalRect.top);
        setModalHeight(modalRect.height);
      }
      if (footerLineRef.current && modalContentRef.current) {
        const footerRect = footerLineRef.current.getBoundingClientRect();
        const modalRect = modalContentRef.current.getBoundingClientRect();
        setBgBottom(modalRect.bottom - footerRect.top);
        setModalHeight(modalRect.height);
      }
    };
    updateBgStart();
    window.addEventListener('resize', updateBgStart);
    return () => window.removeEventListener('resize', updateBgStart);
  }, [selectedMushroom, activeTab, isEditing, expandedCats, interactionQuery, editData]);

  const handleSelect = useCallback((m) => {
    setSelectedMushroom(m);
    
    const mapIdToSubstance = {
      reishi: 'Reishi', cordyceps: 'Cordyceps', lions_mane: "Lion's Mane",
      chaga: 'Chaga', turkey_tail: 'Turkey Tail', tremella: 'Tremella'
    };
    const engName = mapIdToSubstance[m.id] || m.id;
    let initialInteractions = originalInteractions[engName] || { do_not_combine: [], use_caution: [], potential_synergy: [], insufficient: [] };
    if (uiContent && uiContent[`int_${m.id}`]) {
      try { initialInteractions = JSON.parse(uiContent[`int_${m.id}`]); } catch(e){}
    }

    setEditData({ 
      ...m.detailed_data, 
      benefits: safeArray(m.detailed_data?.benefits),
      conditions: safeArray(m.detailed_data?.conditions),
      contraindications: safeArray(m.detailed_data?.contraindications),
      doctor_consultation: safeArray(m.detailed_data?.doctor_consultation),
      interactions: initialInteractions, 
      keywords: safeArray(m.keywords || m.search_keywords || []) 
    });
    setIsEditing(false);
    setActiveTab('info'); }, [uiContent]);

  const handleSave = async () => {
    try {
      const resp = await fetch('/api/fungi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
        body: JSON.stringify({ action: 'update', slug: selectedMushroom.id, lang: currentLang, data: { ...editData, name: selectedMushroom.name, subtitle: selectedMushroom.subtitle, image: selectedMushroom.image } })
      });
      if (resp.ok) {
        setMushroomsData(prev => ({ 
          ...prev, 
          [selectedMushroom.id]: { 
            ...prev[selectedMushroom.id], 
            name: selectedMushroom.name,
            subtitle: selectedMushroom.subtitle,
            keywords: editData.keywords,
            detailed_data: editData 
          } 
        }));
        
        if (currentLang === 'he') {
          setIsTranslating(true);
          try {
            await fetch('/api/auto_translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
              body: JSON.stringify({ type: 'fungi', slug: selectedMushroom.id })
            });
          } catch(e) { console.error(e); }
          setIsTranslating(false);
        }

        setIsEditing(false);
        alert(currentLang === 'he' ? 'השינויים נשמרו בהצלחה!' : 'Changes saved successfully!');
      } else {
        alert('Error saving data');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGlobalSave = async () => {
    try {
      // 1. Save UI Content
      const uiResp = await fetch('/api/fungi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
        body: JSON.stringify({ action: 'update_ui', lang: currentLang, data: uiContent })
      });

      // 2. Save Fungi tags/titles that were modified on the grid
      const promises = allMushrooms.map(m => 
        fetch('/api/fungi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
          body: JSON.stringify({ action: 'update', slug: m.id, lang: currentLang, data: { ...m.detailed_data, name: m.name, subtitle: m.subtitle, keywords: m.keywords, image: m.image } })
        })
      );

      await Promise.all(promises);

      if (uiResp.ok) {
        if (currentLang === 'he') {
          setIsTranslating(true);
          try {
            // Translate all modified UI keys
            const uiPromises = Object.keys(uiContent).map(k => 
              fetch('/api/auto_translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
                body: JSON.stringify({ type: 'ui', key: k })
              })
            );
            // Translate all mushrooms
            const fungiPromises = allMushrooms.map(m => 
              fetch('/api/auto_translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('adminToken') },
                body: JSON.stringify({ type: 'fungi', slug: m.id })
              })
            );
            await Promise.all([...uiPromises, ...fungiPromises]);
          } catch(e) { console.error(e); }
          setIsTranslating(false);
        }

        setIsGlobalEditing(false);
        alert(currentLang === 'he' ? 'השינויים הכלליים נשמרו בהצלחה!' : 'Global changes saved!');
      } else {
        const errorData = await uiResp.text();
        console.error("Save error:", errorData);
        alert('Error saving global data');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      if (prev + 1 >= 5) {
        setIsLoginModalOpen(true);
        return 0;
      }
      return prev + 1;
    });
    // Reset clicks after 3 seconds of inactivity
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const FIXED_ORDER = ['reishi', 'lions_mane', 'cordyceps', 'chaga', 'turkey_tail', 'tremella'];
  const allMushrooms = useMemo(() => {
    return Object.entries(mushroomsData || {})
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => {
        let idxA = FIXED_ORDER.indexOf(a.id);
        let idxB = FIXED_ORDER.indexOf(b.id);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
      });
  }, [mushroomsData]);
  
  const rawSearchIndex = searchDataJson.index;

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const query = debouncedSearchQuery.toLowerCase();
  
  // Create a normalized map to align English names with our local IDs
  // Since we don't have a direct DB ID to local ID mapping, we match by English name
  const enMushroomMap = {
    "Reishi": "reishi",
    "Lion's Mane": "lions_mane",
    "Cordyceps": "cordyceps",
    "Chaga": "chaga",
    "Turkey Tail": "turkey_tail",
    "Tremella": "tremella"
  };

  const filteredMushrooms = useMemo(() => {
    return allMushrooms.filter(m => {
      if (!query.trim()) return true;
      
      const queryWords = query.split(/\s+/).filter(Boolean);
      if (queryWords.length === 0) return true;

      // EVERY word in the query must match at least one field of this mushroom
      return queryWords.every(qWord => {
        const qWordLower = qWord.toLowerCase();
        const normQWord = normalizeText(qWord);

        // Collect all translated variants of this single word
        const qWordVariants = new Set([qWordLower]);
        for (const lang of ['he', 'en', 'ru', 'es']) {
          const langDict = termsData[lang] || {};
          for (const [key, val] of Object.entries(langDict)) {
            if (key.includes(qWordLower) || val.toLowerCase().includes(qWordLower)) {
              if (termsData.en[key]) qWordVariants.add(termsData.en[key].toLowerCase());
              if (termsData.he[key]) qWordVariants.add(termsData.he[key].toLowerCase());
              if (termsData.ru[key]) qWordVariants.add(termsData.ru[key].toLowerCase());
              if (termsData.es[key]) qWordVariants.add(termsData.es[key].toLowerCase());
            }
          }
        }

        // Helper to check if any of the word variants is a substring/normalized match of the target string/array
        const checkFieldMatch = (fieldValue) => {
          const checkString = (str) => {
            const strLower = str.toLowerCase();
            const normStr = normalizeText(str);
            return Array.from(qWordVariants).some(v => {
              const vLower = v.toLowerCase();
              const normV = normalizeText(v);
              return (
                strLower.includes(vLower) || 
                (normV && normStr.includes(normV))
              );
            });
          };
          return safeArray(fieldValue).some(item => item && checkString(item));
        };

        // 1. Check if name matches in any language
        const locales = [translationHE, translationEN, translationES, translationRU];
        const nameMatch = locales.some(locale => {
          const lm = locale.mushrooms?.[m.id];
          return lm && lm.name && checkFieldMatch(lm.name);
        });
        if (nameMatch) return true;

        if (m.scientific_name && checkFieldMatch(m.scientific_name)) return true;

        // 2. Check if any keyword in the search index matches cross-lingually
        const dbMatch = Object.values(rawSearchIndex).some(row => {
          if (enMushroomMap[row.mushroom_name_en] !== m.id) return false;
          return checkFieldMatch(row.keyword);
        });
        if (dbMatch) return true;

        // 3. Check database conditions cross-lingually (excluding benefits to reduce false positives like "pain")
        if (m.detailed_data) {
          if (checkFieldMatch(m.detailed_data.conditions)) return true;
        }

        // 4. Check database-only keywords cross-lingually
        const dbKeywords = m.keywords || m.search_keywords || [];
        if (checkFieldMatch(dbKeywords)) return true;

        return false;
      });
    });
  }, [allMushrooms, query]);

  const suggestions = useMemo(() => {
    if (searchQuery.length === 0) return [];
    
    const uniqueSuggestionsMap = new Map();
    const locales = [translationHE, translationEN, translationES, translationRU];
    const rawTerms = new Set();
    const mushroomsObj = mushroomsData || {};

    // 1. Gather all terms from terms.json (ensures we get pregnancy, surgery, etc.)
    Object.keys(termsData.en || {}).forEach(key => {
      rawTerms.add(JSON.stringify({ text: key, isMushroom: false }));
    });

    // 2. Gather names of mushrooms
    allMushrooms.forEach(m => {
      rawTerms.add(JSON.stringify({ text: m.name, isMushroom: true, mushroomId: m.id }));
      if (m.scientific_name) {
        rawTerms.add(JSON.stringify({ text: m.scientific_name, isMushroom: true, mushroomId: m.id }));
      }
    });

    // 3. Gather conditions, benefits, and keywords from database
    allMushrooms.forEach(m => {
      if (m.detailed_data) {
        if (m.detailed_data.conditions) {
          safeArray(m.detailed_data.conditions).forEach(c => c && rawTerms.add(JSON.stringify({ text: c, isMushroom: false })));
        }
        if (m.detailed_data.benefits) {
          safeArray(m.detailed_data.benefits).forEach(b => b && rawTerms.add(JSON.stringify({ text: b, isMushroom: false })));
        }
      }
      const kw = safeArray(m.keywords || m.search_keywords || []);
      kw.forEach(k => k && rawTerms.add(JSON.stringify({ text: k, isMushroom: false })));
    });

    // Helper to check if a specific term (including its translations) matches at least one mushroom
    const termMatchesAtLeastOneMushroom = (text, isMushroom, mushroomId) => {
      if (isMushroom && mushroomId) return true; // Mushroom names always match
      const termLower = text.toLowerCase();
      
      // Get all translations for this term
      const termVariants = new Set([termLower]);
      let engKey = null;
      if (termsData.en[termLower]) {
        engKey = termLower;
      } else {
        for (const lang of ['he', 'en', 'ru', 'es']) {
          const langDict = termsData[lang] || {};
          for (const [key, val] of Object.entries(langDict)) {
            if (val.toLowerCase() === termLower) {
              engKey = key;
              break;
            }
          }
          if (engKey) break;
        }
      }

      if (engKey) {
        if (termsData.en[engKey]) termVariants.add(termsData.en[engKey].toLowerCase());
        if (termsData.he[engKey]) termVariants.add(termsData.he[engKey].toLowerCase());
        if (termsData.ru[engKey]) termVariants.add(termsData.ru[engKey].toLowerCase());
        if (termsData.es[engKey]) termVariants.add(termsData.es[engKey].toLowerCase());
      }

      // Check if any variant is present in any text field of any mushroom
      const checkString = (str) => {
        if (!str) return false;
        const strLower = str.toLowerCase();
        const normStr = normalizeText(str);
        return Array.from(termVariants).some(v => {
          const vLower = v.toLowerCase();
          const normV = normalizeText(v);
          return (
            strLower.includes(vLower) || 
            (normV && normStr.includes(normV))
          );
        });
      };

      const checkField = (fieldValue) => {
        return safeArray(fieldValue).some(item => item && checkString(item));
      };

      return allMushrooms.some(m => {
        // Check name match
        const nameMatch = locales.some(locale => {
          const lm = locale.mushrooms?.[m.id];
          return lm && lm.name && checkString(lm.name);
        });
        if (nameMatch) return true;

        if (m.scientific_name && checkString(m.scientific_name)) return true;

        if (m.detailed_data) {
          if (checkField(m.detailed_data.benefits)) return true;
          if (checkField(m.detailed_data.conditions)) return true;
        }

        const dbKeywords = safeArray(m.keywords || m.search_keywords || []);
        if (checkField(dbKeywords)) return true;

        return false;
      });
    };

    // Filter and translate matched candidates
    rawTerms.forEach(termStr => {
      const { text, isMushroom, mushroomId } = JSON.parse(termStr);
      let suggestionTerm = '';

      if (isMushroom && mushroomId) {
        const currentItem = mushroomsObj[mushroomId];
        suggestionTerm = currentItem ? currentItem.name : text;
      } else {
        const termLower = text.toLowerCase();
        suggestionTerm = termsData[currentLang]?.[termLower] || termsData['en']?.[termLower] || text;
        
        if (suggestionTerm === text) {
          for (const lang of ['he', 'en', 'ru', 'es']) {
            const langDict = termsData[lang] || {};
            for (const [key, val] of Object.entries(langDict)) {
              if (val.toLowerCase() === termLower) {
                suggestionTerm = termsData[currentLang]?.[key] || termsData['en']?.[key] || val;
                break;
              }
            }
            if (suggestionTerm !== text) break;
          }
        }
      }

      // Check if this term matches the query in any language (using tokenized multi-word search)
      const queryWords = query.split(/\s+/).filter(Boolean);
      let matchesQuery = queryWords.length > 0 && queryWords.every(qWord => {
        const qWordLower = qWord.toLowerCase();
        const normQWord = normalizeText(qWord);

        if (isMushroom && mushroomId) {
          const matchName = locales.some(locale => {
            const lm = locale.mushrooms?.[mushroomId];
            if (!lm || !lm.name) return false;
            const nameLower = lm.name.toLowerCase();
            const normName = normalizeText(lm.name);
            return (
              nameLower.includes(qWordLower) ||
              qWordLower.includes(nameLower) ||
              (normQWord && normName.includes(normQWord)) ||
              (normQWord && normQWord.includes(normName))
            );
          });
          if (matchName) return true;

          const currentItem = mushroomsObj[mushroomId];
          if (currentItem && currentItem.scientific_name) {
            const scLower = currentItem.scientific_name.toLowerCase();
            const normSc = normalizeText(currentItem.scientific_name);
            if (
              scLower.includes(qWordLower) ||
              qWordLower.includes(scLower) ||
              (normQWord && normSc.includes(normQWord)) ||
              (normQWord && normQWord.includes(normSc))
            ) {
              return true;
            }
          }
          return false;
        } else {
          const termLower = text.toLowerCase();
          const normTerm = normalizeText(text);
          const matchText = 
            termLower.includes(qWordLower) || 
            qWordLower.includes(termLower) ||
            (normQWord && normTerm.includes(normQWord)) || 
            (normQWord && normQWord.includes(normTerm));

          if (matchText) return true;

          let engKey = null;
          if (termsData.en[termLower]) {
            engKey = termLower;
          } else {
            for (const lang of ['he', 'en', 'ru', 'es']) {
              const langDict = termsData[lang] || {};
              for (const [key, val] of Object.entries(langDict)) {
                if (val.toLowerCase() === termLower) {
                  engKey = key;
                  break;
                }
              }
              if (engKey) break;
            }
          }

          if (engKey) {
            const checkEngMatch = (val) => {
              if (!val) return false;
              const valLower = val.toLowerCase();
              const normVal = normalizeText(val);
              return (
                valLower.includes(qWordLower) ||
                qWordLower.includes(valLower) ||
                (normQWord && normVal.includes(normQWord)) ||
                (normQWord && normQWord.includes(normVal))
              );
            };
            if (
              checkEngMatch(engKey) ||
              checkEngMatch(termsData.en[engKey]) ||
              checkEngMatch(termsData.he[engKey]) ||
              checkEngMatch(termsData.ru[engKey]) ||
              checkEngMatch(termsData.es[engKey])
            ) {
              return true;
            }
          }
          return false;
        }
      });

      // Validate that the term has matches in the DB before suggesting it
      if (matchesQuery && suggestionTerm) {
        if (termMatchesAtLeastOneMushroom(text, isMushroom, mushroomId)) {
          const formatted = suggestionTerm.trim();
          uniqueSuggestionsMap.set(formatted.toLowerCase(), formatted);
        }
      }
    });

    const sortedSuggestions = [...uniqueSuggestionsMap.values()].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const qLower = query.toLowerCase();
      const aNorm = normalizeText(a);
      const bNorm = normalizeText(b);
      const qNorm = normalizeText(query);
      
      // 1. Exact match (case insensitive or normalized)
      const aExact = aLower === qLower || aNorm === qNorm;
      const bExact = bLower === qLower || bNorm === qNorm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // 2. Starts with query (prefix match)
      const aStartsWith = aLower.startsWith(qLower) || aNorm.startsWith(qNorm);
      const bStartsWith = bLower.startsWith(qLower) || bNorm.startsWith(qNorm);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // 3. Keep alphabetical or original order
      return a.localeCompare(b);
    });

    return sortedSuggestions.slice(0, 3);
  }, [searchQuery, currentLang, allMushrooms, mushroomsData, query]);

  const mData = selectedMushroom?.detailed_data;

  const defaultTheme = {
    bgPrimary: '#0a0a0a',
    bgSecondary: '#121212',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    accentPrimary: '#16a34a',
    bentoBg: 'rgba(255, 255, 255, 0.05)',
    bentoBorder: 'transparent',
    benefitIconShape: 'CheckCircle', benefitIconColor: '#22c55e',
    doctorIconShape: 'AlertTriangle', doctorIconColor: '#E0C23B',
    contraIconShape: 'XCircle', contraIconColor: '#E56767'
  };
  const theme = uiContent?.globalTheme || defaultTheme;

  const renderDynamicIcon = (shape, props) => {
    switch (shape) {
      case 'Star': return <svg width={props.size} height={props.size} fill={props.color} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
      case 'Heart': return <svg width={props.size} height={props.size} fill={props.color} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
      case 'Zap': return <Zap {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'Droplet': return <Droplets {...props} />;
      case 'AlertTriangle': return <AlertTriangle {...props} />;
      case 'XCircle': return <XCircle {...props} />;
      default: return <CheckCircle {...props} />;
    }
  };

  const generateCustomCSS = () => {
    if (!uiContent?.customStyles) return '';
    let css = '';
    Object.entries(uiContent.customStyles).forEach(([id, devices]) => {
      if (devices.desktop) css += `[data-editable="${id}"] { ${Object.entries(devices.desktop).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v} !important;`).join(' ')} }\n`;
      if (devices.tablet) css += `@media (max-width: 1024px) { [data-editable="${id}"] { ${Object.entries(devices.tablet).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v} !important;`).join(' ')} } }\n`;
      if (devices.mobile) css += `@media (max-width: 768px) { [data-editable="${id}"] { ${Object.entries(devices.mobile).map(([k,v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v} !important;`).join(' ')} } }\n`;
    });
    return css;
  };

  const generateThemeCSS = () => {
    const t = uiContent?.globalTheme;
    if (!t) return '';
    return `
      :root {
        ${t.bgPrimary ? `--bg-primary: ${t.bgPrimary};` : ''}
        ${t.bgSecondary ? `--bg-secondary: ${t.bgSecondary};` : ''}
        ${t.accentPrimary ? `--accent-primary: ${t.accentPrimary};` : ''}
        ${t.textPrimary ? `--text-primary: ${t.textPrimary};` : ''}
        ${t.textSecondary ? `--text-secondary: ${t.textSecondary};` : ''}
        ${t.bgGlass ? `--bg-glass: ${t.bgGlass};` : ''}
        ${t.borderGlass ? `--border-glass: ${t.borderGlass};` : ''}
      }
      body {
        ${t.bgPrimary ? `background-color: var(--bg-primary) !important;` : ''}
      }
    `;
  };

  useEffect(() => {
    if (!isVisualEditorOpen) return;
    const handleClick = (e) => {
      if (e.target.closest('.ve-panel') || e.target.closest('.admin-status-bar')) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target.closest('[data-editable]');
      if (el) {
        setVisualSelectedId(el.getAttribute('data-editable'));
      }
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('.ve-panel') || e.target.closest('.admin-status-bar')) return;
      const el = e.target.closest('[data-editable]');
      if (el) el.style.outline = '2px dashed #007acc';
    };
    const handleMouseOut = (e) => {
      const el = e.target.closest('[data-editable]');
      if (el) el.style.outline = '';
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isVisualEditorOpen]);

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  
  // Analytics Admin Route Interception
  if (window.location.pathname === '/admin/analytics') {
    if (!isAdmin) {
      // Force admin login if trying to view analytics without token
      return (
        <div style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CursorParticles />
          <AdminAuthModal 
            isOpen={true} 
            onClose={() => window.location.href = '/'} 
            onLoginSuccess={(token) => {
              localStorage.setItem('adminToken', token);
              window.location.reload();
            }}
            currentLang={currentLang} 
          />
        </div>
      );
    }
    return (
      <>
        <CursorParticles />
        <AnalyticsDashboard onBack={() => window.location.href = '/'} />
      </>
    );
  }

  // e.g. /he/interactions/lions-mane/cbd
  const isInteractionRoute = pathParts.length >= 3 && pathParts[1] === 'interactions';
  if (isInteractionRoute) {
    return (
      <>
        <CursorParticles />
        <InteractionPage lang={pathParts[0]} mushroomId={pathParts[2]} vectorId={pathParts[3]} />
      </>
    );
  }

  return (
    <div className={`app-container ${isAdmin ? 'is-admin' : ''} ${isAdmin && !isVisualEditorOpen ? 'is-admin-bar-visible' : ''}`}>
      <CursorParticles />
      <SEO 
        title={uiContent.site_title || "Wise Fungi - המדריך המפורט לפטריות מרפא"} 
        description={uiContent.site_desc || "המדריך המפורט ביותר לפטריות מרפא ברשת. ריישי, רעמת האריה, קורדיספס, צ'אגה ועוד."} 
        canonicalPath="" 
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        ${generateCustomCSS()}
        ${generateThemeCSS()}
      `}} />

      {isLoading && (
        <div className="loading-overlay">
          <MushroomIcon 
            size={70} 
            color="#ffffff" 
            style={{ 
              animation: 'spin 1.5s linear infinite', 
              filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))' 
            }} 
          />
        </div>
      )}

      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {isTranslating && (
        <div className="loading-overlay" style={{ flexDirection: 'column', gap: '1.5rem' }}>
          <MushroomIcon 
            size={70} 
            color="#ffffff" 
            style={{ 
              animation: 'spin 1.5s linear infinite', 
              filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))' 
            }} 
          />
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {currentLang === 'he' ? 'מתרגם ומסנכרן שפות (זה יכול לקחת כמה שניות)...' : 'Translating...'}
          </div>
        </div>
      )}

      {isAdmin && !isVisualEditorOpen && (
        <div className="admin-status-bar">
          <Lock size={14} /> {currentLang === 'he' ? 'מצב מנהל פעיל' : 'Admin Mode Active'}
          
          <button 
            onClick={() => isGlobalEditing ? handleGlobalSave() : setIsGlobalEditing(true)} 
            className="admin-logout-btn" 
            style={{ marginLeft: '1rem', background: isGlobalEditing ? 'white' : 'rgba(255,255,255,0.2)', color: isGlobalEditing ? '#16a34a' : 'white', fontWeight: 'bold' }}
          >
            {isGlobalEditing ? 
              (currentLang === 'he' ? 'שמור דף הבית' : 'Save Homepage') : 
              (currentLang === 'he' ? 'ערוך דף הבית' : 'Edit Homepage')
            }
          </button>

          <button 
            onClick={() => setIsKeywordsDrawerOpen(true)}
            className="admin-logout-btn" 
            style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(0, 242, 254, 0.9))', color: 'white', fontWeight: 'bold' }}
          >
            <Key size={14} style={{ transform: 'rotate(90deg)' }} /> {currentLang === 'he' ? 'ערוך מילות מפתח' : 'Edit Keywords'}
          </button>

          <button 
            onClick={() => { setIsThemeOpen(true); setIsVisualEditorOpen(false); }} 
            className="admin-logout-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Palette size={14} /> עיצוב מותאם אישית
          </button>

          <button 
            onClick={() => { setIsVisualEditorOpen(true); setIsThemeOpen(false); }} 
            className="admin-logout-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#007acc', color: 'white', fontWeight: 'bold', border: '1px solid #005f9e' }}
          >
            <Layout size={14} /> עורך סגנונות וצבעים מתקדם
          </button>

          <button onClick={() => { setIsAdmin(false); setIsGlobalEditing(false); localStorage.removeItem('adminToken'); }} className="admin-logout-btn">
            {currentLang === 'he' ? 'התנתק' : 'Logout'}
          </button>
        </div>
      )}

      {isVisualEditorOpen && (
        <VisualEditor 
          uiContent={uiContent} 
          setUiContent={setUiContent} 
          selectedId={visualSelectedId}
          setSelectedId={setVisualSelectedId}
          onSave={handleGlobalSave} 
          onClose={() => setIsVisualEditorOpen(false)} 
        />
      )}

      {isThemeOpen && !isVisualEditorOpen && (
        <ThemeEditor 
          theme={uiContent?.globalTheme || defaultTheme} 
          setTheme={(t) => setUiContent({ ...uiContent, globalTheme: t(uiContent?.globalTheme || defaultTheme) })} 
          onSave={() => handleGlobalSave()} 
          onClose={() => setIsThemeOpen(false)} 
        />
      )}

      <Header 
        isSticky={isSticky} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onLogoClick={handleLogoClick}
        selectedMushroom={selectedMushroom}
      />
      
      <main className="main-content">
        {!selectedMushroom ? (
          <>
            <Hero 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              isSticky={isSticky} 
              suggestions={suggestions}
              uiContent={uiContent}
              setUiContent={setUiContent}
              isGlobalEditing={isGlobalEditing}
            />
            {filteredMushrooms.length > 0 ? (
              <BentoGrid 
                mushrooms={filteredMushrooms} 
                onSelect={handleSelect} 
                isGlobalEditing={isGlobalEditing}
                setMushroomsData={setMushroomsData}
              />
            ) : (
              <div className="no-results-container">
                <h2 className="no-results-title">{t('no_results', { query: searchQuery })}</h2>
                <p className="no-results-subtitle">{t('try_searching')}</p>
              </div>
            )}

            {/* Reviews Section */}
            <section className="reviews-section" style={{ direction: currentLang === 'he' ? 'rtl' : 'ltr' }}>
              <div className="reviews-container">
                {/* Write Review Button */}
                {!isReviewFormOpen && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    <button 
                      className="add-review-btn" 
                      onClick={() => setIsReviewFormOpen(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <span>{t('labels.add_review_btn')}</span>
                      <MushroomIcon size={33} active={true} />
                    </button>
                  </div>
                )}

                {/* Write Review Form */}
                {isReviewFormOpen && (
                  <div className="review-form-panel glass-panel" ref={reviewFormRef}>
                    <button
                      className="review-form-close"
                      onClick={() => setIsReviewFormOpen(false)}
                      style={currentLang === 'he' ? { left: '1.2rem', right: 'auto' } : { right: '1.2rem', left: 'auto' }}
                    >&times;</button>
                    <h3 className="review-form-title">{t('labels.review_form_title')}</h3>
                    
                    <form onSubmit={handleSubmitReview} className="review-form">
                      <div className="review-form-field">
                        <label className="review-form-label">{t('labels.review_name_label')}</label>
                        <input 
                          type="text" 
                          className="review-form-input" 
                          placeholder={t('labels.review_name_placeholder')} 
                          value={newReviewName} 
                          onChange={e => setNewReviewName(e.target.value)} 
                        />
                      </div>
                      
                      <div className="review-form-field">
                        <label className="review-form-label">{t('labels.review_rating_label')}</label>
                        <div className="stars-rating" style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.2rem' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span 
                              key={s} 
                              className={`star-icon-clickable ${newReviewRating >= s ? 'active' : ''}`}
                              onClick={() => setNewReviewRating(s)}
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <MushroomIcon size={33} active={newReviewRating >= s} />
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="review-form-field">
                        <label className="review-form-label">{t('labels.review_comment_label')}</label>
                        <textarea 
                          className="review-form-textarea" 
                          placeholder={t('labels.review_comment_placeholder')} 
                          value={newReviewComment}
                          onChange={e => setNewReviewComment(e.target.value)}
                          rows={4}
                        />
                      </div>

                      {reviewSubmitError && (
                        <div className="review-submit-error">
                          {reviewSubmitError}
                        </div>
                      )}
                      
                      <div className="review-form-actions">
                        <button type="submit" className="review-submit-btn" disabled={isSubmittingReview}>
                          <span className="send-icon" style={{ marginLeft: '0.4rem', transform: 'rotate(90deg)', display: 'inline-block' }}>➤</span>
                          {isSubmittingReview ? t('labels.review_submitting') : t('labels.review_submit')}
                        </button>
                        <button type="button" className="review-cancel-btn" onClick={() => setIsReviewFormOpen(false)}>
                          {t('labels.review_cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Section Header */}
                <div className="reviews-header-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', position: 'relative' }}>
                  <h2 className="reviews-header-title" style={{ marginBottom: isAdmin ? '1rem' : '0' }}>{t('labels.reviews_title')}</h2>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setIsReviewEditing(!isReviewEditing);
                        setEditedReviews({}); // reset edit values
                      }} 
                      className={`admin-reviews-toggle-btn ${isReviewEditing ? 'active' : ''}`}
                    >
                      {isReviewEditing ? (
                        <>
                          <CheckCircle size={16} /> <span>{t('labels.admin_reviews_done')}</span>
                        </>
                      ) : (
                        <>
                          <Edit3 size={16} /> <span>{t('labels.admin_reviews_manage')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Reviews List */}
                <div className="reviews-grid">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((r) => {
                      const isEditingThis = isReviewEditing;
                      const editVal = editedReviews[r.id] || { name: r.name, rating: r.rating, comment: r.comment };
                      
                      const updateField = (field, val) => {
                        setEditedReviews({
                          ...editedReviews,
                          [r.id]: {
                            ...editVal,
                            [field]: val
                          }
                        });
                      };

                      return (
                        <div key={r.id || r.created_at} className={`review-card glass-panel ${isEditingThis ? 'editing' : ''}`}>
                          {isEditingThis ? (
                            <div className="review-edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="review-form-label" style={{ fontSize: '0.85rem' }}>עריכת שם:</label>
                                <button 
                                  className="review-card-delete-btn" 
                                  onClick={() => handleDeleteReview(r.id)}
                                  title="מחק ביקורת"
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}
                                >
                                  <Trash2 size={16} /> <span>מחק</span>
                                </button>
                              </div>
                              <input 
                                type="text" 
                                className="review-form-input" 
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem', width: '100%' }}
                                value={editVal.name} 
                                onChange={e => updateField('name', e.target.value)} 
                              />
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                                <label className="review-form-label" style={{ fontSize: '0.85rem' }}>דירוג:</label>
                                <div className="stars-rating" style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.2rem' }}>
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span 
                                      key={s} 
                                      className={`star-icon-clickable ${editVal.rating >= s ? 'active' : ''}`}
                                      onClick={() => updateField('rating', s)}
                                      style={{ display: 'inline-flex', alignItems: 'center' }}
                                    >
                                      <MushroomIcon size={33} active={editVal.rating >= s} />
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <label className="review-form-label" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>עריכת תוכן:</label>
                              <textarea 
                                className="review-form-textarea" 
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem', width: '100%' }}
                                value={editVal.comment} 
                                onChange={e => updateField('comment', e.target.value)} 
                                rows={3}
                              />
                              
                              <button 
                                className="review-submit-btn" 
                                style={{ marginTop: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', width: '100%' }}
                                onClick={() => handleUpdateReview(r.id, editVal)}
                              >
                                שמור שינויים
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="review-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h4 className="review-author" style={{ margin: 0 }}>{r.name}</h4>
                                <div className="review-stars" style={{ display: 'flex', justifyContent: 'flex-start', paddingBottom: '0.5rem', marginBottom: '0.5rem', position: 'relative' }}>
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <span 
                                      key={idx} 
                                      className={`star-icon-display ${idx < r.rating ? 'active' : 'inactive'}`}
                                      style={{ display: 'inline-flex', alignItems: 'center' }}
                                    >
                                      <MushroomIcon size={33} active={idx < r.rating} />
                                    </span>
                                  ))}
                                  <div className="review-divider" />
                                </div>
                              </div>
                              <p className="review-text">{r.comment}</p>
                            </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="reviews-loading">טוען ביקורות...</div>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className={`modal-overlay ${selectedMushroom.id}`} data-editable="modal-overlay">
            <button className="back-home-btn floating-back-btn" onClick={() => setSelectedMushroom(null)} data-editable="back-home-btn">
              <span>{t('labels.back_button') || (currentLang === 'he' ? 'חזור' : 'Back')}</span>
              {currentLang === 'he' ? <ChevronRight size={20} /> : <ArrowLeft size={20} />}
            </button>

            <div className="modal-lang-selector" ref={modalLangSelectorRef}>
              <button 
                className="lang-btn floating-lang-btn" 
                onClick={() => setIsModalLangOpen(prev => !prev)}
                aria-label="Change Language"
                aria-expanded={isModalLangOpen}
              >
                <Globe size={18} />
                <span className="lang-text">{currentLang.toUpperCase()}</span>
                <ChevronDown size={14} className={`chevron ${isModalLangOpen ? 'rotate' : ''}`} />
              </button>
              {isModalLangOpen && (
                <div className="lang-dropdown modal-lang-dropdown animate-fade-in glass-panel">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'he', label: 'עברית' },
                    { code: 'es', label: 'Español' },
                    { code: 'ru', label: 'Русский' }
                  ].map((lang) => (
                    <button 
                      key={lang.code}
                      className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsModalLangOpen(false);
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={modalContentRef} className={`modal-content glass-panel animate-in ${selectedMushroom.id}`} data-editable="modal-content" style={{ position: 'relative', zIndex: 1 }}>
              {(() => {
                const normId = selectedMushroom.id.replace(/-/g, '_');
                const config = watermarkConfigs[normId] || { tileHeight: 140 };
                // All icon files have been symmetrically padded to exactly 50px on all sides.
                // With the calculated tileHeights, this yields exactly 33px of scaled visual offset for every single mushroom.
                const targetVisualStart = 10;
                // Div strictly starts AT the separator line, so it NEVER bleeds up
                const topOffset = bgStartY;
                const bgShiftY = -(33 - targetVisualStart);
                const bottomOffset = bgBottom + config.tileHeight;
                const availableHeight = modalHeight - topOffset - bottomOffset;
                const watermarkHeight = Math.max(0, Math.ceil(availableHeight / config.tileHeight) * config.tileHeight);
                const isDarker = normId === 'chaga' || normId === 'reishi' || normId === 'turkey_tail';
                const dimOpacity = isDarker ? '70%' : '45%';
                return (
                  <>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        backgroundImage: `
                          radial-gradient(circle at 10% 20%, color-mix(in srgb, var(--mush-top, #22c55e) 15%, transparent) 0%, transparent 50%),
                          radial-gradient(circle at 90% 80%, color-mix(in srgb, var(--mush-top, #22c55e) 8%, transparent) 0%, transparent 50%)
                        `,
                        pointerEvents: 'none', 
                        zIndex: -2 
                      }} 
                    />

                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: topOffset, 
                        height: watermarkHeight, 
                        left: 0, 
                        right: 0, 
                        backgroundImage: `url(/assets/${normId}_icon.png)`, 
                        backgroundSize: `auto ${config.tileHeight}px`, 
                        backgroundPosition: `center ${bgShiftY}px`,
                        backgroundRepeat: 'repeat', 
                        opacity: 0.18, 
                        pointerEvents: 'none', 
                        zIndex: -1 
                      }} 
                    />
                    {/* Delicate dimming overlay layer */}
                    {normId !== 'lions_mane' && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          right: 0, 
                          backgroundColor: `color-mix(in srgb, var(--mush-bottom, #0a140c) ${dimOpacity}, transparent)`, 
                          pointerEvents: 'none', 
                          zIndex: -1 
                        }} 
                      />
                    )}
                  </>
                );
              })()}

            <div className="modal-header" data-editable="modal-header">
              <div className="modal-header-top" data-editable="modal-header-top">
                <div className="modal-image-container" data-editable="modal-image-container">
                  <img src={selectedMushroom.detailed_data?.detail_image || selectedMushroom.image} alt={selectedMushroom.name} className="modal-image" data-editable="modal-image" />
                </div>
                <div className="modal-text-container">
                  <div className="modal-title-wrapper">
                    {isEditing ? (
                      <>
                        <input 
                          className="admin-edit-input" 
                          style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '0.5rem', textAlign: 'center' }}
                          value={selectedMushroom.name || ''} 
                          onChange={e => setSelectedMushroom({...selectedMushroom, name: e.target.value})} 
                        />
                        <div className="fade-line" style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)', margin: '1rem 0', width: '100%' }}></div>
                        <input 
                          className="admin-edit-input" 
                          style={{ fontSize: '1.3rem', fontStyle: 'italic', marginTop: '0.5rem', textAlign: 'center' }}
                          value={selectedMushroom.subtitle || ''} 
                          onChange={e => setSelectedMushroom({...selectedMushroom, subtitle: e.target.value})} 
                        />
                      </>
                    ) : (
                      <>
                        <h2 className="modal-title" data-editable="modal-title" style={{ marginBottom: '0.5rem' }}>{selectedMushroom.name}</h2>
                        <div className="fade-line" style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)', margin: '1rem 0', width: '100%' }} data-editable="modal-divider"></div>
                        <p className="modal-scientific" data-editable="modal-subtitle" style={{ marginTop: '0.5rem' }}>{selectedMushroom.scientific_name}</p>
                      </>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {isEditing && (
                      <button
                        onClick={() => setIsKeywordsDrawerOpen(true)}
                        className="admin-edit-badge"
                        style={{
                          background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(0, 242, 254, 0.9))',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontFamily: 'inherit',
                          fontWeight: 'bold',
                        }}
                        title={currentLang === 'he' ? 'ערוך מילות מפתח' : 'Edit Keywords'}
                      >
                        <Key size={14} style={{ transform: 'rotate(90deg)' }} />
                        <span>{currentLang === 'he' ? 'מילות מפתח' : 'Keywords'}</span>
                      </button>
                    )}
                    <div className="admin-edit-badge" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                      {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                      <span>{isEditing ? (currentLang === 'he' ? 'שמור' : 'Save') : (currentLang === 'he' ? 'ערוך' : 'Edit')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-tabs" ref={tabsRef} data-editable="modal-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                  data-editable="tab-btn-info"
                >
                  {t('labels.about')}
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interactions')}
                  data-editable="tab-btn-interactions"
                >
                  {t('labels.interactions')}
                </button>
              </div>
            </div>
            
            <div 
              ref={modalBodyRef}
              className="modal-body" 
              style={{ 
                position: 'relative', 
                minHeight: '400px',
                paddingBottom: '1rem'
              }} 
              data-editable="modal-body"
            >
              {activeTab === 'info' ? (
                <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  {/* About Section */}
                  <div className="detail-section" data-editable="detail-section-about">
                    <span className="detail-label" data-editable="detail-label-about">{t('labels.about')}</span>
                    {isEditing ? (
                      <RichTextEditor 
                        value={editData?.about || ''} 
                        onChange={val => setEditData({...editData, about: val})}
                      />
                    ) : (
                      <div className="modal-description" data-editable="modal-description-about" dangerouslySetInnerHTML={{ __html: editData?.about || mData.about }}></div>
                    )}
                  </div>

                  {/* Benefits Section */}
                  <div className="detail-section" data-editable="detail-section-benefits">
                    <span className="detail-label" data-editable="detail-label-benefits">{t('labels.benefits')}</span>
                    {isEditing ? (
                      <div style={{ display: 'grid', gap: '0.8rem' }}>
                        {safeArray(editData?.benefits).map((b, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              className="admin-edit-input" 
                              value={b} 
                              onChange={e => {
                                const newList = [...editData.benefits];
                                newList[i] = e.target.value;
                                setEditData({...editData, benefits: newList});
                              }} 
                            />
                            <button className="admin-list-btn remove" onClick={() => {
                              const newList = editData.benefits.filter((_, idx) => idx !== i);
                              setEditData({...editData, benefits: newList});
                            }}><Trash2 size={16}/></button>
                          </div>
                        ))}
                        <button className="admin-list-btn add" onClick={() => setEditData({...editData, benefits: [...safeArray(editData?.benefits), '']})}>
                          <Plus size={16}/> {currentLang === 'he' ? 'הוסף יתרון' : 'Add Benefit'}
                        </button>
                      </div>
                    ) : (
                      <ul className="benefit-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                        {safeArray(editData?.benefits || mData.benefits).map((b, i) => (
                          <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            <CheckCircle size={20} color="#22c55e" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '1.1rem', color: 'var(--mush-subtext)' }}>
                              {i18n.exists(`terms.${b}`) ? t(`terms.${b}`) : b}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Conditions Section */}
                  <div className="detail-section">
                    <span className="detail-label">{t('labels.conditions')}</span>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {safeArray(editData?.conditions).map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.2rem 0.5rem' }}>
                             <input 
                              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '80px' }}
                              value={c} 
                              onChange={e => {
                                const newList = [...editData.conditions];
                                newList[i] = e.target.value;
                                setEditData({...editData, conditions: newList});
                              }} 
                            />
                            <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.2rem' }} onClick={() => {
                              const newList = editData.conditions.filter((_, idx) => idx !== i);
                              setEditData({...editData, conditions: newList});
                            }}>×</button>
                          </div>
                        ))}
                        <button className="admin-list-btn add small" onClick={() => setEditData({...editData, conditions: [...safeArray(editData?.conditions), '']})}>
                          <Plus size={14}/>
                        </button>
                      </div>
                    ) : (
                      <div className="tag-container">
                        {safeArray(editData?.conditions || mData.conditions).map((c, i) => (
                          <span key={i} className="condition-tag">
                            {i18n.exists(`terms.${c}`) ? t(`terms.${c}`) : c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>



                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Usage & Dosage */}
                    <div className="detail-section">
                      <span className="detail-label">{t('labels.how_to_use')}</span>
                      {isEditing ? (
                        <RichTextEditor 
                           value={editData?.usage || ''} 
                           onChange={val => setEditData({...editData, usage: val})}
                        />
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: editData?.usage || mData.usage }}></div>
                      )}
                      
                      <span className="detail-label">{t('labels.dosage')}</span>
                      {isEditing ? (
                        <RichTextEditor 
                           value={editData?.dosage || ''} 
                           onChange={val => setEditData({...editData, dosage: val})}
                        />
                      ) : (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: editData?.dosage || mData.dosage }}></div>
                      )}
                    </div>

                    <div className="detail-section">
                      <span className="detail-label" style={{ color: '#ffdd00' }}>{t('labels.doctor_consultation')}</span>
                      {isEditing ? (
                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                          {safeArray(editData?.doctor_consultation).map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input 
                                className="admin-edit-input" 
                                value={item} 
                                onChange={e => {
                                  const newList = [...safeArray(editData.doctor_consultation)];
                                  newList[i] = e.target.value;
                                  setEditData({...editData, doctor_consultation: newList});
                                }} 
                              />
                              <button className="admin-list-btn remove" onClick={() => {
                                const newList = editData.doctor_consultation.filter((_, idx) => idx !== i);
                                setEditData({...editData, doctor_consultation: newList});
                              }}><Trash2 size={16}/></button>
                            </div>
                          ))}
                          <button className="admin-list-btn add" onClick={() => setEditData({...editData, doctor_consultation: [...safeArray(editData?.doctor_consultation), '']})}>
                            <Plus size={16}/> {currentLang === 'he' ? 'הוסף התראה' : 'Add Warning'}
                          </button>
                        </div>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                          {safeArray(editData?.doctor_consultation || mData.doctor_consultation).map((item, i) => (
                              <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                                <AlertTriangle size={20} color="#ffdd00" style={{ flexShrink: 0, marginTop: '2px' }} />
                              </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <span className="detail-label" style={{ color: '#FF7676' }}>{t('labels.contraindications')}</span>
                    {isEditing ? (
                      <div style={{ display: 'grid', gap: '0.8rem' }}>
                        {safeArray(editData?.contraindications).map((ci, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              className="admin-edit-input" 
                              value={ci} 
                              onChange={e => {
                                const newList = [...editData.contraindications];
                                newList[i] = e.target.value;
                                setEditData({...editData, contraindications: newList});
                              }} 
                            />
                            <button className="admin-list-btn remove" onClick={() => {
                              const newList = editData.contraindications.filter((_, idx) => idx !== i);
                              setEditData({...editData, contraindications: newList});
                            }}><Trash2 size={16}/></button>
                          </div>
                        ))}
                        <button className="admin-list-btn add" onClick={() => setEditData({...editData, contraindications: [...safeArray(editData?.contraindications), '']})}>
                          <Plus size={16}/> {currentLang === 'he' ? 'הוסף התווית נגד' : 'Add Contraindication'}
                        </button>
                      </div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.8rem' }}>
                        {safeArray(editData?.contraindications || mData.contraindications).map((ci, i) => (
                          <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)' }}>{ci}</span>
                            <XCircle size={20} color="#FF7676" style={{ flexShrink: 0, marginTop: '2px' }} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Keywords Editor (Admin Only) */}
                  {isEditing && (
                    <div className="detail-section" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                      <span className="detail-label" style={{ color: '#00f2fe' }}>
                        {currentLang === 'he' ? 'מילות חיפוש ומפתח' : 'Search Keywords'}
                      </span>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                        {currentLang === 'he' ? 'מילים אלו ישמשו במנוע החיפוש במסך הבית אבל לא יוצגו למשתמשים באתר.' : 'These words will power the home screen search but will remain hidden from users.'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                        {safeArray(editData?.keywords).map((kw, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.2rem 0.5rem' }}>
                            <input 
                              className="admin-edit-input"
                              style={{ width: '120px', padding: '0.2rem', margin: 0, fontSize: '0.9rem', background: 'transparent', border: 'none' }}
                              value={kw} 
                              onChange={e => {
                                const newList = [...editData.keywords];
                                newList[i] = e.target.value;
                                setEditData({...editData, keywords: newList});
                              }} 
                            />
                            <button className="admin-list-btn remove small" style={{ marginLeft: '0.2rem' }} onClick={() => {
                              const newList = editData.keywords.filter((_, idx) => idx !== i);
                              setEditData({...editData, keywords: newList});
                            }}>
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        ))}
                        <button className="admin-list-btn add small" onClick={() => setEditData({...editData, keywords: [...safeArray(editData?.keywords), '']})}>
                          <Plus size={14}/>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>
                  
                  {/* Interaction Search Bar */}
                  <div className="interaction-search-bar" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%', 
                    marginBottom: '1rem',
                    background: 'rgba(22, 22, 22, 0.9)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    borderRadius: '16px',
                    border: '2px solid rgba(255,255,255,0.1)',
                    padding: '4px',
                    boxSizing: 'border-box'
                  }}>
                    <input 
                      type="text" 
                      placeholder={t('labels.interaction_search_placeholder')}
                      value={interactionQuery}
                      onChange={(e) => setInteractionQuery(e.target.value)}
                      className="interaction-search-input"
                      style={{ 
                        flex: 1,
                        padding: '1rem 1.2rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.1rem',
                        outline: 'none'
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inputEl = document.querySelector('.interaction-search-input');
                        if (inputEl) inputEl.focus();
                      }}
                      className="interaction-search-btn"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.8rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginLeft: '4px',
                        marginRight: '4px',
                        transition: 'background 0.2s'
                      }}
                    >
                      <Search color="white" size={20} />
                    </button>
                  </div>

                  {(() => {
                    const mapIdToSubstance = {
                      reishi: 'Reishi',
                      cordyceps: 'Cordyceps',
                      lions_mane: "Lion's Mane",
                      chaga: 'Chaga',
                      turkey_tail: 'Turkey Tail',
                      tremella: 'Tremella'
                    };
                    const engName = mapIdToSubstance[selectedMushroom.id] || selectedMushroom.id;
                    let dbInts = null;
                    if (uiContent && uiContent[`int_${selectedMushroom.id}`]) {
                      try {
                        dbInts = typeof uiContent[`int_${selectedMushroom.id}`] === 'string'
                          ? JSON.parse(uiContent[`int_${selectedMushroom.id}`])
                          : uiContent[`int_${selectedMushroom.id}`];
                      } catch(e) {}
                    }
                    const defaultInts = dbInts || originalInteractions[engName] || { do_not_combine: [], use_caution: [], potential_synergy: [], insufficient: [] };
                    const mushInts = editData && editData.interactions ? editData.interactions : defaultInts;

                    const tf = (obj) => {
                      if (!obj) return '';
                      if (typeof obj === 'string') return obj;
                      return obj[currentLang] || obj['en'] || obj['he'] || '';
                    };

                    const categoriesList = [
                      { key: 'do_not_combine', label: { he: "אין לשלב — סיכון גבוה", en: "Do NOT combine — High Risk", ru: "НЕ комбинировать — Высокий риск", es: "NO combinar — Riesgo Alto" } },
                      { key: 'use_caution', label: { he: "יש לנקוט זהירות — אינטראקציה בינונית", en: "Use Caution — Moderate Interaction", ru: "Соблюдать осторожность — Умеренное взаимодействие", es: "Usar con Precaución — Interacción Moderada" } },
                      { key: 'potential_synergy', label: { he: "סינרגיה פוטנציאלית — שילוב מועיל", en: "Potential Synergy — Helpful Combination", ru: "Потенциальная синергия — Полезное сочетание", es: "Sinergia Potencial — Combinación Útil" } },
                      { key: 'insufficient', label: { he: "מחקר לא מספיק", en: "Unknown / Insufficient Research", ru: "Недостаточно исследований", es: "Desconocido / Investigación Insuficiente" } }
                    ];

                    if (isEditing) {
                        return (
                          <div className="interactions-editor" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '850px', margin: '0 auto', direction: currentLang === 'he' ? 'rtl' : 'ltr' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                              {currentLang === 'he' ? 'עריכת אינטראקציות תרופתיות' : 'Edit Drug Interactions'}
                            </h3>
                            {categoriesList.map(cat => {
                              const items = mushInts[cat.key] || [];
                              const catLabel = cat.label[currentLang] || cat.label['en'];
                              return (
                                <div key={cat.key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexDirection: currentLang === 'he' ? 'row-reverse' : 'row' }}>
                                    <h4 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>{catLabel}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>({items.length} {currentLang === 'he' ? 'פריטים' : 'items'})</span>
                                  </div>
                                  
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {items.map((item, idx) => {
                                      const nameObj = item.name || {};
                                      const whyObj = item.why || {};
                                      const mechObj = item.mechanism || {};
                                      
                                      const currentName = nameObj[currentLang] || '';
                                      const currentWhy = whyObj[currentLang] || '';
                                      const currentMech = mechObj[currentLang] || '';
                                      const evidence = item.evidence || 'clinical';

                                      const updateItem = (field, value) => {
                                        const updatedInts = { ...mushInts };
                                        const categoryItems = [...(updatedInts[cat.key] || [])];
                                        const updatedItem = { ...categoryItems[idx] };
                                        
                                        if (field === 'evidence') {
                                          updatedItem.evidence = value;
                                        } else {
                                          const transObj = { ...(updatedItem[field] || {}) };
                                          transObj[currentLang] = value;
                                          updatedItem[field] = transObj;
                                        }
                                        
                                        categoryItems[idx] = updatedItem;
                                        updatedInts[cat.key] = categoryItems;
                                        setEditData({ ...editData, interactions: updatedInts });
                                      };

                                      const deleteItem = () => {
                                        const updatedInts = { ...mushInts };
                                        const categoryItems = (updatedInts[cat.key] || []).filter((_, i) => i !== idx);
                                        updatedInts[cat.key] = categoryItems;
                                        setEditData({ ...editData, interactions: updatedInts });
                                      };

                                      return (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexDirection: currentLang === 'he' ? 'row-reverse' : 'row' }}>
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                              #{idx + 1} {currentName ? ` - ${currentName}` : ''}
                                            </span>
                                            <button 
                                              onClick={deleteItem}
                                              className="admin-list-btn remove"
                                              style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                              title={currentLang === 'he' ? 'מחק פריט' : 'Delete Item'}
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>

                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'stretch' }}>
                                              <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                                                {currentLang === 'he' ? 'שם החומר / תרופה' : 'Substance / Drug Name'}
                                              </label>
                                              <input 
                                                type="text" 
                                                className="admin-edit-input"
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px' }}
                                                value={currentName}
                                                onChange={e => updateItem('name', e.target.value)}
                                                placeholder={currentLang === 'he' ? 'למשל: אספירין' : 'e.g. Aspirin'}
                                              />
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'stretch' }}>
                                              <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                                                {currentLang === 'he' ? 'רמת ראיות קליניות' : 'Clinical Evidence Level'}
                                              </label>
                                              <select 
                                                className="admin-edit-input"
                                                style={{ width: '100%', background: '#1c1c1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer' }}
                                                value={evidence}
                                                onChange={e => updateItem('evidence', e.target.value)}
                                              >
                                                <option value="clinical">{currentLang === 'he' ? 'ראיות קליניות (Clinical)' : 'Clinical evidence'}</option>
                                                <option value="limited">{currentLang === 'he' ? 'מחקר מוגבל (Limited)' : 'Limited research'}</option>
                                                <option value="theoretical">{currentLang === 'he' ? 'תיאורטי (Theoretical)' : 'Theoretical'}</option>
                                              </select>
                                            </div>
                                          </div>

                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'stretch' }}>
                                            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                                              {currentLang === 'he' ? 'הסבר / למה לא לשלב' : 'Explanation / Why'}
                                            </label>
                                            <textarea 
                                              className="admin-edit-input"
                                              style={{ width: '100%', minHeight: '60px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px', resize: 'vertical' }}
                                              value={currentWhy}
                                              onChange={e => updateItem('why', e.target.value)}
                                              placeholder={currentLang === 'he' ? 'הסבר קצר על האינטראקציה...' : 'Brief explanation of the interaction...'}
                                            />
                                          </div>


                                        </div>
                                      );
                                    })}

                                    <button 
                                      onClick={() => {
                                        const updatedInts = { ...mushInts };
                                        const categoryItems = [...(updatedInts[cat.key] || [])];
                                        categoryItems.push({
                                          name: { he: "", en: "", ru: "", es: "" },
                                          why: { he: "", en: "", ru: "", es: "" },
                                          evidence: "clinical"
                                        });
                                        updatedInts[cat.key] = categoryItems;
                                        setEditData({ ...editData, interactions: updatedInts });
                                      }}
                                      className="admin-list-btn add"
                                      style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(22, 163, 74, 0.2)', color: 'var(--accent-primary)', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                      <Plus size={16} /> 
                                      {currentLang === 'he' ? 'הוסף אינטראקציה' : 'Add Interaction'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                    }

                    const filterItems = (items) => {
                      if (!interactionQuery.trim()) return items || [];
                      const qWords = interactionQuery.toLowerCase().split(/\s+/).filter(Boolean);
                      if (qWords.length === 0) return items || [];
                      return (items || []).filter(item => {
                        return qWords.every(qWord => {
                          const matchesObj = (obj) => {
                            if (!obj) return false;
                            if (typeof obj === 'string') return obj.toLowerCase().includes(qWord);
                            return Object.values(obj).some(val => 
                              String(val).toLowerCase().includes(qWord)
                            );
                          };
                          return matchesObj(item.name) || matchesObj(item.why) || matchesObj(item.mechanism);
                        });
                      });
                    };

                    const categories = {
                      do_not_combine: filterItems(mushInts.do_not_combine),
                      use_caution: filterItems(mushInts.use_caution),
                      potential_synergy: filterItems(mushInts.potential_synergy),
                      insufficient: filterItems(mushInts.insufficient)
                    };

                    const interactionSuggestions = (() => {
                      if (!interactionQuery.trim()) return [];
                      const qWords = interactionQuery.toLowerCase().split(/\s+/).filter(Boolean);
                      if (qWords.length === 0) return [];
                      const uniqueNames = new Set();
                      
                      const allItems = [
                        ...(mushInts.do_not_combine || []),
                        ...(mushInts.use_caution || []),
                        ...(mushInts.potential_synergy || []),
                        ...(mushInts.insufficient || [])
                      ];

                      allItems.forEach(item => {
                        if (!item.name) return;
                        const localizedName = tf(item.name);
                        const matchesQuery = qWords.every(qWord => {
                          const matchesObj = (obj) => {
                            if (!obj) return false;
                            if (typeof obj === 'string') return obj.toLowerCase().includes(qWord);
                            return Object.values(obj).some(val => String(val).toLowerCase().includes(qWord));
                          };
                          return matchesObj(item.name) || matchesObj(item.why) || matchesObj(item.mechanism);
                        });
                        if (matchesQuery && localizedName) {
                          uniqueNames.add(localizedName);
                        }
                      });

                      return [...uniqueNames].slice(0, 3);
                    })();

                    const getLabels = (key) => {
                      const labels = {
                        do_not_combine: { he: "אין לשלב — סיכון גבוה", en: "Do NOT combine — High Risk", ru: "НЕ комбинировать — Высокий риск", es: "NO combinar — Riesgo Alto" },
                        use_caution: { he: "יש לנקוט זהירות — אינטראקציה בינונית", en: "Use Caution — Moderate Interaction", ru: "Соблюдать осторожность — Умеренное взаимодействие", es: "Usar con Precaución — Interacción Moderada" },
                        potential_synergy: { he: "סינרגיה פוטנציאלית — שילוב מועיל", en: "Potential Synergy — Helpful Combination", ru: "Потенциальная синергия — Полезное сочетание", es: "Sinergia Potencial — Combinación Útil" },
                        insufficient: { he: "מחקר לא מספיק", en: "Unknown / Insufficient Research", ru: "Недостаточно исследований", es: "Desconocido / Investigación Insuficiente" }
                      };
                      return labels[key][currentLang] || labels[key]['en'];
                    };

                    const evidenceLabels = {
                      clinical: { he: 'ראיות קליניות', en: 'Clinical evidence', ru: 'Клинические данные', es: 'Evidencia clínica' },
                      limited: { he: 'מחקר מוגבל', en: 'Limited research', ru: 'Ограниченные исследования', es: 'Investigación limitada' },
                      theoretical: { he: 'תיאורטי', en: 'Theoretical', ru: 'Теоретически', es: 'Teórico' }
                    };

                    const EvidenceBadge = ({ type }) => {
                      if (!type) return null;
                      const lbl = evidenceLabels[type]?.[currentLang] || type;
                      let bg = 'rgba(255,255,255,0.1)', border = 'rgba(255,255,255,0.3)', text = 'rgba(255,255,255,0.6)';
                      if (type === 'clinical') { bg = 'rgba(255,255,255,0.2)'; text = 'white'; }
                      else if (type === 'limited') { text = 'rgba(255,255,255,0.8)'; }
                      return (
                        <span style={{ background: bg, border: `1px solid ${border}`, color: text, padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {lbl}
                        </span>
                      );
                    };

                    const renderCategory = (key, items, icon, colors) => {
                      if (items.length === 0 && interactionQuery.trim() === '') return null;
                      if (items.length === 0) return null;

                      const isExpanded = expandedCats[key] || interactionQuery.trim().length > 0;

                      return (
                        <div className="interaction-category" style={{ background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: '16px', marginBottom: '1rem', overflow: 'hidden', textAlign: currentLang === 'he' ? 'right' : 'left' }} dir={currentLang==='he'?'rtl':'ltr'}>
                          <button 
                            onClick={() => setExpandedCats(prev => ({ [key]: !prev[key] }))}
                            style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>
                              <span style={{ color: colors.iconCol }}>{icon}</span>
                              {getLabels(key)}
                            </div>
                            <ChevronDown size={20} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'rgba(255,255,255,0.6)' }} />
                          </button>

                          {isExpanded && (
                            <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              {items.map((item, idx) => (
                                <div key={idx} className="interaction-card" style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: '12px', overflow: 'hidden' }}>
                                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: colors.iconCol, flexShrink: 0 }}>{icon}</span>
                                        <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'white' }}>{tf(item.name)}</span>
                                      </div>
                                      <EvidenceBadge type={item.evidence} />
                                    </div>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                      {tf(item.why)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    };

                    const totalItems = Object.values(categories).flat().length;

                    return (
                      <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
                        {interactionQuery.trim().length > 0 && interactionSuggestions.length > 0 && (
                          <div className="interactions-completions-container" style={{ marginBottom: '1.5rem', textAlign: currentLang === 'he' ? 'right' : 'left' }}>
                            <div className="suggestions-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: currentLang === 'he' ? 'flex-start' : 'flex-start', direction: currentLang === 'he' ? 'rtl' : 'ltr' }}>
                              {interactionSuggestions.map((s, idx) => (
                                <button 
                                  key={idx} 
                                  className="completion-tag"
                                  onClick={() => setInteractionQuery(s)}
                                  type="button"
                                  style={{ width: 'fit-content' }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {renderCategory('do_not_combine', categories.do_not_combine, <XCircle size={22} />, { bg: 'rgb(80,15,15)', border: '#ef4444', iconCol: '#fca5a5', cardBg: 'rgb(45,5,5)', cardBorder: 'rgba(252,165,165,0.3)' })}
                        {renderCategory('use_caution', categories.use_caution, <AlertTriangle size={22} />, { bg: 'rgb(69,53,0)', border: '#eab308', iconCol: '#fde047', cardBg: 'rgb(38,18,3)', cardBorder: 'rgba(253,224,71,0.3)' })}
                        {renderCategory('potential_synergy', categories.potential_synergy, <CheckCircle size={22} />, { bg: 'rgb(4,46,22)', border: '#22c55e', iconCol: '#86efac', cardBg: 'rgb(2,26,12)', cardBorder: 'rgba(134,239,172,0.3)' })}
                        {renderCategory('insufficient', categories.insufficient, <HelpCircle size={22} />, { bg: 'rgb(30,30,30)', border: '#6b7280', iconCol: '#d1d5db', cardBg: 'rgb(18,18,18)', cardBorder: 'rgba(255,255,255,0.1)' })}
                        
                        {totalItems === 0 && (
                          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--mush-subtext)', fontSize: '1.1rem' }}>
                            {t('no_interactions_matching', { query: interactionQuery })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              
            </div>
            
              {/* Modal Disclaimer Footer */}
              <div style={{ padding: '0 3rem 1.5rem 3rem' }}>
                <div ref={footerLineRef} style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', color: '#ffffff', opacity: 0.6, maxWidth: '800px', margin: '0 auto', lineHeight: '1.5', fontWeight: 'bold' }}>
                    {t('labels.footer_disclaimer') || 'Educational information only about medicinal mushrooms, and does not replace or claim to replace medical advice.'}
                  </p>
                </div>
              </div>
          </div>
        </div>
      )}
      {/* Admin Auth Modal */}
      <AdminAuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(token) => {
          setIsAdmin(true);
          setIsLoginModalOpen(false);
          localStorage.setItem('adminToken', token);
          alert(currentLang === 'he' ? 'ברוך הבא מנהל!' : 'Welcome Admin!');
        }} 
        currentLang={currentLang} 
      />
      </main>

      {/* Footer */}
      <footer className="footer shadow-xl" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ffffff', opacity: 0.6, maxWidth: '800px', textAlign: 'center', lineHeight: '1.5', fontWeight: 'bold' }}>
          {t('labels.footer_disclaimer') || 'Educational information only about medicinal mushrooms, and does not replace or claim to replace medical advice.'}
        </p>
      </footer>

      {isAdmin && (
        <button
          onClick={() => setIsKeywordsDrawerOpen(true)}
          style={{
            position: 'fixed',
            right: currentLang === 'he' ? 'auto' : '0',
            left: currentLang === 'he' ? '0' : 'auto',
            top: '55%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.9), rgba(0, 242, 254, 0.9))',
            border: '1px solid rgba(255,255,255,0.2)',
            borderTopLeftRadius: currentLang === 'he' ? '0' : '12px',
            borderBottomLeftRadius: currentLang === 'he' ? '0' : '12px',
            borderTopRightRadius: currentLang === 'he' ? '12px' : '0',
            borderBottomRightRadius: currentLang === 'he' ? '12px' : '0',
            padding: '1.2rem 0.6rem',
            color: 'white',
            cursor: 'pointer',
            zIndex: 99999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            letterSpacing: '1px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%)'; }}
          title={currentLang === 'he' ? 'ערוך מילות מפתח' : 'Edit Keywords'}
        >
          <Key size={16} style={{ transform: 'rotate(90deg)', marginBottom: '0.2rem' }} />
          <span>{currentLang === 'he' ? 'מילות מפתח' : 'Keywords'}</span>
        </button>
      )}

      <SearchKeywordsDrawer
        isOpen={isKeywordsDrawerOpen}
        onClose={() => setIsKeywordsDrawerOpen(false)}
        mushrooms={allMushrooms}
        selectedMushroom={selectedMushroom}
        mushroomsData={mushroomsData}
        setMushroomsData={setMushroomsData}
        currentLang={currentLang}
        isAdmin={isAdmin}
        editData={editData}
        setEditData={setEditData}
      />

      {/* Floating Accessibility Widget */}
      <AccessibilityWidget />
    </div>
  );
}

export default App;

