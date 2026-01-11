// Check if user is logged in
const currentUserEmail = localStorage.getItem('stocksim_currentUser');
if (!currentUserEmail) {
    window.location.href = 'auth.html';
}

const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
let currentUser = users[currentUserEmail];

if (!currentUser) {
    window.location.href = 'auth.html';
}

let currentCategory = 'all';
let selectedStock = null;
let tradeType = 'BUY';

function logout() {
    localStorage.removeItem('stocksim_currentUser');
    window.location.href = 'index.html';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

function updateBalance() {
    const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
    currentUser = users[currentUserEmail];
    document.getElementById('cash-balance').textContent = formatCurrency(currentUser.balance);
}

function displayStocks() {
    const stocksGrid = document.getElementById('stocks-grid');
    const stockPrices = getStockPrices();
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    let stocksHTML = '';
    let displayedCount = 0;

    for (const symbol in stockPrices) {
        const stock = stockPrices[symbol];

        // Filter by category
        if (currentCategory !== 'all' && stock.category !== currentCategory) {
            continue;
        }

        // Filter by search
        if (searchTerm && !stock.name.toLowerCase().includes(searchTerm) && !symbol.toLowerCase().includes(searchTerm)) {
            continue;
        }

        const changeClass = stock.change >= 0 ? 'positive' : 'negative';
        const changeSign = stock.change >= 0 ? '+' : '';

        stocksHTML += `
            <div class="stock-card">
                <div class="stock-header">
                    <div>
                        <div class="stock-name">${stock.name}</div>
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">${symbol}</div>
                    </div>
                </div>
                <div class="stock-price">₹${formatCurrency(stock.price)}</div>
                <div class="stock-change ${changeClass}">
                    ${changeSign}${stock.change.toFixed(2)}%
                </div>
                <button class="trade-btn" onclick="openTradeModal('${symbol}', 'BUY')">
                    Buy Stock
                </button>
            </div>
        `;

        displayedCount++;
    }

    if (displayedCount === 0) {
        stocksHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No stocks found.</p>';
    }

    stocksGrid.innerHTML = stocksHTML;
}

function filterByCategory(category) {
    currentCategory = category;
    displayStocks();
}

function filterStocks() {
    displayStocks();
}

function openTradeModal(symbol, type) {
    selectedStock = getStock(symbol);
    tradeType = type;

    // Check if selling
    if (type === 'SELL') {
        if (!currentUser.portfolio[symbol] || currentUser.portfolio[symbol].quantity === 0) {
            alert('You don\'t own any shares of this stock!');
            return;
        }
    }

    const modal = document.getElementById('trade-modal');
    document.getElementById('modal-title').textContent = type === 'BUY' ? 'Buy Stock' : 'Sell Stock';
    document.getElementById('stock-name-modal').textContent = selectedStock.name;
    document.getElementById('stock-symbol-modal').textContent = symbol;
    document.getElementById('stock-price-modal').textContent = `₹${formatCurrency(selectedStock.price)}`;
    document.getElementById('trade-submit-btn').textContent = type === 'BUY' ? 'Buy' : 'Sell';
    document.getElementById('trade-submit-btn').style.background = type === 'BUY'
        ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
        : 'var(--danger)';

    // Set max quantity for selling
    if (type === 'SELL') {
        const maxQuantity = currentUser.portfolio[symbol].quantity;
        document.getElementById('quantity').max = maxQuantity;
        document.getElementById('quantity').placeholder = `Max: ${maxQuantity}`;
    } else {
        document.getElementById('quantity').removeAttribute('max');
        document.getElementById('quantity').placeholder = 'Enter quantity';
    }

    document.getElementById('quantity').value = '';
    document.getElementById('total-amount').textContent = '0';

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('trade-modal');
    modal.classList.remove('active');
    selectedStock = null;
}

function updateTotal() {
    const quantity = parseInt(document.getElementById('quantity').value) || 0;
    const total = quantity * selectedStock.price;
    document.getElementById('total-amount').textContent = formatCurrency(total);
}

function executeTrade(event) {
    event.preventDefault();

    const quantity = parseInt(document.getElementById('quantity').value);
    const total = quantity * selectedStock.price;
    const symbol = document.getElementById('stock-symbol-modal').textContent;

    // Refresh user data
    const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
    currentUser = users[currentUserEmail];

    if (tradeType === 'BUY') {
        // Check if user has enough balance
        if (currentUser.balance < total) {
            alert('Insufficient balance!');
            return;
        }

        // Deduct balance
        currentUser.balance -= total;

        // Add to portfolio
        if (!currentUser.portfolio[symbol]) {
            currentUser.portfolio[symbol] = {
                quantity: 0,
                avgPrice: 0
            };
        }

        const holding = currentUser.portfolio[symbol];
        const newTotalQuantity = holding.quantity + quantity;
        const newAvgPrice = ((holding.quantity * holding.avgPrice) + (quantity * selectedStock.price)) / newTotalQuantity;

        holding.quantity = newTotalQuantity;
        holding.avgPrice = newAvgPrice;

        // Add transaction
        currentUser.transactions.push({
            type: 'BUY',
            symbol: symbol,
            quantity: quantity,
            price: selectedStock.price,
            total: total,
            date: new Date().toISOString()
        });

        alert(`Successfully bought ${quantity} shares of ${symbol} for ₹${formatCurrency(total)}!`);

    } else {
        // SELL
        const holding = currentUser.portfolio[symbol];

        if (!holding || holding.quantity < quantity) {
            alert('You don\'t have enough shares to sell!');
            return;
        }

        // Add balance
        currentUser.balance += total;

        // Remove from portfolio
        holding.quantity -= quantity;

        if (holding.quantity === 0) {
            delete currentUser.portfolio[symbol];
        }

        // Add transaction
        currentUser.transactions.push({
            type: 'SELL',
            symbol: symbol,
            quantity: quantity,
            price: selectedStock.price,
            total: total,
            date: new Date().toISOString()
        });

        alert(`Successfully sold ${quantity} shares of ${symbol} for ₹${formatCurrency(total)}!`);
    }

    // Save user data
    users[currentUserEmail] = currentUser;
    localStorage.setItem('stocksim_users', JSON.stringify(users));

    // Close modal and update display
    closeModal();
    updateBalance();
}

// Check if URL has sell parameter
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sellSymbol = urlParams.get('sell');

    if (sellSymbol) {
        openTradeModal(sellSymbol, 'SELL');
        // Clean URL
        window.history.replaceState({}, document.title, 'market.html');
    }
});

// Initialize
updateBalance();
displayStocks();

// Update prices every 10 seconds
setInterval(() => {
    displayStocks();
}, 10000);
