let isSignupMode = true;

// Check URL parameter
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('signup')) {
        isSignupMode = false;
        updateAuthMode();
    }
});

function toggleAuthMode(event) {
    event.preventDefault();
    isSignupMode = !isSignupMode;
    updateAuthMode();
}

function updateAuthMode() {
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('submit-btn');
    const switchText = document.getElementById('switch-text');
    const nameGroup = document.getElementById('name-group');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');

    if (isSignupMode) {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Start your trading journey with ₹1,00,000';
        submitBtn.textContent = 'Start Trading';
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode(event)">Login</a>';
        nameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
    } else {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Login to continue your trading journey';
        submitBtn.textContent = 'Login';
        switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode(event)">Sign Up</a>';
        nameGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
    }
}

function handleAuth(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isSignupMode) {
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
        if (users[email]) {
            alert('User already exists! Please login.');
            return;
        }

        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password,
            balance: 100000,
            portfolio: {},
            transactions: [],
            joinedDate: new Date().toISOString(),
            portfolioValue: 100000
        };

        users[email] = newUser;
        localStorage.setItem('stocksim_users', JSON.stringify(users));
        localStorage.setItem('stocksim_currentUser', email);

        alert(`Welcome ${name}! Your account has been created with ₹1,00,000`);
        window.location.href = 'dashboard.html';
    } else {
        // Login
        const users = JSON.parse(localStorage.getItem('stocksim_users') || '{}');
        const user = users[email];

        if (!user) {
            alert('User not found! Please sign up.');
            return;
        }

        if (user.password !== password) {
            alert('Incorrect password!');
            return;
        }

        localStorage.setItem('stocksim_currentUser', email);
        alert(`Welcome back, ${user.name}!`);
        window.location.href = 'dashboard.html';
    }
}
