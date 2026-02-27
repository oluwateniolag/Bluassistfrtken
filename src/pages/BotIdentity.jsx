import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import '../components/Sidebar.css';
import './BotIdentity.css';

const BotIdentity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('webchat');
  const [expandedNav, setExpandedNav] = useState({ webchat: true });

  const [form, setForm] = useState({
    voiceTone: '',
    voiceEmojis: false,
    voiceEnergy: '',
    platformName: '',
    voiceWordsAvoid: '',
    brandPersonality: '',
    uxClosingSignoff: '',
    uxOpeningGreeting: '',
    voiceSentenceStyle: '',
    platformDescription: '',
    whatsappBotPhoneNumberId: '',
    whatsappCountryCode: '',
  });

  const COUNTRY_CODES = [
    { code: '+1', label: '+1 (US/Canada)' },
    { code: '+7', label: '+7 (Russia)' },
    { code: '+20', label: '+20 (Egypt)' },
    { code: '+27', label: '+27 (South Africa)' },
    { code: '+30', label: '+30 (Greece)' },
    { code: '+31', label: '+31 (Netherlands)' },
    { code: '+32', label: '+32 (Belgium)' },
    { code: '+33', label: '+33 (France)' },
    { code: '+34', label: '+34 (Spain)' },
    { code: '+36', label: '+36 (Hungary)' },
    { code: '+39', label: '+39 (Italy)' },
    { code: '+40', label: '+40 (Romania)' },
    { code: '+41', label: '+41 (Switzerland)' },
    { code: '+43', label: '+43 (Austria)' },
    { code: '+44', label: '+44 (UK)' },
    { code: '+45', label: '+45 (Denmark)' },
    { code: '+46', label: '+46 (Sweden)' },
    { code: '+47', label: '+47 (Norway)' },
    { code: '+48', label: '+48 (Poland)' },
    { code: '+49', label: '+49 (Germany)' },
    { code: '+51', label: '+51 (Peru)' },
    { code: '+52', label: '+52 (Mexico)' },
    { code: '+54', label: '+54 (Argentina)' },
    { code: '+55', label: '+55 (Brazil)' },
    { code: '+56', label: '+56 (Chile)' },
    { code: '+57', label: '+57 (Colombia)' },
    { code: '+58', label: '+58 (Venezuela)' },
    { code: '+60', label: '+60 (Malaysia)' },
    { code: '+61', label: '+61 (Australia)' },
    { code: '+62', label: '+62 (Indonesia)' },
    { code: '+63', label: '+63 (Philippines)' },
    { code: '+64', label: '+64 (New Zealand)' },
    { code: '+65', label: '+65 (Singapore)' },
    { code: '+66', label: '+66 (Thailand)' },
    { code: '+81', label: '+81 (Japan)' },
    { code: '+82', label: '+82 (South Korea)' },
    { code: '+84', label: '+84 (Vietnam)' },
    { code: '+86', label: '+86 (China)' },
    { code: '+90', label: '+90 (Turkey)' },
    { code: '+91', label: '+91 (India)' },
    { code: '+92', label: '+92 (Pakistan)' },
    { code: '+93', label: '+93 (Afghanistan)' },
    { code: '+94', label: '+94 (Sri Lanka)' },
    { code: '+95', label: '+95 (Myanmar)' },
    { code: '+98', label: '+98 (Iran)' },
    { code: '+212', label: '+212 (Morocco)' },
    { code: '+213', label: '+213 (Algeria)' },
    { code: '+216', label: '+216 (Tunisia)' },
    { code: '+218', label: '+218 (Libya)' },
    { code: '+220', label: '+220 (Gambia)' },
    { code: '+221', label: '+221 (Senegal)' },
    { code: '+222', label: '+222 (Mauritania)' },
    { code: '+223', label: '+223 (Mali)' },
    { code: '+224', label: '+224 (Guinea)' },
    { code: '+225', label: '+225 (Ivory Coast)' },
    { code: '+226', label: '+226 (Burkina Faso)' },
    { code: '+227', label: '+227 (Niger)' },
    { code: '+228', label: '+228 (Togo)' },
    { code: '+229', label: '+229 (Benin)' },
    { code: '+230', label: '+230 (Mauritius)' },
    { code: '+231', label: '+231 (Liberia)' },
    { code: '+232', label: '+232 (Sierra Leone)' },
    { code: '+233', label: '+233 (Ghana)' },
    { code: '+234', label: '+234 (Nigeria)' },
    { code: '+235', label: '+235 (Chad)' },
    { code: '+236', label: '+236 (Central African Republic)' },
    { code: '+237', label: '+237 (Cameroon)' },
    { code: '+238', label: '+238 (Cape Verde)' },
    { code: '+239', label: '+239 (São Tomé and Príncipe)' },
    { code: '+240', label: '+240 (Equatorial Guinea)' },
    { code: '+241', label: '+241 (Gabon)' },
    { code: '+242', label: '+242 (Republic of the Congo)' },
    { code: '+243', label: '+243 (DR Congo)' },
    { code: '+244', label: '+244 (Angola)' },
    { code: '+245', label: '+245 (Guinea-Bissau)' },
    { code: '+246', label: '+246 (British Indian Ocean Territory)' },
    { code: '+247', label: '+247 (Ascension Island)' },
    { code: '+248', label: '+248 (Seychelles)' },
    { code: '+249', label: '+249 (Sudan)' },
    { code: '+250', label: '+250 (Rwanda)' },
    { code: '+251', label: '+251 (Ethiopia)' },
    { code: '+252', label: '+252 (Somalia)' },
    { code: '+253', label: '+253 (Djibouti)' },
    { code: '+254', label: '+254 (Kenya)' },
    { code: '+255', label: '+255 (Tanzania)' },
    { code: '+256', label: '+256 (Uganda)' },
    { code: '+257', label: '+257 (Burundi)' },
    { code: '+258', label: '+258 (Mozambique)' },
    { code: '+260', label: '+260 (Zambia)' },
    { code: '+261', label: '+261 (Madagascar)' },
    { code: '+262', label: '+262 (Réunion)' },
    { code: '+263', label: '+263 (Zimbabwe)' },
    { code: '+264', label: '+264 (Namibia)' },
    { code: '+265', label: '+265 (Malawi)' },
    { code: '+266', label: '+266 (Lesotho)' },
    { code: '+267', label: '+267 (Botswana)' },
    { code: '+268', label: '+268 (Eswatini)' },
    { code: '+269', label: '+269 (Comoros)' },
    { code: '+290', label: '+290 (Saint Helena)' },
    { code: '+291', label: '+291 (Eritrea)' },
    { code: '+297', label: '+297 (Aruba)' },
    { code: '+298', label: '+298 (Faroe Islands)' },
    { code: '+299', label: '+299 (Greenland)' },
    { code: '+350', label: '+350 (Gibraltar)' },
    { code: '+351', label: '+351 (Portugal)' },
    { code: '+352', label: '+352 (Luxembourg)' },
    { code: '+353', label: '+353 (Ireland)' },
    { code: '+354', label: '+354 (Iceland)' },
    { code: '+355', label: '+355 (Albania)' },
    { code: '+356', label: '+356 (Malta)' },
    { code: '+357', label: '+357 (Cyprus)' },
    { code: '+358', label: '+358 (Finland)' },
    { code: '+359', label: '+359 (Bulgaria)' },
    { code: '+370', label: '+370 (Lithuania)' },
    { code: '+371', label: '+371 (Latvia)' },
    { code: '+372', label: '+372 (Estonia)' },
    { code: '+373', label: '+373 (Moldova)' },
    { code: '+374', label: '+374 (Armenia)' },
    { code: '+375', label: '+375 (Belarus)' },
    { code: '+376', label: '+376 (Andorra)' },
    { code: '+377', label: '+377 (Monaco)' },
    { code: '+380', label: '+380 (Ukraine)' },
    { code: '+381', label: '+381 (Serbia)' },
    { code: '+382', label: '+382 (Montenegro)' },
    { code: '+383', label: '+383 (Kosovo)' },
    { code: '+385', label: '+385 (Croatia)' },
    { code: '+386', label: '+386 (Slovenia)' },
    { code: '+387', label: '+387 (Bosnia and Herzegovina)' },
    { code: '+389', label: '+389 (North Macedonia)' },
    { code: '+420', label: '+420 (Czech Republic)' },
    { code: '+421', label: '+421 (Slovakia)' },
    { code: '+423', label: '+423 (Liechtenstein)' },
    { code: '+500', label: '+500 (Falkland Islands)' },
    { code: '+501', label: '+501 (Belize)' },
    { code: '+502', label: '+502 (Guatemala)' },
    { code: '+503', label: '+503 (El Salvador)' },
    { code: '+504', label: '+504 (Honduras)' },
    { code: '+505', label: '+505 (Nicaragua)' },
    { code: '+506', label: '+506 (Costa Rica)' },
    { code: '+507', label: '+507 (Panama)' },
    { code: '+508', label: '+508 (Saint Pierre and Miquelon)' },
    { code: '+509', label: '+509 (Haiti)' },
    { code: '+590', label: '+590 (Guadeloupe)' },
    { code: '+591', label: '+591 (Bolivia)' },
    { code: '+592', label: '+592 (Guyana)' },
    { code: '+593', label: '+593 (Ecuador)' },
    { code: '+595', label: '+595 (Paraguay)' },
    { code: '+597', label: '+597 (Suriname)' },
    { code: '+598', label: '+598 (Uruguay)' },
    { code: '+599', label: '+599 (Netherlands Antilles)' },
    { code: '+670', label: '+670 (East Timor)' },
    { code: '+672', label: '+672 (Norfolk Island)' },
    { code: '+673', label: '+673 (Brunei)' },
    { code: '+674', label: '+674 (Nauru)' },
    { code: '+675', label: '+675 (Papua New Guinea)' },
    { code: '+676', label: '+676 (Tonga)' },
    { code: '+677', label: '+677 (Solomon Islands)' },
    { code: '+678', label: '+678 (Vanuatu)' },
    { code: '+679', label: '+679 (Fiji)' },
    { code: '+680', label: '+680 (Palau)' },
    { code: '+681', label: '+681 (Wallis and Futuna)' },
    { code: '+682', label: '+682 (Cook Islands)' },
    { code: '+683', label: '+683 (Niue)' },
    { code: '+685', label: '+685 (Samoa)' },
    { code: '+686', label: '+686 (Kiribati)' },
    { code: '+687', label: '+687 (New Caledonia)' },
    { code: '+688', label: '+688 (Tuvalu)' },
    { code: '+689', label: '+689 (French Polynesia)' },
    { code: '+690', label: '+690 (Tokelau)' },
    { code: '+691', label: '+691 (Micronesia)' },
    { code: '+692', label: '+692 (Marshall Islands)' },
    { code: '+850', label: '+850 (North Korea)' },
    { code: '+852', label: '+852 (Hong Kong)' },
    { code: '+853', label: '+853 (Macau)' },
    { code: '+855', label: '+855 (Cambodia)' },
    { code: '+856', label: '+856 (Laos)' },
    { code: '+880', label: '+880 (Bangladesh)' },
    { code: '+886', label: '+886 (Taiwan)' },
    { code: '+960', label: '+960 (Maldives)' },
    { code: '+961', label: '+961 (Lebanon)' },
    { code: '+962', label: '+962 (Jordan)' },
    { code: '+963', label: '+963 (Syria)' },
    { code: '+964', label: '+964 (Iraq)' },
    { code: '+965', label: '+965 (Kuwait)' },
    { code: '+966', label: '+966 (Saudi Arabia)' },
    { code: '+967', label: '+967 (Yemen)' },
    { code: '+968', label: '+968 (Oman)' },
    { code: '+970', label: '+970 (Palestine)' },
    { code: '+971', label: '+971 (UAE)' },
    { code: '+972', label: '+972 (Israel)' },
    { code: '+973', label: '+973 (Bahrain)' },
    { code: '+974', label: '+974 (Qatar)' },
    { code: '+975', label: '+975 (Bhutan)' },
    { code: '+976', label: '+976 (Mongolia)' },
    { code: '+977', label: '+977 (Nepal)' },
    { code: '+992', label: '+992 (Tajikistan)' },
    { code: '+993', label: '+993 (Turkmenistan)' },
    { code: '+994', label: '+994 (Azerbaijan)' },
    { code: '+995', label: '+995 (Georgia)' },
    { code: '+996', label: '+996 (Kyrgyzstan)' },
    { code: '+998', label: '+998 (Uzbekistan)' },
  ];

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    fetchTenant();
  }, [user, navigate]);

  const fetchTenant = async () => {
    try {
      const response = await apiService.getTenant();
      if (response.success && response.data?.tenant) {
        const t = response.data.tenant;
        setTenant(t);
        setForm({
          voiceTone: t.voiceTone || '',
          voiceEmojis: t.voiceEmojis ?? false,
          voiceEnergy: t.voiceEnergy || '',
          platformName: t.platformName || '',
          voiceWordsAvoid: t.voiceWordsAvoid || '',
          brandPersonality: t.brandPersonality || '',
          uxClosingSignoff: t.uxClosingSignoff || '',
          uxOpeningGreeting: t.uxOpeningGreeting || '',
          voiceSentenceStyle: t.voiceSentenceStyle || '',
          platformDescription: t.platformDescription || '',
          whatsappBotPhoneNumberId: t.whatsappBotPhoneNumberId || '',
          whatsappCountryCode: t.whatsappCountryCode || '',
        });
      }
    } catch (err) {
      setError('Failed to load bot identity settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const response = await apiService.updateBotIdentity(form);
      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to save.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save bot identity.');
    } finally {
      setSaving(false);
    }
  };

  // Searchable country code dropdown state
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountry = COUNTRY_CODES.find(c => c.code === form.whatsappCountryCode);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (code) => {
    setForm(prev => ({ ...prev, whatsappCountryCode: code }));
    setCountryDropdownOpen(false);
    setCountrySearch('');
    setSaved(false);
  };

  const handlePhoneNumberChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, '');
    setForm(prev => ({ ...prev, whatsappBotPhoneNumberId: numeric }));
    setSaved(false);
  };

  const toggleNav = (navItem) => {
    setExpandedNav(prev => ({ ...prev, [navItem]: !prev[navItem] }));
  };

  const handleNavClick = (navItem) => {
    if (navItem === 'overview') {
      navigate('/dashboard');
    } else if (navItem === 'knowledge') {
      navigate('/knowledge');
    } else if (navItem === 'api-docs') {
      navigate('/api-docs');
    } else {
      setActiveNav(navItem);
    }
  };

  if (!user) return null;

  return (
    <div className="bot-identity-layout">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleNavClick}
        expandedNav={expandedNav}
        toggleNav={toggleNav}
        tenant={tenant}
      />
      <main className="bot-identity-main">
        <div className="bot-identity-container">
          <div className="bot-identity-header">
            <h1 className="bot-identity-title">Bot Identity</h1>
            <p className="bot-identity-subtitle">
              Define your bot's voice, personality, and platform configuration.
            </p>
          </div>

          {loading ? (
            <div className="bot-identity-loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bot-identity-form">

              {error && (
                <div className="bot-identity-error">{error}</div>
              )}

              {/* Platform Section */}
              <section className="bi-section">
                <h2 className="bi-section-title">Platform</h2>
                <div className="bi-grid">
                  <div className="bi-field">
                    <label htmlFor="platformName">Platform Name</label>
                    <input
                      id="platformName"
                      name="platformName"
                      type="text"
                      value={form.platformName}
                      onChange={handleChange}
                      placeholder="e.g. BluAssist Chat"
                    />
                  </div>
                  <div className="bi-field">
                    <label>WhatsApp Bot Phone Number</label>
                    <div className="bi-phone-row">
                      {/* Searchable country code dropdown */}
                      <div className="bi-country-dropdown" ref={countryDropdownRef}>
                        <button
                          type="button"
                          className="bi-country-trigger"
                          onClick={() => {
                            setCountryDropdownOpen(prev => !prev);
                            setCountrySearch('');
                          }}
                        >
                          <span>{selectedCountry ? selectedCountry.code : 'Code'}</span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {countryDropdownOpen && (
                          <div className="bi-country-menu">
                            <div className="bi-country-search-wrap">
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              <input
                                type="text"
                                placeholder="Search country..."
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                autoFocus
                                className="bi-country-search"
                              />
                            </div>
                            <ul className="bi-country-list">
                              {filteredCountries.length > 0 ? filteredCountries.map(c => (
                                <li
                                  key={c.code}
                                  className={`bi-country-option ${form.whatsappCountryCode === c.code ? 'selected' : ''}`}
                                  onClick={() => handleCountrySelect(c.code)}
                                >
                                  {c.label}
                                </li>
                              )) : (
                                <li className="bi-country-empty">No results</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      {/* Numbers-only phone input */}
                      <input
                        id="whatsappBotPhoneNumberId"
                        name="whatsappBotPhoneNumberId"
                        type="tel"
                        inputMode="numeric"
                        value={form.whatsappBotPhoneNumberId}
                        onChange={handlePhoneNumberChange}
                        placeholder="Phone number ID"
                        className="bi-phone-input"
                      />
                    </div>
                  </div>
                  <div className="bi-field bi-field--full">
                    <label htmlFor="platformDescription">Platform Description</label>
                    <textarea
                      id="platformDescription"
                      name="platformDescription"
                      rows={3}
                      value={form.platformDescription}
                      onChange={handleChange}
                      placeholder="Describe what this platform does and who it serves."
                    />
                  </div>
                </div>
              </section>

              {/* Voice & Tone Section */}
              <section className="bi-section">
                <h2 className="bi-section-title">Voice &amp; Tone</h2>
                <div className="bi-grid">
                  <div className="bi-field">
                    <label htmlFor="voiceTone">Voice Tone</label>
                    <select id="voiceTone" name="voiceTone" value={form.voiceTone} onChange={handleChange}>
                      <option value="">Select a tone</option>
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="empathetic">Empathetic</option>
                      <option value="authoritative">Authoritative</option>
                    </select>
                  </div>
                  <div className="bi-field">
                    <label htmlFor="voiceEnergy">Voice Energy</label>
                    <select id="voiceEnergy" name="voiceEnergy" value={form.voiceEnergy} onChange={handleChange}>
                      <option value="">Select energy level</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="bi-field">
                    <label htmlFor="voiceSentenceStyle">Sentence Style</label>
                    <select id="voiceSentenceStyle" name="voiceSentenceStyle" value={form.voiceSentenceStyle} onChange={handleChange}>
                      <option value="">Select style</option>
                      <option value="short">Short &amp; punchy</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long &amp; detailed</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div className="bi-field bi-field--checkbox">
                    <label className="bi-checkbox-label">
                      <input
                        id="voiceEmojis"
                        name="voiceEmojis"
                        type="checkbox"
                        checked={form.voiceEmojis}
                        onChange={handleChange}
                      />
                      <span>Use emojis in responses</span>
                    </label>
                  </div>
                  <div className="bi-field bi-field--full">
                    <label htmlFor="voiceWordsAvoid">Words to Avoid</label>
                    <textarea
                      id="voiceWordsAvoid"
                      name="voiceWordsAvoid"
                      rows={2}
                      value={form.voiceWordsAvoid}
                      onChange={handleChange}
                      placeholder="e.g. sorry, unfortunately, can't — separate with commas"
                    />
                  </div>
                </div>
              </section>

              {/* Brand & UX Section */}
              <section className="bi-section">
                <h2 className="bi-section-title">Brand &amp; UX</h2>
                <div className="bi-grid">
                  <div className="bi-field">
                    <label htmlFor="uxOpeningGreeting">Opening Greeting</label>
                    <input
                      id="uxOpeningGreeting"
                      name="uxOpeningGreeting"
                      type="text"
                      value={form.uxOpeningGreeting}
                      onChange={handleChange}
                      placeholder="e.g. Hello! How can I help you today?"
                    />
                  </div>
                  <div className="bi-field">
                    <label htmlFor="uxClosingSignoff">Closing Sign-off</label>
                    <input
                      id="uxClosingSignoff"
                      name="uxClosingSignoff"
                      type="text"
                      value={form.uxClosingSignoff}
                      onChange={handleChange}
                      placeholder="e.g. Thanks for chatting! Have a great day."
                    />
                  </div>
                  <div className="bi-field bi-field--full">
                    <label htmlFor="brandPersonality">Brand Personality</label>
                    <textarea
                      id="brandPersonality"
                      name="brandPersonality"
                      rows={3}
                      value={form.brandPersonality}
                      onChange={handleChange}
                      placeholder="Describe your brand's personality. e.g. Helpful, trustworthy, and approachable — like a knowledgeable friend."
                    />
                  </div>
                </div>
              </section>

              <div className="bi-actions">
                {saved && <span className="bi-saved-msg">Changes saved successfully.</span>}
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default BotIdentity;
