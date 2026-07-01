// FX Checker App
const API_BASE = 'https://api.frankfurter.app';

// Mock data as fallback
const MOCK_CURRENCIES = {
  "AUD": "Australian Dollar",
  "BGN": "Bulgarian Lev",
  "BRL": "Brazilian Real",
  "CAD": "Canadian Dollar",
  "CHF": "Swiss Franc",
  "CNY": "Chinese Renminbi",
  "CZK": "Czech Koruna",
  "DKK": "Danish Krone",
  "EUR": "Euro",
  "GBP": "British Pound",
  "HKD": "Hong Kong Dollar",
  "HUF": "Hungarian Forint",
  "IDR": "Indonesian Rupiah",
  "ILS": "Israeli New Shekel",
  "INR": "Indian Rupee",
  "ISK": "Icelandic Króna",
  "JPY": "Japanese Yen",
  "KRW": "South Korean Won",
  "MXN": "Mexican Peso",
  "MYR": "Malaysian Ringgit",
  "NOK": "Norwegian Krone",
  "NZD": "New Zealand Dollar",
  "PHP": "Philippine Peso",
  "PLN": "Polish Złoty",
  "RON": "Romanian Leu",
  "SEK": "Swedish Krona",
  "SGD": "Singapore Dollar",
  "THB": "Thai Baht",
  "TRY": "Turkish Lira",
  "USD": "United States Dollar",
  "ZAR": "South African Rand"
};

const MOCK_RATES = {
  "EUR": 0.93,
  "GBP": 0.79,
  "JPY": 155.23,
  "AUD": 1.52,
  "CAD": 1.37,
  "CHF": 0.88,
  "CNY": 7.25
};

// Popular currencies
const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

// Currency to flag mapping
const CURRENCY_FLAGS = {
  'AED': 'ae', 'ARS': 'ar', 'AUD': 'au', 'BDT': 'bd', 'BGN': 'bg', 'BHD': 'bh',
  'BRL': 'br', 'CAD': 'ca', 'CHF': 'ch', 'CLP': 'cl', 'CNY': 'cn', 'COP': 'co',
  'CZK': 'cz', 'DKK': 'dk', 'EGP': 'eg', 'EUR': 'eu', 'GBP': 'gb', 'HKD': 'hk',
  'HNL': 'hn', 'HRK': 'hr', 'HTG': 'ht', 'HUF': 'hu', 'IDR': 'id', 'ILS': 'hm',
  'INR': 'in', 'ISK': 'is', 'JOD': 'jo', 'JPY': 'jp', 'KES': 'ke', 'KRW': 'kr',
  'KWD': 'kw', 'LBP': 'lb', 'LKR': 'lk', 'MAD': 'ma', 'MXN': 'mx', 'MYR': 'my',
  'NGN': 'ng', 'NOK': 'no', 'NPR': 'np', 'NZD': 'nz', 'OMR': 'om', 'PEN': 'pe',
  'PHP': 'ph', 'PKR': 'pk', 'PLN': 'pl', 'QAR': 'qa', 'RON': 'ro', 'RUB': 'ru',
  'SAR': 'sa', 'SEK': 'se', 'SGD': 'sg', 'THB': 'th', 'TRY': 'tr', 'TWD': 'tw',
  'UAH': 'ua', 'USD': 'us', 'VND': 'vn', 'ZAR': 'za'
};

// State
let state = {
  currencies: {},
  rates: {},
  sendAmount: 1000,
  sendCurrency: 'USD',
  receiveCurrency: 'EUR',
  favorites: [],
  conversions: [],
  activeTab: 'history',
  activeRange: '1m',
  historyData: null,
  pickerOpen: false,
  pickerType: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  fetchCurrencies();
  fetchRates();
  setupEventListeners();
  render();
});

// Load from localStorage
function loadFromStorage() {
  const savedFavorites = localStorage.getItem('fxFavorites');
  const savedConversions = localStorage.getItem('fxConversions');
  const savedTab = localStorage.getItem('fxActiveTab');
  
  if (savedFavorites) state.favorites = JSON.parse(savedFavorites);
  if (savedConversions) state.conversions = JSON.parse(savedConversions);
  if (savedTab) state.activeTab = savedTab;
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem('fxFavorites', JSON.stringify(state.favorites));
  localStorage.setItem('fxConversions', JSON.stringify(state.conversions));
  localStorage.setItem('fxActiveTab', state.activeTab);
}

// Fetch currencies from API
async function fetchCurrencies() {
  try {
    const response = await fetch(`${API_BASE}/currencies`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    state.currencies = await response.json();
    render();
  } catch (error) {
    console.warn('Using mock currencies:', error);
    state.currencies = MOCK_CURRENCIES;
    render();
  }
}

// Fetch latest rates
async function fetchRates(base = state.sendCurrency) {
  try {
    const response = await fetch(`${API_BASE}/latest?base=${base}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    state.rates = data.rates || {};
    render();
  } catch (error) {
    console.warn('Using mock rates:', error);
    if (base === 'USD') {
      state.rates = MOCK_RATES;
    } else {
      // Simple mock rate calculation for other bases
      state.rates = {};
      Object.keys(MOCK_CURRENCIES).forEach(currency => {
        if (currency !== base) {
          state.rates[currency] = 0.8 + Math.random() * 1.5;
        }
      });
    }
    render();
  }
}

// Fetch history data
async function fetchHistory() {
  const end = new Date();
  let start = new Date();
  
  switch (state.activeRange) {
    case '1d': start.setDate(end.getDate() - 1); break;
    case '1w': start.setDate(end.getDate() - 7); break;
    case '1m': start.setMonth(end.getMonth() - 1); break;
    case '3m': start.setMonth(end.getMonth() - 3); break;
    case '1y': start.setFullYear(end.getFullYear() - 1); break;
    case '5y': start.setFullYear(end.getFullYear() - 5); break;
  }
  
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  
  try {
    const response = await fetch(
      `${API_BASE}/${startStr}..${endStr}?base=${state.sendCurrency}&symbols=${state.receiveCurrency}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    state.historyData = data.rates;
    render();
    if (state.historyData) {
      drawChart();
    }
  } catch (error) {
    console.warn('Using mock history data:', error);
    // Generate mock history data
    state.historyData = {};
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const baseRate = state.rates[state.receiveCurrency] || 0.93;
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      state.historyData[dateStr] = {
        [state.receiveCurrency]: baseRate + (Math.random() - 0.5) * 0.1
      };
    }
    render();
    drawChart();
  }
}

// Draw chart
function drawChart() {
  const canvas = document.getElementById('chartCanvas');
  if (!canvas || !state.historyData) return;
  
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  
  const dates = Object.keys(state.historyData).sort();
  const values = dates.map(d => state.historyData[d][state.receiveCurrency]);
  
  if (values.length < 2) return;
  
  const width = rect.width;
  const height = rect.height;
  const padding = 40;
  
  const minVal = Math.min(...values) * 0.999;
  const maxVal = Math.max(...values) * 1.001;
  const range = maxVal - minVal;
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw area
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  values.forEach((val, i) => {
    const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    ctx.lineTo(x, y);
  });
  ctx.lineTo(width - padding, height - padding);
  ctx.closePath();
  ctx.fill();
  
  // Draw line
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((val, i) => {
    const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  
  // Y-axis labels
  ctx.fillStyle = '#9ba4b5';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'right';
  ctx.fillText(formatNumber(maxVal, 4), padding - 10, padding + 5);
  ctx.fillText(formatNumber((maxVal + minVal) / 2, 4), padding - 10, height / 2);
  ctx.fillText(formatNumber(minVal, 4), padding - 10, height - padding - 5);
  
  // X-axis labels
  ctx.textAlign = 'center';
  if (dates.length > 0) {
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);
    ctx.fillText(firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), padding, height - 10);
    ctx.fillText(lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), width - padding, height - 10);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Send amount input
  document.getElementById('sendAmount')?.addEventListener('input', (e) => {
    state.sendAmount = parseFloat(e.target.value) || 0;
    render();
  });
  
  // Swap button
  document.getElementById('swapBtn')?.addEventListener('click', () => {
    const temp = state.sendCurrency;
    state.sendCurrency = state.receiveCurrency;
    state.receiveCurrency = temp;
    fetchRates();
  });
  
  // Currency buttons
  document.getElementById('sendCurrencyBtn')?.addEventListener('click', () => {
    state.pickerType = 'send';
    state.pickerOpen = true;
    render();
    setTimeout(() => document.getElementById('currencySearch')?.focus(), 100);
  });
  
  document.getElementById('receiveCurrencyBtn')?.addEventListener('click', () => {
    state.pickerType = 'receive';
    state.pickerOpen = true;
    render();
    setTimeout(() => document.getElementById('currencySearch')?.focus(), 100);
  });
  
  // Favorite button
  document.getElementById('favoriteBtn')?.addEventListener('click', toggleFavorite);
  
  // Log conversion button
  document.getElementById('logBtn')?.addEventListener('click', logConversion);
  
  // Tabs
  document.querySelectorAll('.tabs__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      saveToStorage();
      if (state.activeTab === 'history') {
        fetchHistory();
      }
      render();
    });
  });
  
  // History range buttons
  document.querySelectorAll('.history__range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeRange = btn.dataset.range;
      fetchHistory();
    });
  });
  
  // Clear log button
  document.getElementById('clearLogBtn')?.addEventListener('click', () => {
    state.conversions = [];
    saveToStorage();
    render();
  });
  
  // Resize handler for chart
  window.addEventListener('resize', () => {
    if (state.activeTab === 'history' && state.historyData) {
      drawChart();
    }
  });
}

// Toggle favorite
function toggleFavorite() {
  const pair = `${state.sendCurrency}/${state.receiveCurrency}`;
  const index = state.favorites.findIndex(f => f.pair === pair);
  
  if (index > -1) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push({
      pair,
      base: state.sendCurrency,
      target: state.receiveCurrency,
      timestamp: Date.now()
    });
  }
  
  saveToStorage();
  render();
}

// Log conversion
function logConversion() {
  const rate = state.rates[state.receiveCurrency];
  if (!rate) return;
  
  state.conversions.unshift({
    id: Date.now(),
    fromCurrency: state.sendCurrency,
    toCurrency: state.receiveCurrency,
    fromAmount: state.sendAmount,
    toAmount: state.sendAmount * rate,
    timestamp: Date.now()
  });
  
  if (state.conversions.length > 50) {
    state.conversions.pop();
  }
  
  saveToStorage();
  render();
}

// Get flag path
function getFlagPath(currency) {
  const code = CURRENCY_FLAGS[currency] || 'us';
  return `./assets/images/flags/${code}.webp`;
}

// Format number
function formatNumber(num, decimals = 4) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

// Format relative time
function formatRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  
  const date = new Date(timestamp);
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
}

// Check if pair is favorite
function isFavorite() {
  const pair = `${state.sendCurrency}/${state.receiveCurrency}`;
  return state.favorites.some(f => f.pair === pair);
}

// Render app
function render() {
  renderHeader();
  renderTicker();
  renderConverter();
  renderCurrencyPicker();
  renderTabs();
  renderHistory();
  renderCompare();
  renderFavorites();
  renderLog();
}

// Render header
function renderHeader() {
  const count = Object.keys(state.currencies).length;
  const metaEl = document.getElementById('headerMeta');
  if (metaEl) {
    metaEl.textContent = `${count} Currencies · EOD · ECB data`;
  }
}

// Render ticker
function renderTicker() {
  const tickerContent = document.getElementById('tickerContent');
  if (!tickerContent) return;
  
  const pairs = [
    'USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/AUD', 'USD/CAD',
    'EUR/USD', 'EUR/GBP', 'GBP/USD', 'USD/CHF', 'USD/CNY'
  ];
  
  let html = '';
  pairs.forEach(pair => {
    const [base, target] = pair.split('/');
    const rate = base === state.sendCurrency ? state.rates[target] : null;
    const change = (Math.random() - 0.5) * 2; // Mock change
    const isPositive = change >= 0;
    
    html += `
      <div class="ticker__item">
        <span class="ticker__pair">${pair}</span>
        <span class="ticker__rate">${rate ? formatNumber(rate, 4) : '----'}</span>
        <span class="ticker__change ticker__change--${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '▲' : '▼'} ${formatNumber(Math.abs(change), 2)}%
        </span>
      </div>
    `;
  });
  
  tickerContent.innerHTML = html + html; // Duplicate for seamless loop
}

// Render converter
function renderConverter() {
  const sendAmountEl = document.getElementById('sendAmount');
  const receiveAmountEl = document.getElementById('receiveAmount');
  const sendBtnEl = document.getElementById('sendCurrencyBtn');
  const receiveBtnEl = document.getElementById('receiveCurrencyBtn');
  const rateEl = document.getElementById('exchangeRate');
  const favoriteBtnEl = document.getElementById('favoriteBtn');
  
  const rate = state.rates[state.receiveCurrency];
  const receiveAmount = rate ? state.sendAmount * rate : null;
  
  if (sendAmountEl) sendAmountEl.value = state.sendAmount;
  if (receiveAmountEl) receiveAmountEl.textContent = receiveAmount !== null ? formatNumber(receiveAmount, 4) : '----';
  
  if (sendBtnEl) {
    sendBtnEl.innerHTML = `
      <img src="${getFlagPath(state.sendCurrency)}" alt="${state.sendCurrency}" class="converter__flag">
      <span>${state.sendCurrency}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  
  if (receiveBtnEl) {
    receiveBtnEl.innerHTML = `
      <img src="${getFlagPath(state.receiveCurrency)}" alt="${state.receiveCurrency}" class="converter__flag">
      <span>${state.receiveCurrency}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  
  if (rateEl) {
    rateEl.textContent = rate ? `1 ${state.sendCurrency} = ${formatNumber(rate, 4)} ${state.receiveCurrency}` : 'Loading rates...';
  }
  
  if (favoriteBtnEl) {
    favoriteBtnEl.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${isFavorite() 
          ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>'
          : '<path d="M22 9.27l-7.19-.62L12 2 9.19 8.65 2 9.27l5.23 5.07L5.82 21 12 17.77 18.18 21l-1.41-6.66L22 9.27zm-10 6.37l-4.05 2.17 1.02-4.79-3.52-3.42 4.83-.42L12 5.59l1.72 3.67 4.83.42-3.52 3.42 1.02 4.79L12 15.64z" fill="currentColor"/>'
        }
      </svg>
      ${isFavorite() ? 'Favorited' : 'Favorite'}
    `;
  }
}

// Render currency picker
function renderCurrencyPicker() {
  const pickerEl = document.getElementById('currencyPicker');
  const pickerListEl = document.getElementById('currencyPickerList');
  
  if (!pickerEl || !pickerListEl) return;
  
  if (state.pickerOpen) {
    pickerEl.classList.add('currency-picker--open');
  } else {
    pickerEl.classList.remove('currency-picker--open');
    return;
  }
  
  // Close on backdrop click
  pickerEl.onclick = (e) => {
    if (e.target === pickerEl) {
      state.pickerOpen = false;
      render();
    }
  };
  
  // Search functionality
  const searchInput = document.getElementById('currencySearch');
  const renderList = (query = '') => {
    const q = query.toLowerCase();
    const allCurrencies = Object.keys(state.currencies);
    
    const popular = allCurrencies.filter(c => 
      POPULAR_CURRENCIES.includes(c) && 
      (c.toLowerCase().includes(q) || (state.currencies[c] && state.currencies[c].toLowerCase().includes(q)))
    );
    
    const other = allCurrencies.filter(c => 
      !POPULAR_CURRENCIES.includes(c) && 
      (c.toLowerCase().includes(q) || (state.currencies[c] && state.currencies[c].toLowerCase().includes(q)))
    );
    
    let html = '';
    
    if (popular.length > 0) {
      html += `
        <div class="currency-picker__section">
          <div class="currency-picker__section-title">Popular (${popular.length})</div>
          <ul class="currency-picker__list">
            ${popular.map(currency => renderCurrencyItem(currency)).join('')}
          </ul>
        </div>
      `;
    }
    
    if (other.length > 0) {
      html += `
        <div class="currency-picker__section">
          <div class="currency-picker__section-title">Other currencies (${other.length})</div>
          <ul class="currency-picker__list">
            ${other.map(currency => renderCurrencyItem(currency)).join('')}
          </ul>
        </div>
      `;
    }
    
    pickerListEl.innerHTML = html;
  };
  
  const renderCurrencyItem = (currency) => {
    const isSelected = state.pickerType === 'send' 
      ? currency === state.sendCurrency 
      : currency === state.receiveCurrency;
    
    return `
      <li class="currency-picker__item ${isSelected ? 'currency-picker__item--selected' : ''}" data-currency="${currency}">
        <img src="${getFlagPath(currency)}" alt="${currency}" class="currency-picker__flag">
        <span class="currency-picker__code">${currency}</span>
        <span class="currency-picker__name">${state.currencies[currency] || currency}</span>
        ${isSelected ? '<span class="currency-picker__check">✓</span>' : ''}
      </li>
    `;
  };
  
  if (searchInput) {
    searchInput.oninput = (e) => renderList(e.target.value);
    searchInput.value = '';
  }
  
  renderList();
  
  // Click handlers
  pickerListEl.onclick = (e) => {
    const item = e.target.closest('.currency-picker__item');
    if (item) {
      const currency = item.dataset.currency;
      if (state.pickerType === 'send') {
        state.sendCurrency = currency;
        fetchRates();
      } else {
        state.receiveCurrency = currency;
      }
      state.pickerOpen = false;
      render();
    }
  };
  
  // Close on escape
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      state.pickerOpen = false;
      document.removeEventListener('keydown', escapeHandler);
      render();
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Render tabs
function renderTabs() {
  document.querySelectorAll('.tabs__trigger').forEach(btn => {
    btn.classList.toggle('tabs__trigger--active', btn.dataset.tab === state.activeTab);
    btn.setAttribute('aria-selected', btn.dataset.tab === state.activeTab);
  });
  
  document.querySelectorAll('.tabs__panel').forEach(panel => {
    panel.classList.toggle('tabs__panel--active', 
      panel.id === `${state.activeTab}Panel`);
  });
  
  // Update badges
  const favoritesBadge = document.querySelector('[data-tab="favorites"] .tabs__badge');
  const logBadge = document.querySelector('[data-tab="log"] .tabs__badge');
  
  if (favoritesBadge) favoritesBadge.textContent = state.favorites.length;
  if (logBadge) logBadge.textContent = state.conversions.length;
}

// Render history
function renderHistory() {
  // Fetch history if needed
  if (state.activeTab === 'history' && !state.historyData) {
    fetchHistory();
  }
  
  const chartContainer = document.getElementById('historyChart');
  const errorContainer = document.getElementById('historyError');
  
  if (!chartContainer || !errorContainer) return;
  
  document.querySelectorAll('.history__range-btn').forEach(btn => {
    btn.classList.toggle('history__range-btn--active', btn.dataset.range === state.activeRange);
  });
  
  if (state.historyData) {
    chartContainer.style.display = 'block';
    errorContainer.style.display = 'none';
    
    const dates = Object.keys(state.historyData).sort();
    const values = dates.map(d => state.historyData[d][state.receiveCurrency]);
    
    const chartMeta = document.getElementById('historyChartMeta');
    if (chartMeta && dates.length > 0) {
      const lastDate = new Date(dates[dates.length - 1]);
      chartMeta.textContent = `${formatNumber(values[values.length - 1], 4)} · ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const chartPair = document.getElementById('historyChartPair');
    if (chartPair) {
      chartPair.textContent = `${state.sendCurrency}/${state.receiveCurrency}`;
    }
    
    // Stats
    if (values.length > 0) {
      const open = values[0];
      const last = values[values.length - 1];
      const change = last - open;
      const changePercent = (change / open) * 100;
      
      const openEl = document.getElementById('statOpen');
      const lastEl = document.getElementById('statLast');
      const changeEl = document.getElementById('statChange');
      const changePercentEl = document.getElementById('statChangePercent');
      
      if (openEl) openEl.textContent = formatNumber(open, 4);
      if (lastEl) lastEl.textContent = formatNumber(last, 4);
      if (changeEl) {
        changeEl.textContent = (change >= 0 ? '+' : '') + formatNumber(change, 4);
        changeEl.className = `history__stat-value history__stat-value--${change >= 0 ? 'positive' : 'negative'}`;
      }
      if (changePercentEl) {
        changePercentEl.textContent = `${change >= 0 ? '▲' : '▼'} ${formatNumber(Math.abs(changePercent), 2)}%`;
        changePercentEl.className = `history__stat-value history__stat-value--${changePercent >= 0 ? 'positive' : 'negative'}`;
      }
    }
    
    // Draw chart after render
    setTimeout(drawChart, 0);
  } else {
    chartContainer.style.display = 'none';
    errorContainer.style.display = 'block';
  }
}

// Render compare
function renderCompare() {
  const listEl = document.getElementById('compareList');
  const emptyEl = document.getElementById('compareEmpty');
  const metaEl = document.getElementById('compareMeta');
  
  if (!listEl || !emptyEl || !metaEl) return;
  
  if (state.sendAmount <= 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }
  
  const otherCurrencies = Object.keys(state.currencies).filter(c => c !== state.sendCurrency);
  
  if (otherCurrencies.length === 0 || !state.rates) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }
  
  listEl.style.display = 'block';
  emptyEl.style.display = 'none';
  
  metaEl.textContent = `${otherCurrencies.length} pairs`;
  
  let html = '';
  otherCurrencies.forEach(currency => {
    const rate = state.rates[currency];
    if (!rate) return;
    
    const amount = state.sendAmount * rate;
    const isPinned = state.favorites.some(f => f.pair === `${state.sendCurrency}/${currency}`);
    
    html += `
      <li class="compare__item" data-currency="${currency}">
        <img src="${getFlagPath(currency)}" alt="${currency}" class="compare__flag">
        <span class="compare__code">${currency}</span>
        <span class="compare__name">${state.currencies[currency] || currency}</span>
        <span class="compare__amount">${formatNumber(amount, 2)}</span>
        <span class="compare__rate">@ ${formatNumber(rate, 4)}</span>
        <button class="compare__pin-btn ${isPinned ? 'compare__pin-btn--pinned' : ''}" data-currency="${currency}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            ${isPinned 
              ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>'
              : '<path d="M22 9.27l-7.19-.62L12 2 9.19 8.65 2 9.27l5.23 5.07L5.82 21 12 17.77 18.18 21l-1.41-6.66L22 9.27zm-10 6.37l-4.05 2.17 1.02-4.79-3.52-3.42 4.83-.42L12 5.59l1.72 3.67 4.83.42-3.52 3.42 1.02 4.79L12 15.64z" fill="currentColor"/>'
            }
          </svg>
        </button>
      </li>
    `;
  });
  
  listEl.innerHTML = html;
  
  // Pin button handlers
  listEl.querySelectorAll('.compare__pin-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const currency = btn.dataset.currency;
      const pair = `${state.sendCurrency}/${currency}`;
      const index = state.favorites.findIndex(f => f.pair === pair);
      
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push({
          pair,
          base: state.sendCurrency,
          target: currency,
          timestamp: Date.now()
        });
      }
      
      saveToStorage();
      render();
    };
  });
}

// Render favorites
function renderFavorites() {
  const listEl = document.getElementById('favoritesList');
  const emptyEl = document.getElementById('favoritesEmpty');
  const metaEl = document.getElementById('favoritesMeta');
  
  if (!listEl || !emptyEl || !metaEl) return;
  
  metaEl.textContent = `${state.favorites.length} favorites`;
  
  if (state.favorites.length === 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }
  
  listEl.style.display = 'block';
  emptyEl.style.display = 'none';
  
  let html = '';
  state.favorites.forEach(fav => {
    const [base, target] = fav.pair.split('/');
    const rate = base === state.sendCurrency ? state.rates[target] : null;
    const change = (Math.random() - 0.5) * 2; // Mock change
    const isPositive = change >= 0;
    
    html += `
      <li class="favorites__item" data-pair="${fav.pair}">
        <span class="favorites__pair">${base} → ${target}</span>
        <span class="favorites__rate">${rate ? formatNumber(rate, 4) : '----'}</span>
        <span class="favorites__change favorites__change--${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '▲' : '▼'} ${formatNumber(Math.abs(change), 2)}%
        </span>
        <button class="favorites__unpin-btn" data-pair="${fav.pair}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </button>
      </li>
    `;
  });
  
  listEl.innerHTML = html;
  
  // Click handlers
  listEl.querySelectorAll('.favorites__item').forEach(item => {
    item.onclick = (e) => {
      if (e.target.closest('.favorites__unpin-btn')) return;
      
      const [base, target] = item.dataset.pair.split('/');
      state.sendCurrency = base;
      state.receiveCurrency = target;
      fetchRates();
      state.activeTab = 'history';
      saveToStorage();
      render();
    };
  });
  
  listEl.querySelectorAll('.favorites__unpin-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const pair = btn.dataset.pair;
      const index = state.favorites.findIndex(f => f.pair === pair);
      if (index > -1) {
        state.favorites.splice(index, 1);
        saveToStorage();
        render();
      }
    };
  });
}

// Render log
function renderLog() {
  const listEl = document.getElementById('logList');
  const emptyEl = document.getElementById('logEmpty');
  const metaEl = document.getElementById('logMeta');
  
  if (!listEl || !emptyEl || !metaEl) return;
  
  metaEl.textContent = `${state.conversions.length} logged`;
  
  if (state.conversions.length === 0) {
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }
  
  listEl.style.display = 'block';
  emptyEl.style.display = 'none';
  
  let html = '';
  state.conversions.forEach(conv => {
    html += `
      <li class="log__item">
        <span class="log__time">${formatRelativeTime(conv.timestamp)}</span>
        <span class="log__pair">${conv.fromCurrency} → ${conv.toCurrency}</span>
        <span class="log__amount-send">${formatNumber(conv.fromAmount, 2)} ${conv.fromCurrency}</span>
        <span class="log__arrow">→</span>
        <span class="log__amount-receive">${formatNumber(conv.toAmount, 2)} ${conv.toCurrency}</span>
        <button class="log__delete-btn" data-id="${conv.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </li>
    `;
  });
  
  listEl.innerHTML = html;
  
  // Delete handlers
  listEl.querySelectorAll('.log__delete-btn').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      state.conversions = state.conversions.filter(c => c.id !== id);
      saveToStorage();
      render();
    };
  });
}
