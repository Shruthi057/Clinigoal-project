// utils/courseAnalytics.js
import Course from '../models/Course.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import CourseAccess from '../models/CourseAccess.js';

export class CourseAnalytics {
  // Get total students enrolled in a course
  static async getCourseEnrollments(courseId) {
    return await User.countDocuments({
      'enrolledCourses.courseId': courseId
    });
  }

  // Get currently active students (logged in today)
  static async getActiveStudents(courseId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await CourseAccess.distinct('studentId', {
      courseId: courseId,
      createdAt: { $gte: today }
    });
  }

  // Get course reviews with student details
  static async getCourseReviews(courseId) {
    return await Review.find({ courseId })
      .populate('studentId', 'name email profile.avatar')
      .sort({ createdAt: -1 });
  }

  // Get student progress in a course
  static async getStudentProgress(courseId, studentId) {
    const user = await User.findOne({
      _id: studentId,
      'enrolledCourses.courseId': courseId
    });
    
    if (!user) return null;
    
    const enrolledCourse = user.enrolledCourses.find(
      course => course.courseId.toString() === courseId.toString()
    );
    
    return enrolledCourse;
  }

  // Get course statistics
  static async getCourseStats(courseId) {
    const totalStudents = await this.getCourseEnrollments(courseId);
    const activeStudents = await this.getActiveStudents(courseId);
    const reviews = await Review.find({ courseId });
    
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return {
      totalStudents,
      activeStudents: activeStudents.length,
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }
}
