import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SymbolAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Popular stocks and crypto symbols for autocomplete
const POPULAR_SYMBOLS = [
  // Stocks
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'BAC', 'ADBE', 'CRM', 'NFLX', 'INTC', 'CMCSA', 'XOM', 'KO', 'PFE', 'ABT', 'NKE', 'COST', 'WMT', 'DHR', 'ACN', 'TXN', 'AVGO', 'LLY', 'WFC', 'ORCL', 'MCD', 'HON', 'LIN', 'IBM', 'AMD', 'CAT', 'GS', 'SPGI', 'BLK', 'AXP', 'CSCO', 'INTU', 'AMGN', 'ISRG', 'CVX', 'BA', 'MMM', 'MRK', 'TMO', 'ABBV', 'COF', 'BKNG', 'NOW', 'ADP', 'SYK', 'CB', 'CI', 'MMC', 'BDX', 'MO', 'DUK', 'SO', 'AON', 'ITW', 'ZTS', 'ICE', 'NSC', 'PGR', 'WM', 'EMR', 'FDX', 'CSX', 'OXY', 'COP', 'EOG', 'PXD', 'MRO', 'DVN', 'FANG', 'HES', 'CLR', 'PE', 'RRC', 'SWN', 'CHK', 'COG', 'APA', 'MUR', 'XEC', 'QEP', 'WPX', 'LPI', 'JAG', 'MTDR', 'PDCE', 'SM', 'SRCI', 'WLL', 'DEN', 'AR', 'RSPP', 'VNOM', 'KRP', 'CPE', 'GPOR', 'SBOW', 'BATL', 'PNRG', 'PHX', 'REI', 'VOC', 'SBR', 'PBT', 'MTR', 'CRT', 'PVAC', 'GTE', 'BRY', 'DMLP', 'NRT', 'SJT', 'BPT', 'NDRO', 'PVL', 'VNRX', 'TPL', 'DMLP', 'NRT', 'SJT', 'BPT', 'NDRO', 'PVL', 'VNRX', 'TPL',
  // Crypto
  'BTC', 'ETH', 'BNB', 'ADA', 'XRP', 'SOL', 'DOT', 'AVAX', 'LUNA', 'UNI', 'LINK', 'LTC', 'BCH', 'ALGO', 'MATIC', 'XLM', 'VET', 'ICP', 'FIL', 'TRX', 'ETC', 'THETA', 'AAVE', 'EOS', 'XMR', 'CAKE', 'KLAY', 'RUNE', 'NEO', 'QTUM', 'IOTA', 'ZEC', 'WAVES', 'DASH', 'COMP', 'YFI', 'SUSHI', 'CRV', 'SNX', 'MKR', 'UMA', 'REN', 'BAL', 'KNC', 'BNT', 'ANT', 'GNO', 'MLN', 'REP', 'GVT', 'RDN', 'SNT', 'BAT', 'ZRX', 'GNT', 'CVC', 'STORJ', 'BLZ', 'ENJ', 'MANA', 'SAND', 'AXS', 'SLP', 'TLM', 'ALICE', 'CHR', 'PERP', 'ROSE', 'SKL', 'C98', 'TWT', 'ASR', 'CTK', 'BURGER', 'BAKE', 'BUNNY', 'AUTO', 'HARD', 'SFP', 'LINA', 'LIT', 'MDX', 'BIFI', 'DODO', 'BETA', 'RAMP', 'BELT', 'TUSD', 'BUSD', 'USDC', 'USDT', 'DAI', 'FRAX', 'UST', 'LUSD', 'FEI', 'TRIBE', 'FLOAT', 'BANK', 'XCON', 'OHM', 'TIME', 'SPELL', 'CVX', 'FXS', 'TOKE', 'INV', 'PENDLE', 'SDT', 'AGLD', 'RAD', 'POLS', 'MC', 'KP3R', 'RARI', 'DIA', 'API3', 'ORBS', 'RAMP', 'BELT', 'TUSD', 'BUSD', 'USDC', 'USDT', 'DAI', 'FRAX', 'UST', 'LUSD', 'FEI', 'TRIBE', 'FLOAT', 'BANK', 'XCON', 'OHM', 'TIME', 'SPELL', 'CVX', 'FXS', 'TOKE', 'INV', 'PENDLE', 'SDT', 'AGLD', 'RAD', 'POLS', 'MC', 'KP3R', 'RARI', 'DIA', 'API3', 'ORBS'
];

export default function SymbolAutocomplete({
  value,
  onChange,
  placeholder = "Enter stock or crypto symbol",
  className = ""
}: SymbolAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = POPULAR_SYMBOLS.filter(symbol =>
        symbol.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions
      setFilteredSymbols(filtered);
      setIsOpen(filtered.length > 0 && value.length >= 1);
      console.log('SymbolAutocomplete Debug:', { value, filteredCount: filtered.length, isOpen: filtered.length > 0 && value.length >= 1 });
    } else {
      setFilteredSymbols([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const clearInput = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (filteredSymbols.length > 0 && value.length >= 1) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
        />
        {value && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filteredSymbols.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b border-gray-200 dark:border-gray-700">
            {filteredSymbols.length} suggestions for "{value}"
          </div>
          {filteredSymbols.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => handleSelect(symbol)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{symbol}</span>
                <span className="text-sm text-gray-500">
                  {symbol.length <= 5 ? 'Stock' : 'Crypto'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
