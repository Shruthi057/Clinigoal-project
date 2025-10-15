// src/utils/userTracking.js

// Track user login activity
export const trackUserLogin = (userData) => {
  try {
    const loginData = {
      id: Date.now(), // Unique ID based on timestamp
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      loginTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: Date.now(),
      type: 'login'
    };

    // Get existing user logs from localStorage
    const existingLogs = JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
    
    // Add new login to the beginning of the array
    const updatedLogs = [loginData, ...existingLogs];
    
    // Keep only last 100 logs to prevent localStorage from getting too large
    const trimmedLogs = updatedLogs.slice(0, 100);
    
    // Save back to localStorage
    localStorage.setItem('userLoginLogs', JSON.stringify(trimmedLogs));
    
    // Update unique users count
    updateUniqueUsersCount(userData.email);
    
    console.log('User login tracked:', loginData);
    return loginData;
  } catch (error) {
    console.error('Error tracking user login:', error);
    return null;
  }
};

// Update unique users count
const updateUniqueUsersCount = (email) => {
  try {
    const existingUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
    
    if (!existingUsers.includes(email)) {
      const updatedUsers = [...existingUsers, email];
      localStorage.setItem('uniqueUsers', JSON.stringify(updatedUsers));
    }
  } catch (error) {
    console.error('Error updating unique users count:', error);
  }
};

// Get user login logs
export const getUserLoginLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
  } catch (error) {
    console.error('Error getting user login logs:', error);
    return [];
  }
};

// Get unique users count
export const getUniqueUsersCount = () => {
  try {
    const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
    return uniqueUsers.length;
  } catch (error) {
    console.error('Error getting unique users count:', error);
    return 0;
  }
};

// Get today's login count
export const getTodayLoginCount = () => {
  try {
    const logs = getUserLoginLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.filter(log => new Date(log.timestamp) >= today).length;
  } catch (error) {
    console.error('Error getting today login count:', error);
    return 0;
  }
};

// Get user statistics
export const getUserStatistics = () => {
  try {
    const uniqueUsers = getUniqueUsersCount();
    const todayLogins = getTodayLoginCount();
    const totalLogins = getUserLoginLogs().length;
    
    return {
      uniqueUsers,
      todayLogins,
      totalLogins,
      averageLoginsPerUser: uniqueUsers > 0 ? (totalLogins / uniqueUsers).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return {
      uniqueUsers: 0,
      todayLogins: 0,
      totalLogins: 0,
      averageLoginsPerUser: 0
    };
  }
};

// Get time ago string
export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return time.toLocaleDateString();
};
