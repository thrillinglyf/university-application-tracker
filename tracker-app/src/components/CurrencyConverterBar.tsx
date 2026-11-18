import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, DollarSign, Globe2 } from 'lucide-react';

export const POPULAR_CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar' },
  { code: 'SGD', symbol: 'SG$', label: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
];

// Fallback rates against USD (updated reference)
const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  INR: 84.4,
  EUR: 0.95,
  GBP: 0.79,
  CAD: 1.40,
  AUD: 1.54,
  SGD: 1.34,
  CHF: 0.88,
  JPY: 154.5,
  SEK: 10.95,
};

const STORAGE_RATES_KEY = 'gradtrack_forex_rates_v1';
const STORAGE_PREFERRED_CURRENCY_KEY = 'gradtrack_preferred_currency';

interface CurrencyConverterBarProps {
  preferredCurrency: string;
  onCurrencyChange: (currency: string) => void;
  rates: Record<string, number>;
  onRatesUpdate: (rates: Record<string, number>) => void;
}

export const CurrencyConverterBar: React.FC<CurrencyConverterBarProps> = ({
  preferredCurrency,
  onCurrencyChange,
  rates,
  onRatesUpdate,
}) => {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>(preferredCurrency);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Sync toCurrency when preferredCurrency changes
  useEffect(() => {
    setToCurrency(preferredCurrency);
  }, [preferredCurrency]);

  const fetchLiveRates = async () => {
    setIsFetching(true);
    try {
      // Free open-access ExchangeRate-API endpoint with no key required
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (response.ok) {
        const data = await response.json();
        if (data.rates) {
          onRatesUpdate(data.rates);
          localStorage.setItem(
            STORAGE_RATES_KEY,
            JSON.stringify({ rates: data.rates, date: new Date().toLocaleTimeString() })
          );
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch live forex rates, using cached/fallback rates', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Check cached rates
    const cached = localStorage.getItem(STORAGE_RATES_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.rates) {
          onRatesUpdate(parsed.rates);
          setLastUpdated(parsed.date || 'Cached');
        }
      } catch (e) {
        fetchLiveRates();
      }
    } else {
      fetchLiveRates();
    }
  }, []);

  // Compute conversion: amount in fromCurrency converted to toCurrency
  const convertCurrency = (amt: number, from: string, to: string) => {
    const rateFrom = rates[from] || FALLBACK_USD_RATES[from] || 1;
    const rateTo = rates[to] || FALLBACK_USD_RATES[to] || 1;
    // Base is USD
    const inUSD = amt / rateFrom;
    return (inUSD * rateTo).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const convertedValue = convertCurrency(amount, fromCurrency, toCurrency);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8 text-xs shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Global Display Currency Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Display Application Fees in:</span>
          </div>
          <select
            value={preferredCurrency}
            onChange={(e) => {
              onCurrencyChange(e.target.value);
              setToCurrency(e.target.value);
            }}
            className="bg-slate-800 text-amber-300 font-bold border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} ({c.label})
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400 hidden lg:inline">
            (All fees across universities auto-converted in real time)
          </span>
        </div>

        {/* Right: Quick Converter Calculator */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">
            Quick Calc:
          </span>
          
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-20 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 font-semibold text-right"
            placeholder="Amount"
          />

          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none"
          >
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwap}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Swap currencies"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-md px-2 py-1 text-xs focus:outline-none"
          >
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          <div className="bg-sky-500/20 border border-sky-400/30 text-sky-300 font-bold px-2.5 py-1 rounded-md text-xs">
            = {convertedValue} {toCurrency}
          </div>

          <button
            onClick={fetchLiveRates}
            disabled={isFetching}
            className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition-colors"
            title={`Refresh live rates ${lastUpdated ? `(Last updated: ${lastUpdated})` : ''}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
};
