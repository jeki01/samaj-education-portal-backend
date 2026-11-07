require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('./models/admin');
const ExamType = require('./models/examtype');
const Subject = require('./models/subject');
const GovernmentCourse = require('./models/governmentcourse');
const User = require('./models/user');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  // Get admin
  const admin = await Admin.findOne({ email: 'wagareducation@gmail.com' });
  if (!admin) { console.error('Admin not found. Run register first.'); process.exit(1); }

  // --- ExamTypes (category) ---
  const categories = await ExamType.insertMany([
    { name: 'Government Exams', type: 'category', createdBy: admin._id },
    { name: 'Skill Courses', type: 'category', createdBy: admin._id },
  ]);
  const govCat = categories[0];
  const skillCat = categories[1];

  // --- ExamTypes (subcategory) ---
  const subcategories = await ExamType.insertMany([
    { name: 'SSC', type: 'subcategory', parent: govCat._id, createdBy: admin._id },
    { name: 'Banking', type: 'subcategory', parent: govCat._id, createdBy: admin._id },
    { name: 'Railway', type: 'subcategory', parent: govCat._id, createdBy: admin._id },
    { name: 'Computer', type: 'subcategory', parent: skillCat._id, createdBy: admin._id },
    { name: 'Communication', type: 'subcategory', parent: skillCat._id, createdBy: admin._id },
  ]);
  const sscSub = subcategories[0];
  const bankSub = subcategories[1];
  const railSub = subcategories[2];

  // --- Subjects ---
  const subjects = await Subject.insertMany([
    { category: govCat._id, subcategory: sscSub._id, name: 'General Knowledge', createdBy: admin._id },
    { category: govCat._id, subcategory: sscSub._id, name: 'Mathematics', createdBy: admin._id },
    { category: govCat._id, subcategory: sscSub._id, name: 'English', createdBy: admin._id },
    { category: govCat._id, subcategory: bankSub._id, name: 'Reasoning', createdBy: admin._id },
    { category: govCat._id, subcategory: bankSub._id, name: 'Quantitative Aptitude', createdBy: admin._id },
    { category: govCat._id, subcategory: railSub._id, name: 'General Science', createdBy: admin._id },
  ]);

  // --- Government Courses ---
  await GovernmentCourse.insertMany([
    {
      category: govCat._id,
      subcategory: sscSub._id,
      subject: subjects[0]._id,
      courseName: 'SSC CGL Complete Course 2024',
      courseDescription: 'Complete preparation course for SSC CGL exam covering all subjects.',
      coursePrice: 999,
      courseValidity: 365,
      maximumMark: 200,
      negativeMark: 0.5,
      ebookPercentage: 30,
      notePercentage: 20,
      videoPercentage: 30,
      testPercentage: 20,
      ebookPrice: 199,
      notePrice: 149,
      videoPrice: 499,
      testPrice: 299,
      categoryType: 'Subject',
      expireDate: '2025-12-31',
      status: 'Active',
      videoLectures: [
        { videoLectureName: 'Introduction to SSC CGL', videoLectureLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { videoLectureName: 'Number System Basics', videoLectureLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { videoLectureName: 'English Grammar Fundamentals', videoLectureLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ],
      testSeries: [
        {
          topicName: 'General Knowledge Mock Test 1',
          topicQuestions: [
            { question: 'Who is the President of India?', option1: 'Droupadi Murmu', option2: 'Ram Nath Kovind', option3: 'Pranab Mukherjee', option4: 'APJ Abdul Kalam', answer: 'Droupadi Murmu' },
            { question: 'What is the capital of India?', option1: 'Mumbai', option2: 'Kolkata', option3: 'New Delhi', option4: 'Chennai', answer: 'New Delhi' },
            { question: 'Which planet is closest to the Sun?', option1: 'Venus', option2: 'Mercury', option3: 'Earth', option4: 'Mars', answer: 'Mercury' },
          ]
        },
        {
          topicName: 'Mathematics Mock Test 1',
          topicQuestions: [
            { question: 'What is 15% of 200?', option1: '25', option2: '30', option3: '35', option4: '40', answer: '30' },
            { question: 'If 2x + 5 = 15, what is x?', option1: '3', option2: '4', option3: '5', option4: '6', answer: '5' },
          ]
        }
      ],
      createdBy: admin._id,
    },
    {
      category: govCat._id,
      subcategory: bankSub._id,
      subject: subjects[3]._id,
      courseName: 'IBPS PO Banking Course 2024',
      courseDescription: 'Comprehensive course for IBPS PO, SBI PO and other banking exams.',
      coursePrice: 1299,
      courseValidity: 365,
      maximumMark: 100,
      negativeMark: 0.25,
      ebookPercentage: 25,
      notePercentage: 25,
      videoPercentage: 25,
      testPercentage: 25,
      ebookPrice: 249,
      notePrice: 199,
      videoPrice: 599,
      testPrice: 399,
      categoryType: 'Subject',
      expireDate: '2025-12-31',
      status: 'Active',
      videoLectures: [
        { videoLectureName: 'Banking Awareness Overview', videoLectureLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { videoLectureName: 'Reasoning Shortcuts', videoLectureLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ],
      testSeries: [
        {
          topicName: 'Reasoning Practice Test',
          topicQuestions: [
            { question: 'If A is to the north of B, and C is to the east of B, then A is in which direction of C?', option1: 'North-West', option2: 'North-East', option3: 'South-East', option4: 'South-West', answer: 'North-West' },
          ]
        }
      ],
      createdBy: admin._id,
    },
    {
      category: govCat._id,
      subcategory: railSub._id,
      subject: subjects[5]._id,
      courseName: 'Railway RRB NTPC 2024',
      courseDescription: 'Full preparation package for RRB NTPC Group D exam.',
      coursePrice: 799,
      courseValidity: 180,
      maximumMark: 100,
      negativeMark: 0.33,
      ebookPercentage: 30,
      notePercentage: 30,
      videoPercentage: 20,
      testPercentage: 20,
      ebookPrice: 149,
      notePrice: 99,
      videoPrice: 349,
      testPrice: 199,
      categoryType: 'Syllabus',
      expireDate: '2025-06-30',
      status: 'Active',
      videoLectures: [
        { videoLectureName: 'General Science Chapter 1', videoLectureLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      ],
      testSeries: [],
      createdBy: admin._id,
    },
  ]);

  // --- Users ---
  const salt = await bcrypt.genSalt(10);
  await User.insertMany([
    { email: 'rahul.sharma@example.com', mobileNo: '9876543210', password: await bcrypt.hash('User@1234', salt), studentType: 'Regular', examType: 'exam', firstName: 'Rahul', lastName: 'Sharma', city: 'Delhi', state: 'Delhi' },
    { email: 'priya.patel@example.com', mobileNo: '9876543211', password: await bcrypt.hash('User@1234', salt), studentType: 'Regular', examType: 'exam', firstName: 'Priya', lastName: 'Patel', city: 'Ahmedabad', state: 'Gujarat' },
    { email: 'amit.verma@example.com', mobileNo: '9876543212', password: await bcrypt.hash('User@1234', salt), studentType: 'Regular', examType: 'skills', firstName: 'Amit', lastName: 'Verma', city: 'Lucknow', state: 'Uttar Pradesh' },
    { email: 'sneha.joshi@example.com', mobileNo: '9876543213', password: await bcrypt.hash('User@1234', salt), studentType: 'Regular', examType: 'exam', firstName: 'Sneha', lastName: 'Joshi', city: 'Pune', state: 'Maharashtra' },
    { email: 'ravi.kumar@example.com', mobileNo: '9876543214', password: await bcrypt.hash('User@1234', salt), studentType: 'Regular', examType: 'skills', firstName: 'Ravi', lastName: 'Kumar', city: 'Jaipur', state: 'Rajasthan' },
  ]);

  console.log('✅ Seed complete!');
  console.log('  - 2 Exam Categories');
  console.log('  - 5 Subcategories (SSC, Banking, Railway, Computer, Communication)');
  console.log('  - 6 Subjects');
  console.log('  - 3 Government Courses (SSC CGL, IBPS PO, RRB NTPC)');
  console.log('  - 5 Users');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
