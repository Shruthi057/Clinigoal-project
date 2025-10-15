// src/utils/userTracking.js
// Enhanced User Tracking Utility for Clinigoal

// Track user login activity
export const trackUserLogin = (userData) => {
  try {
    const loginData = {
      id: Date.now(), // Unique ID based on timestamp
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      userId: userData.userId || userData.email,
      loginTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: Date.now(),
      type: 'login',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`
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
    
    // Track session start
    startUserSession(userData);
    
    console.log('✅ User login tracked:', loginData);
    return loginData;
  } catch (error) {
    console.error('❌ Error tracking user login:', error);
    return null;
  }
};

// Track user logout
export const trackUserLogout = (userData) => {
  try {
    const logoutData = {
      id: Date.now(),
      email: userData?.email,
      name: userData?.name,
      userId: userData?.userId || userData?.email,
      logoutTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: Date.now(),
      type: 'logout'
    };

    // Get existing logout logs
    const existingLogs = JSON.parse(localStorage.getItem('userLogoutLogs') || '[]');
    const updatedLogs = [logoutData, ...existingLogs].slice(0, 100);
    
    localStorage.setItem('userLogoutLogs', JSON.stringify(updatedLogs));
    
    // End user session
    endUserSession(userData);
    
    console.log('✅ User logout tracked:', logoutData);
    return logoutData;
  } catch (error) {
    console.error('❌ Error tracking user logout:', error);
    return null;
  }
};

// Start user session
const startUserSession = (userData) => {
  try {
    const sessionData = {
      sessionId: `session_${Date.now()}`,
      userId: userData.userId || userData.email,
      email: userData.email,
      startTime: new Date().toISOString(),
      startTimestamp: Date.now(),
      userAgent: navigator.userAgent
    };
    
    localStorage.setItem('currentSession', JSON.stringify(sessionData));
    
    // Add to session history
    const sessionHistory = JSON.parse(localStorage.getItem('userSessions') || '[]');
    sessionHistory.unshift(sessionData);
    localStorage.setItem('userSessions', JSON.stringify(sessionHistory.slice(0, 50)));
    
  } catch (error) {
    console.error('❌ Error starting user session:', error);
  }
};

// End user session
const endUserSession = (userData) => {
  try {
    const currentSession = JSON.parse(localStorage.getItem('currentSession') || '{}');
    if (currentSession.sessionId) {
      const sessionEndTime = Date.now();
      const sessionDuration = sessionEndTime - currentSession.startTimestamp;
      
      const endedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        endTimestamp: sessionEndTime,
        duration: sessionDuration,
        durationFormatted: formatDuration(sessionDuration)
      };
      
      // Update session in history
      const sessionHistory = JSON.parse(localStorage.getItem('userSessions') || '[]');
      const sessionIndex = sessionHistory.findIndex(s => s.sessionId === currentSession.sessionId);
      if (sessionIndex !== -1) {
        sessionHistory[sessionIndex] = endedSession;
        localStorage.setItem('userSessions', JSON.stringify(sessionHistory));
      }
      
      localStorage.removeItem('currentSession');
    }
  } catch (error) {
    console.error('❌ Error ending user session:', error);
  }
};

// Format duration in milliseconds to readable format
const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
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
    console.error('❌ Error updating unique users count:', error);
  }
};

// Track page views
export const trackPageView = (pageName, additionalData = {}) => {
  try {
    const pageViewData = {
      id: Date.now(),
      page: pageName,
      timestamp: Date.now(),
      viewTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      type: 'page_view',
      ...additionalData
    };

    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    const updatedViews = [pageViewData, ...pageViews].slice(0, 200);
    
    localStorage.setItem('pageViews', JSON.stringify(updatedViews));
    
    console.log('📊 Page view tracked:', pageViewData);
    return pageViewData;
  } catch (error) {
    console.error('❌ Error tracking page view:', error);
    return null;
  }
};

// Track user actions (button clicks, form submissions, etc.)
export const trackUserAction = (action, details = {}) => {
  try {
    const actionData = {
      id: Date.now(),
      action,
      timestamp: Date.now(),
      actionTime: new Date().toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      type: 'user_action',
      ...details
    };

    const userActions = JSON.parse(localStorage.getItem('userActions') || '[]');
    const updatedActions = [actionData, ...userActions].slice(0, 300);
    
    localStorage.setItem('userActions', JSON.stringify(updatedActions));
    
    console.log('🎯 User action tracked:', actionData);
    return actionData;
  } catch (error) {
    console.error('❌ Error tracking user action:', error);
    return null;
  }
};

// Track course progress and interactions
export const trackCourseProgress = (courseId, progress, action, details = {}) => {
  try {
    const progressData = {
      id: Date.now(),
      courseId,
      progress,
      action,
      timestamp: Date.now(),
      progressTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'course_progress',
      ...details
    };

    const courseProgress = JSON.parse(localStorage.getItem('courseProgress') || '[]');
    const updatedProgress = [progressData, ...courseProgress].slice(0, 200);
    
    localStorage.setItem('courseProgress', JSON.stringify(updatedProgress));
    
    console.log('📚 Course progress tracked:', progressData);
    return progressData;
  } catch (error) {
    console.error('❌ Error tracking course progress:', error);
    return null;
  }
};

// Track payment activities
export const trackPayment = (paymentData) => {
  try {
    const paymentTrackData = {
      id: Date.now(),
      timestamp: Date.now(),
      paymentTime: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'payment',
      ...paymentData
    };

    const payments = JSON.parse(localStorage.getItem('paymentTracking') || '[]');
    const updatedPayments = [paymentTrackData, ...payments].slice(0, 100);
    
    localStorage.setItem('paymentTracking', JSON.stringify(updatedPayments));
    
    console.log('💰 Payment tracked:', paymentTrackData);
    return paymentTrackData;
  } catch (error) {
    console.error('❌ Error tracking payment:', error);
    return null;
  }
};

// Get user login logs
export const getUserLoginLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('userLoginLogs') || '[]');
  } catch (error) {
    console.error('❌ Error getting user login logs:', error);
    return [];
  }
};

// Get user logout logs
export const getUserLogoutLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('userLogoutLogs') || '[]');
  } catch (error) {
    console.error('❌ Error getting user logout logs:', error);
    return [];
  }
};

// Get unique users count
export const getUniqueUsersCount = () => {
  try {
    const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers') || '[]');
    return uniqueUsers.length;
  } catch (error) {
    console.error('❌ Error getting unique users count:', error);
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
    console.error('❌ Error getting today login count:', error);
    return 0;
  }
};

// Get page views statistics
export const getPageViewStats = () => {
  try {
    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayViews = pageViews.filter(view => new Date(view.timestamp) >= today);
    const totalViews = pageViews.length;
    
    // Group by page
    const viewsByPage = pageViews.reduce((acc, view) => {
      acc[view.page] = (acc[view.page] || 0) + 1;
      return acc;
    }, {});
    
    return {
      todayViews: todayViews.length,
      totalViews,
      viewsByPage,
      popularPages: Object.entries(viewsByPage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  } catch (error) {
    console.error('❌ Error getting page view stats:', error);
    return {
      todayViews: 0,
      totalViews: 0,
      viewsByPage: {},
      popularPages: []
    };
  }
};

// Get user action statistics
export const getUserActionStats = () => {
  try {
    const userActions = JSON.parse(localStorage.getItem('userActions') || '[]');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActions = userActions.filter(action => new Date(action.timestamp) >= today);
    const totalActions = userActions.length;
    
    // Group by action type
    const actionsByType = userActions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {});
    
    return {
      todayActions: todayActions.length,
      totalActions,
      actionsByType,
      popularActions: Object.entries(actionsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  } catch (error) {
    console.error('❌ Error getting user action stats:', error);
    return {
      todayActions: 0,
      totalActions: 0,
      actionsByType: {},
      popularActions: []
    };
  }
};

// Get course progress statistics
export const getCourseProgressStats = () => {
  try {
    const courseProgress = JSON.parse(localStorage.getItem('courseProgress') || '[]');
    
    const progressByCourse = courseProgress.reduce((acc, progress) => {
      if (!acc[progress.courseId]) {
        acc[progress.courseId] = {
          courseId: progress.courseId,
          totalActions: 0,
          actions: [],
          lastActivity: progress.timestamp
        };
      }
      acc[progress.courseId].totalActions++;
      acc[progress.courseId].actions.push(progress);
      if (progress.timestamp > acc[progress.courseId].lastActivity) {
        acc[progress.courseId].lastActivity = progress.timestamp;
      }
      return acc;
    }, {});
    
    return {
      totalCourseActivities: courseProgress.length,
      progressByCourse,
      activeCourses: Object.values(progressByCourse)
        .sort((a, b) => b.totalActions - a.totalActions)
        .slice(0, 10)
    };
  } catch (error) {
    console.error('❌ Error getting course progress stats:', error);
    return {
      totalCourseActivities: 0,
      progressByCourse: {},
      activeCourses: []
    };
  }
};

// Get comprehensive user statistics
export const getUserStatistics = () => {
  try {
    const uniqueUsers = getUniqueUsersCount();
    const todayLogins = getTodayLoginCount();
    const totalLogins = getUserLoginLogs().length;
    const pageStats = getPageViewStats();
    const actionStats = getUserActionStats();
    const courseStats = getCourseProgressStats();
    
    return {
      // User metrics
      uniqueUsers,
      todayLogins,
      totalLogins,
      averageLoginsPerUser: uniqueUsers > 0 ? (totalLogins / uniqueUsers).toFixed(2) : 0,
      
      // Engagement metrics
      ...pageStats,
      ...actionStats,
      ...courseStats,
      
      // Session data
      currentSession: JSON.parse(localStorage.getItem('currentSession') || 'null'),
      totalSessions: JSON.parse(localStorage.getItem('userSessions') || '[]').length,
      
      // Timestamp
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting user statistics:', error);
    return {
      uniqueUsers: 0,
      todayLogins: 0,
      totalLogins: 0,
      averageLoginsPerUser: 0,
      todayViews: 0,
      totalViews: 0,
      todayActions: 0,
      totalActions: 0,
      totalCourseActivities: 0,
      currentSession: null,
      totalSessions: 0,
      lastUpdated: new Date().toISOString()
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

// Clear all tracking data (for testing or privacy)
export const clearTrackingData = () => {
  try {
    const keysToRemove = [
      'userLoginLogs',
      'userLogoutLogs',
      'uniqueUsers',
      'pageViews',
      'userActions',
      'courseProgress',
      'paymentTracking',
      'currentSession',
      'userSessions'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('🧹 All tracking data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing tracking data:', error);
    return false;
  }
};

// Export all functions
export default {
  trackUserLogin,
  trackUserLogout,
  trackPageView,
  trackUserAction,
  trackCourseProgress,
  trackPayment,
  getUserLoginLogs,
  getUserLogoutLogs,
  getUniqueUsersCount,
  getTodayLoginCount,
  getPageViewStats,
  getUserActionStats,
  getCourseProgressStats,
  getUserStatistics,
  getTimeAgo,
  clearTrackingData
};