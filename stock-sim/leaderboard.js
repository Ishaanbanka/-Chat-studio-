// Check if user is logged in
const currentUserEmail = localStorage.getItem('stocksim_currentUser');
if (!currentUserEmail) {
    window.location.href = 'auth.html';
}

function logout() {
    localStorage.removeItem('stocksim_currentUser');
    window.location.href = 'index.html';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

function calculatePortfolioValue(user) {
    let portfolioValue = 0;
    const stockPrices = getStockPrices();

    for (const [symbol, holding] of Object.entries(user.portfolio || {})) {
        const currentPrice = stockPrices[symbol]?.price || holding.avgPrice;
        portfolioValue += holding.quantity * currentPrice;
    }

    return portfolioValue;
}

function generateLeaderboard() {
    const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
    const leaderboardData = [];

    // Calculate portfolio values for all users
    for (const email in users) {
        const user = users[email];
        const portfolioValue = calculatePortfolioValue(user);
        const totalWorth = user.balance + portfolioValue;
        const profitLoss = totalWorth - 100000;
        const profitLossPercent = ((profitLoss / 100000) * 100).toFixed(2);

        leaderboardData.push({
            email: email,
            name: user.name,
            balance: user.balance,
            portfolioValue: portfolioValue,
            totalWorth: totalWorth,
            profitLoss: profitLoss,
            profitLossPercent: profitLossPercent,
            trades: user.transactions?.length || 0
        });
    }

    // Sort by total worth (descending)
    leaderboardData.sort((a, b) => b.totalWorth - a.totalWorth);

    return leaderboardData;
}

function displayLeaderboard() {
    const leaderboard = generateLeaderboard();
    const leaderboardBody = document.getElementById('leaderboard-body');

    if (leaderboard.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    No users yet. Be the first to start trading!
                </td>
            </tr>
        `;
        return;
    }

    let leaderboardHTML = '';

    leaderboard.forEach((user, index) => {
        const rank = index + 1;
        let rankBadgeClass = 'rank-badge';

        if (rank === 1) rankBadgeClass += ' gold';
        else if (rank === 2) rankBadgeClass += ' silver';
        else if (rank === 3) rankBadgeClass += ' bronze';

        const plClass = user.profitLoss >= 0 ? 'positive' : 'negative';
        const plSign = user.profitLoss >= 0 ? '+' : '';
        const isCurrentUser = user.email === currentUserEmail;
        const rowStyle = isCurrentUser ? 'background: var(--surface-light);' : '';

        leaderboardHTML += `
            <tr style="${rowStyle}">
                <td>
                    <span class="${rankBadgeClass}">${rank}</span>
                </td>
                <td>
                    <strong>${user.name}</strong>
                    ${isCurrentUser ? '<span style="color: var(--primary); margin-left: 0.5rem;">(You)</span>' : ''}
                </td>
                <td>₹${formatCurrency(user.portfolioValue)}</td>
                <td>₹${formatCurrency(user.balance)}</td>
                <td><strong>₹${formatCurrency(user.totalWorth)}</strong></td>
                <td class="${plClass}">
                    ${plSign}₹${formatCurrency(Math.abs(user.profitLoss))}
                    <br>
                    <span style="font-size: 0.875rem;">(${plSign}${user.profitLossPercent}%)</span>
                </td>
                <td>${user.trades}</td>
            </tr>
        `;
    });

    leaderboardBody.innerHTML = leaderboardHTML;

    // Update user rank card
    const userIndex = leaderboard.findIndex(u => u.email === currentUserEmail);
    if (userIndex !== -1) {
        const userData = leaderboard[userIndex];
        document.getElementById('user-rank').textContent = `#${userIndex + 1}`;
        document.getElementById('user-portfolio-value').textContent = formatCurrency(userData.totalWorth);

        const plSign = userData.profitLoss >= 0 ? '+' : '';
        const plClass = userData.profitLoss >= 0 ? 'positive' : 'negative';
        document.getElementById('user-pl').textContent = `${plSign}${userData.profitLossPercent}%`;
        document.getElementById('user-pl').className = plClass;
    }
}

// Initialize
displayLeaderboard();

// Update every 10 seconds
setInterval(displayLeaderboard, 10000);
