// Indian stock market data with real companies
// Prices are simulated but based on realistic ranges

const INDIAN_STOCKS = [
    // Tech Sector
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3450, category: 'tech', change: 2.5 },
    { symbol: 'INFY', name: 'Infosys', price: 1520, category: 'tech', change: 1.8 },
    { symbol: 'WIPRO', name: 'Wipro', price: 425, category: 'tech', change: -0.5 },
    { symbol: 'TECHM', name: 'Tech Mahindra', price: 1180, category: 'tech', change: 1.2 },
    { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1290, category: 'tech', change: 0.8 },

    // Finance Sector
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1650, category: 'finance', change: 1.5 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 950, category: 'finance', change: 2.1 },
    { symbol: 'SBIN', name: 'State Bank of India', price: 580, category: 'finance', change: -1.2 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1820, category: 'finance', change: 0.9 },
    { symbol: 'AXISBANK', name: 'Axis Bank', price: 970, category: 'finance', change: 1.3 },

    // Auto Sector
    { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 9850, category: 'auto', change: 3.2 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 620, category: 'auto', change: -2.1 },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 1450, category: 'auto', change: 2.8 },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', price: 6200, category: 'auto', change: 1.5 },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', price: 3180, category: 'auto', change: 0.6 },

    // Pharma Sector
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1120, category: 'pharma', change: 1.9 },
    { symbol: 'DRREDDY', name: 'Dr. Reddys Labs', price: 5450, category: 'pharma', change: -0.8 },
    { symbol: 'CIPLA', name: 'Cipla', price: 1090, category: 'pharma', change: 2.3 },
    { symbol: 'DIVISLAB', name: 'Divis Laboratories', price: 3680, category: 'pharma', change: 1.1 },
    { symbol: 'BIOCON', name: 'Biocon', price: 285, category: 'pharma', change: -1.5 },

    // Consumer Goods
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450, category: 'energy', change: 2.7 },
    { symbol: 'ITC', name: 'ITC Limited', price: 420, category: 'fmcg', change: 0.5 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2580, category: 'fmcg', change: 1.2 },
    { symbol: 'NESTLEIND', name: 'Nestle India', price: 22500, category: 'fmcg', change: 0.9 },
    { symbol: 'BRITANNIA', name: 'Britannia Industries', price: 4850, category: 'fmcg', change: 1.6 },
];

// Initialize stock prices in localStorage
function initializeStockPrices() {
    const existingPrices = localStorage.getItem('stocksim_prices');

    if (!existingPrices) {
        const pricesObj = {};
        INDIAN_STOCKS.forEach(stock => {
            pricesObj[stock.symbol] = {
                name: stock.name,
                price: stock.price,
                category: stock.category,
                change: stock.change,
                history: [stock.price]
            };
        });
        localStorage.setItem('stocksim_prices', JSON.stringify(pricesObj));
    }
}

// Simulate stock price changes (for time progression)
function simulateStockPriceChange() {
    const prices = JSON.parse(localStorage.getItem('stocksim_prices'));

    for (const symbol in prices) {
        const stock = prices[symbol];
        // Random change between -5% and +5%
        const changePercent = (Math.random() - 0.5) * 10;
        const newPrice = stock.price * (1 + changePercent / 100);

        // Ensure price doesn't go below 10% of original
        const originalStock = INDIAN_STOCKS.find(s => s.symbol === symbol);
        const minPrice = originalStock.price * 0.1;
        const maxPrice = originalStock.price * 5;

        stock.price = Math.max(minPrice, Math.min(maxPrice, newPrice));
        stock.change = changePercent;

        // Keep history of last 30 prices
        if (!stock.history) stock.history = [];
        stock.history.push(stock.price);
        if (stock.history.length > 30) {
            stock.history.shift();
        }
    }

    localStorage.setItem('stocksim_prices', JSON.stringify(prices));
}

// Get current stock prices
function getStockPrices() {
    return JSON.parse(localStorage.getItem('stocksim_prices') || '{}');
}

// Get stock by symbol
function getStock(symbol) {
    const prices = getStockPrices();
    return prices[symbol];
}

// Initialize on load
initializeStockPrices();
