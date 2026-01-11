// Time Simulation Engine
// 1 real week = 1 simulation month (4 weeks simulation time)
// This means every ~1.75 real days = 1 simulation week

const REAL_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SIM_WEEKS_PER_REAL_WEEK = 4; // 1 real week = 4 simulation weeks (1 month)

function initializeSimulation() {
    const simulation = localStorage.getItem('stocksim_simulation');

    if (!simulation) {
        const newSimulation = {
            startDate: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            day: 1,
            week: 1,
            month: 1,
            year: 1
        };
        localStorage.setItem('stocksim_simulation', JSON.stringify(newSimulation));
    }
}

function getSimulationTime() {
    initializeSimulation();
    return JSON.parse(localStorage.getItem('stocksim_simulation'));
}

function updateSimulationTime() {
    const simulation = getSimulationTime();
    const now = new Date();
    const lastUpdate = new Date(simulation.lastUpdate);
    const startDate = new Date(simulation.startDate);

    // Calculate elapsed real time in milliseconds
    const elapsedRealTime = now - startDate;

    // Calculate simulation time
    // 1 real week = 4 simulation weeks
    const realWeeksElapsed = elapsedRealTime / REAL_WEEK_MS;
    const simWeeksElapsed = Math.floor(realWeeksElapsed * SIM_WEEKS_PER_REAL_WEEK);
    const simDaysElapsed = Math.floor(simWeeksElapsed * 7);

    // Update simulation values
    simulation.day = (simDaysElapsed % 7) + 1; // 1-7
    simulation.week = (simWeeksElapsed % 4) + 1; // 1-4
    simulation.month = Math.floor(simWeeksElapsed / 4) + 1;
    simulation.year = Math.floor(simulation.month / 12) + 1;
    simulation.month = ((simulation.month - 1) % 12) + 1; // 1-12

    // Check if we need to update stock prices (once per simulation week)
    const timeSinceLastUpdate = now - lastUpdate;
    const realDaysPerSimWeek = 7 / SIM_WEEKS_PER_REAL_WEEK; // ~1.75 days
    const msPerSimWeek = realDaysPerSimWeek * 24 * 60 * 60 * 1000;

    if (timeSinceLastUpdate >= msPerSimWeek) {
        // Update stock prices
        simulateStockPriceChange();
        simulation.lastUpdate = now.toISOString();

        // Notify users of weekly update
        console.log('📊 Weekly stock prices updated!');
    }

    localStorage.setItem('stocksim_simulation', JSON.stringify(simulation));
    return simulation;
}

function getSimulationDisplay() {
    const sim = updateSimulationTime();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[sim.month - 1];

    return {
        day: sim.day,
        week: sim.week,
        month: sim.month,
        monthName: monthName,
        year: sim.year,
        displayText: `Week ${sim.week}, ${monthName} Y${sim.year}`,
        dayText: `Day ${sim.day}`
    };
}

function getTimeUntilNextUpdate() {
    const simulation = getSimulationTime();
    const now = new Date();
    const lastUpdate = new Date(simulation.lastUpdate);

    const realDaysPerSimWeek = 7 / SIM_WEEKS_PER_REAL_WEEK; // ~1.75 days
    const msPerSimWeek = realDaysPerSimWeek * 24 * 60 * 60 * 1000;

    const timeSinceLastUpdate = now - lastUpdate;
    const timeUntilNext = msPerSimWeek - timeSinceLastUpdate;

    if (timeUntilNext <= 0) {
        updateSimulationTime();
        return getTimeUntilNextUpdate();
    }

    const hours = Math.floor(timeUntilNext / (60 * 60 * 1000));
    const minutes = Math.floor((timeUntilNext % (60 * 60 * 1000)) / (60 * 1000));

    return {
        ms: timeUntilNext,
        hours: hours,
        minutes: minutes,
        display: `${hours}h ${minutes}m`
    };
}

// Initialize simulation on load
initializeSimulation();

// Update simulation every minute
setInterval(() => {
    updateSimulationTime();
}, 60 * 1000);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getSimulationTime,
        updateSimulationTime,
        getSimulationDisplay,
        getTimeUntilNextUpdate
    };
}
