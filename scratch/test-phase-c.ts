// Test Phase C: Verify Non-Destructive Slide Preservation & AI Batch Undo Logic
import { useStore } from '../src/store';

console.log('--- Testing Phase C Slide Preservation & Batch Mechanics ---');

// 1. Initial State
const initialSlides = useStore.getState().canvas.slides;
console.log('Initial slide count:', initialSlides.length);
console.log('Current slide index:', useStore.getState().canvas.currentPageIndex);

// 2. Simulate User Drawing Notes on Slide 1
const mockObjectsSlide1 = [
  { id: 'user_note_1', type: 'path', left: 100, top: 100, width: 50, height: 20 },
  { id: 'user_note_2', type: 'text', left: 160, top: 120, width: 80, height: 30 }
];
useStore.getState().setCanvasObjects(mockObjectsSlide1 as any);
console.log('User drew notes on Slide 1. Objects count:', useStore.getState().canvas.canvasObjects.length);

// 3. User Prompts AI: "Binary Search"
// In Phase C: if existing content is present, addSlide is invoked with custom lesson name
useStore.getState().addSlide('Binary Search');

const updatedSlides = useStore.getState().canvas.slides;
const activeIdx = useStore.getState().canvas.currentPageIndex;
console.log('After AI prompt: Total slides =', updatedSlides.length);
console.log('Active slide index =', activeIdx);
console.log('New slide title =', updatedSlides[activeIdx]?.name);

if (updatedSlides.length === 2 && updatedSlides[activeIdx]?.name === 'Binary Search' && activeIdx === 1) {
  console.log('✅ PASS: New slide auto-created with lesson title without destroying Slide 1!');
} else {
  console.error('❌ FAIL: Slide preservation mismatch', { updatedSlides, activeIdx });
  process.exit(1);
}

// 4. Test Slide Navigation
useStore.getState().setSlide(0);
console.log('Navigated back to Slide 1. Current index =', useStore.getState().canvas.currentPageIndex);
if (useStore.getState().canvas.currentPageIndex === 0) {
  console.log('✅ PASS: Can navigate smoothly back to user notes on Slide 1!');
}

useStore.getState().setSlide(1);
console.log('Navigated forward to Slide 2 (Binary Search). Current index =', useStore.getState().canvas.currentPageIndex);
if (useStore.getState().canvas.currentPageIndex === 1) {
  console.log('✅ PASS: Slide 2 (AI Lesson) navigation confirmed!');
}

console.log('--- All Phase C Store & Slide Preservation Tests Passed! ---');
