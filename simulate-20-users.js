/**
 * Simulates 20 users simultaneously:
 * 1. Register (or login if already exists)
 * 2. Enroll in the competition test (buyTest - free)
 * 3. Submit answers (submitGovCourseAnswer + calculateAllGovTestResult)
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: '/root/code-developement/samaj-education-portal-backend/.env' });

const BASE = 'http://localhost:7200/api/v1';
const TEST_ID = '6aef7696db7bfa074c031fce';

const User = require('/root/code-developement/samaj-education-portal-backend/models/user');
const BuyTest = require('/root/code-developement/samaj-education-portal-backend/models/buyschduleTest');
const ScheduleTest = require('/root/code-developement/samaj-education-portal-backend/models/testscheduled');

async function setupUsers() {
  const bcrypt = require('bcryptjs');
  const users = [];
  for (let i = 1; i <= 20; i++) {
    const email = `testuser${i}@panchaltest.com`;
    let user = await User.findOne({ email });
    if (!user) {
      const hash = await bcrypt.hash('Test@1234', 10);
      user = await User.create({
        name: `Test User ${i}`,
        email,
        password: hash,
        mobileNo: `98000000${String(i).padStart(2, '0')}`,
        studentType: 'student',
        examType: 'exam',
      });
      console.log(`  Created user ${i}: ${email}`);
    } else {
      console.log(`  User ${i} already exists: ${email}`);
    }
    users.push(user);
  }
  return users;
}

async function loginUser(email) {
  const res = await axios.post(`${BASE}/login`, {
    type: email,
    password: 'Test@1234',
  });
  return res.data?.token || res.data?.data?.token;
}

async function enrollUser(token, userId) {
  try {
    await axios.post(`${BASE}/buyTest`, {
      testId: TEST_ID,
      paymentstatus: true,
      amount: 0,
      walletBalance: 0,
    }, { headers: { Authorization: `Bearer ${token}` } });
  } catch (e) {
    // already enrolled or error — continue
  }
}

async function submitAnswers(token) {
  const test = await ScheduleTest.findById(TEST_ID);
  const questions = test.testSeries[0].topicQuestions;

  // Submit each answer
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const myAnswer = ['option1', 'option2', 'option3', 'option4'][i % 4]; // random answers
    try {
      await axios.post(`${BASE}/submitGovCourseAnswer`, {
        scheduleTestId: TEST_ID,
        questionId: q._id.toString(),
        selectedOption: myAnswer,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { /* continue */ }
  }

  // Calculate final result
  try {
    const res = await axios.post(`${BASE}/calculateAllGovTestResult`, {
      scheduleTestId: TEST_ID,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) {
    return { error: e.message };
  }
}

async function simulateUser(user, idx) {
  const start = Date.now();
  try {
    const token = await loginUser(user.email);
    if (!token) return { user: user.email, status: 'login_failed' };

    await enrollUser(token, user._id);
    const result = await submitAnswers(token);
    const duration = Date.now() - start;

    return {
      user: `User ${idx + 1}`,
      email: user.email,
      status: 'completed',
      score: result?.score ?? result?.data?.score ?? '?',
      duration: `${duration}ms`
    };
  } catch (e) {
    return { user: `User ${idx + 1}`, email: user.email, status: 'error', error: e.message };
  }
}

async function main() {
  console.log('\n🚀 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('\n👥 Setting up 20 test users...');
  const users = await setupUsers();

  console.log('\n⚡ Simulating all 20 users simultaneously...\n');
  const startAll = Date.now();

  // All 20 users at the SAME TIME
  const results = await Promise.all(users.map((u, i) => simulateUser(u, i)));

  const totalTime = Date.now() - startAll;

  console.log('\n📊 RESULTS:');
  console.log('─'.repeat(60));
  results.forEach(r => {
    const icon = r.status === 'completed' ? '✅' : '❌';
    console.log(`${icon} ${r.user} | Score: ${r.score ?? r.error} | Time: ${r.duration}`);
  });

  const passed = results.filter(r => r.status === 'completed').length;
  console.log('─'.repeat(60));
  console.log(`\n✅ Completed: ${passed}/20 users`);
  console.log(`⏱️  Total time: ${totalTime}ms`);

  await mongoose.disconnect();
}

main().catch(console.error);
