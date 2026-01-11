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

// Initialize simulation data if not exists
if (!localStorage.getItem('stocksim_simulation')) {
    const simulation = {
        day: 1,
        week: 1,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('stocksim_simulation', JSON.stringify(simulation));
}

function logout() {
    localStorage.removeItem('stocksim_currentUser');
    window.location.href = 'index.html';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function calculatePortfolioValue() {
    let portfolioValue = 0;
    const stockPrices = JSON.parse(localStorage.getItem('stocksim_prices') || '{}');

    for (const [symbol, holding] of Object.entries(currentUser.portfolio)) {
        const currentPrice = stockPrices[symbol]?.price || holding.avgPrice;
        portfolioValue += holding.quantity * currentPrice;
    }

    return portfolioValue;
}

function updateDashboard() {
    // Refresh user data
    const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
    currentUser = users[currentUserEmail];

    // Update user name
    document.getElementById('user-name').textContent = currentUser.name.split(' ')[0];

    // Update simulation time
    const simDisplay = getSimulationDisplay();
    document.getElementById('sim-day').textContent = simDisplay.dayText;
    document.getElementById('sim-time').textContent = simDisplay.displayText;

    // Calculate values
    const portfolioValue = calculatePortfolioValue();
    const totalWorth = currentUser.balance + portfolioValue;
    const profitLoss = totalWorth - 100000;
    const profitLossPercent = ((profitLoss / 100000) * 100).toFixed(2);

    // Update summary cards
    document.getElementById('cash-balance').textContent = formatCurrency(currentUser.balance);
    document.getElementById('portfolio-value').textContent = formatCurrency(portfolioValue);
    document.getElementById('total-worth').textContent = formatCurrency(totalWorth);

    const profitLossElement = document.getElementById('profit-loss');
    const sign = profitLoss >= 0 ? '+' : '';
    const className = profitLoss >= 0 ? 'positive' : 'negative';
    profitLossElement.innerHTML = `
        <span class="${className}">${sign}₹${formatCurrency(Math.abs(profitLoss))}</span>
        <span style="font-size: 1rem; margin-left: 0.5rem;">(${sign}${profitLossPercent}%)</span>
    `;

    // Update holdings
    updateHoldings();

    // Update quick stats
    document.getElementById('total-trades').textContent = currentUser.transactions.length;
    document.getElementById('stocks-owned').textContent = Object.keys(currentUser.portfolio).length;
    document.getElementById('member-since').textContent = formatDate(currentUser.joinedDate);

    // Update transactions
    updateTransactions();
}

function updateHoldings() {
    const holdingsContainer = document.getElementById('holdings-container');
    const stockPrices = JSON.parse(localStorage.getItem('stocksim_prices') || '{}');

    if (Object.keys(currentUser.portfolio).length === 0) {
        holdingsContainer.innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                No holdings yet. Start by buying some stocks!
            </p>
        `;
        return;
    }

    let holdingsHTML = `
        <table class="holdings-table">
            <thead>
                <tr>
                    <th>Stock</th>
                    <th>Quantity</th>
                    <th>Avg. Price</th>
                    <th>Current Price</th>
                    <th>Total Value</th>
                    <th>P/L</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [symbol, holding] of Object.entries(currentUser.portfolio)) {
        const currentPrice = stockPrices[symbol]?.price || holding.avgPrice;
        const totalValue = holding.quantity * currentPrice;
        const totalCost = holding.quantity * holding.avgPrice;
        const profitLoss = totalValue - totalCost;
        const profitLossPercent = ((profitLoss / totalCost) * 100).toFixed(2);
        const plClass = profitLoss >= 0 ? 'positive' : 'negative';
        const sign = profitLoss >= 0 ? '+' : '';

        holdingsHTML += `
            <tr>
                <td>
                    <div class="stock-symbol">${symbol}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${stockPrices[symbol]?.name || 'Stock'}</div>
                </td>
                <td>${holding.quantity}</td>
                <td>₹${formatCurrency(holding.avgPrice)}</td>
                <td>₹${formatCurrency(currentPrice)}</td>
                <td>₹${formatCurrency(totalValue)}</td>
                <td class="${plClass}">${sign}₹${formatCurrency(Math.abs(profitLoss))} (${sign}${profitLossPercent}%)</td>
                <td>
                    <button class="trade-btn" style="padding: 0.5rem 1rem; width: auto;" onclick="sellStock('${symbol}')">Sell</button>
                </td>
            </tr>
        `;
    }

    holdingsHTML += `
            </tbody>
        </table>
    `;

    holdingsContainer.innerHTML = holdingsHTML;
}

function updateTransactions() {
    const transactionsContainer = document.getElementById('transactions-container');

    if (currentUser.transactions.length === 0) {
        transactionsContainer.innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                No transactions yet.
            </p>
        `;
        return;
    }

    let transactionsHTML = `
        <table class="holdings-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Stock</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Show last 10 transactions
    const recentTransactions = currentUser.transactions.slice(-10).reverse();

    for (const transaction of recentTransactions) {
        const typeClass = transaction.type === 'BUY' ? 'positive' : 'negative';
        const typeSymbol = transaction.type === 'BUY' ? '📈' : '📉';

        transactionsHTML += `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td class="${typeClass}">${typeSymbol} ${transaction.type}</td>
                <td class="stock-symbol">${transaction.symbol}</td>
                <td>${transaction.quantity}</td>
                <td>₹${formatCurrency(transaction.price)}</td>
                <td>₹${formatCurrency(transaction.total)}</td>
            </tr>
        `;
    }

    transactionsHTML += `
            </tbody>
        </table>
    `;

    transactionsContainer.innerHTML = transactionsHTML;
}

function sellStock(symbol) {
    window.location.href = `market.html?sell=${symbol}`;
}

// Load dashboard on page load
updateDashboard();

// Update every 5 seconds
setInterval(updateDashboard, 5000);
