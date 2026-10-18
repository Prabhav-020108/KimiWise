import { useStore } from '../src/store';

console.log('--- Testing Phase F: Quiz Scores & Teacher Analytics Integration ---');

const store = useStore.getState();

// 1. Initial State Checks
console.log('1. Checking initial store state...');
const initialStudents = store.teacher.students;
console.log(`Found ${initialStudents.length} initial students.`);
if (initialStudents.length < 5) {
  throw new Error(`Expected at least 5 students, got ${initialStudents.length}`);
}

const aarav = initialStudents.find((s) => s.id === 's1');
if (!aarav) throw new Error('Student s1 (Aarav Sharma) not found.');
console.log(`Initial Aarav score: ${aarav.avgScore}%, quizzes: ${aarav.quizzesCompleted}`);

// 2. Submit high-scoring quiz for Aarav (100% on Graph Algorithms)
console.log('\n2. Simulating 100% quiz submission for Aarav on "Graph Algorithms"...');
const sub1 = store.recordQuizSubmission({
  studentId: 's1',
  studentName: 'Aarav Sharma',
  quizTitle: 'Graph Algorithms & Trees Quiz',
  topic: 'Graph Algorithms',
  scorePercent: 100,
  correctCount: 5,
  totalQuestions: 5,
});

console.log('Submission record 1 created:', sub1);
const stateAfterSub1 = useStore.getState();
const updatedAarav = stateAfterSub1.teacher.students.find((s) => s.id === 's1')!;
console.log(`Updated Aarav: avgScore=${updatedAarav.avgScore}%, quizzesCompleted=${updatedAarav.quizzesCompleted}`);
console.log('Aarav strengths:', updatedAarav.strengths);
console.log('Aarav areasToImprove:', updatedAarav.areasToImprove);

if (!updatedAarav.strengths?.includes('Graph Algorithms')) {
  throw new Error('Graph Algorithms was not added to strengths!');
}
if (updatedAarav.quizzesCompleted !== 7) {
  throw new Error(`Expected 7 quizzes, got ${updatedAarav.quizzesCompleted}`);
}

// 3. Submit low-scoring quiz for Rohan (40% on Recursion)
console.log('\n3. Simulating 40% quiz submission for Rohan on "Recursion"...');
const sub2 = store.recordQuizSubmission({
  studentId: 's3',
  studentName: 'Rohan Verma',
  quizTitle: 'Recursion Depth & Stack Frames',
  topic: 'Recursion Depth',
  scorePercent: 40,
  correctCount: 2,
  totalQuestions: 5,
});

const stateAfterSub2 = useStore.getState();
const updatedRohan = stateAfterSub2.teacher.students.find((s) => s.id === 's3')!;
console.log(`Updated Rohan: avgScore=${updatedRohan.avgScore}%, quizzesCompleted=${updatedRohan.quizzesCompleted}`);
console.log('Rohan areasToImprove:', updatedRohan.areasToImprove);

if (!updatedRohan.areasToImprove?.includes('Recursion Depth')) {
  throw new Error('Recursion Depth was not added to areasToImprove!');
}

// 4. Verify Teacher Submissions Stream
console.log('\n4. Verifying Teacher Submissions Stream...');
const submissions = stateAfterSub2.teacher.recentSubmissions;
console.log(`Recorded submissions in feed: ${submissions.length}`);
if (submissions.length < 2) {
  throw new Error(`Expected at least 2 submissions in feed, got ${submissions.length}`);
}
console.log('Latest submission in feed:', submissions[0]);

// 5. Verify Gemma Teacher Insights
console.log('\n5. Verifying Teacher Insights...');
const insights = stateAfterSub2.teacher.insights;
console.log(`Total insights: ${insights.length}`);
console.log('Top insight:', insights[0]);
if (!insights[0].message.includes('Rohan Verma')) {
  throw new Error('Expected latest insight to reference Rohan Verma');
}

console.log('\n✅ ALL PHASE F TESTS PASSED SUCCESSFULLY!');
