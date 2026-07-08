/**
 * Example usage and test scenarios for the Remotion Agent
 */

import { RemotionAgent } from './agent.js';
import { recognizeIntent, extractAssets, extractEffects } from './intent-recognition.js';
import { getAllSkills, findSkill } from './skills.js';
import { validateAsset, parseDuration, formatDuration } from './tools.js';

// Example 1: Basic conversation flow
async function example1_BasicConversation() {
  console.log('\n📝 Example 1: Basic Conversation Flow\n');

  const agent = new RemotionAgent('demo-session-1');

  // User wants to create a simple video
  const response1 = await agent.processMessage(
    'Create a 5-second video with a fade in effect'
  );

  console.log('Response:', response1.message);
  console.log('Needs Confirmation:', response1.needsConfirmation);

  if (response1.composition) {
    console.log('Composition ID:', response1.composition.id);
    console.log('Duration:', response1.composition.durationInFrames, 'frames');
  }
}

// Example 2: Intent recognition
async function example2_IntentRecognition() {
  console.log('\n📝 Example 2: Intent Recognition\n');

  const testMessages = [
    'Create a video with my vacation photos',
    'Add a zoom effect to the first clip',
    'Apply blur to the background',
    'Show me a preview',
    'Add a crossfade transition',
  ];

  for (const message of testMessages) {
    const intent = await recognizeIntent(message);
    console.log(`Message: "${message}"`);
    console.log(`  Type: ${intent.type}`);
    console.log(`  Confidence: ${intent.confidence.toFixed(2)}`);
    console.log(`  Effects: ${intent.entities.effects?.join(', ') || 'none'}`);
    console.log();
  }
}

// Example 3: Asset extraction
function example3_AssetExtraction() {
  console.log('\n📝 Example 3: Asset Extraction\n');

  const messages = [
    'Use ./images/photo1.jpg and ./images/photo2.png',
    'Load video from https://example.com/video.mp4',
    'Add "background.mp3" as background music',
  ];

  for (const message of messages) {
    const assets = extractAssets(message);
    console.log(`Message: "${message}"`);
    console.log(`  Assets found: ${assets.join(', ') || 'none'}`);
    console.log();
  }
}

// Example 4: Effect extraction
function example4_EffectExtraction() {
  console.log('\n📝 Example 4: Effect Extraction\n');

  const messages = [
    'Add fade in and zoom effects',
    'Make it blur and rotate',
    'Apply brightness and contrast adjustments',
    'Create a grayscale look with high saturation', // Contradictory
  ];

  for (const message of messages) {
    const effects = extractEffects(message);
    console.log(`Message: "${message}"`);
    console.log(`  Effects: ${effects.join(', ') || 'none'}`);
    console.log();
  }
}

// Example 5: Skills showcase
function example5_SkillsShowcase() {
  console.log('\n📝 Example 5: Available Skills\n');

  const skills = getAllSkills();
  const categories = [...new Set(skills.map(s => s.category))];

  for (const category of categories) {
    console.log(`\n${category.toUpperCase()}:`);
    const categorySkills = skills.filter(s => s.category === category);

    for (const skill of categorySkills) {
      console.log(`  • ${skill.name}: ${skill.description}`);
      console.log(`    Parameters: ${skill.parameters.map(p => p.name).join(', ')}`);
    }
  }
}

// Example 6: Duration parsing
function example6_DurationParsing() {
  console.log('\n📝 Example 6: Duration Parsing\n');

  const fps = 30;
  const durations = ['5s', '1m 30s', '500ms', '120f', '2.5'];

  for (const duration of durations) {
    const frames = parseDuration(duration, fps);
    const formatted = formatDuration(frames, fps);
    console.log(`Input: "${duration}" → ${frames} frames → ${formatted}`);
  }
}

// Example 7: Skill execution
function example7_SkillExecution() {
  console.log('\n📝 Example 7: Skill Execution\n');

  const fadeInSkill = findSkill('fade-in');
  if (fadeInSkill) {
    const effect = fadeInSkill.execute({ duration: 45, delay: 10 });
    console.log('Fade In Effect:', JSON.stringify(effect, null, 2));
  }

  const zoomSkill = findSkill('zoom-in');
  if (zoomSkill) {
    const effect = zoomSkill.execute({ from: 0.5, to: 1.5, duration: 60 });
    console.log('\nZoom Effect:', JSON.stringify(effect, null, 2));
  }
}

// Example 8: Multi-turn conversation
async function example8_MultiTurnConversation() {
  console.log('\n📝 Example 8: Multi-turn Conversation\n');

  const agent = new RemotionAgent('demo-session-8');

  const turns = [
    'Create a video for Instagram',
    'Make it 10 seconds long',
    'Add a fade in at the start',
    'Also add a zoom effect',
    'Show me the preview',
  ];

  for (const [i, message] of turns.entries()) {
    console.log(`\nTurn ${i + 1}: "${message}"`);
    const response = await agent.processMessage(message);
    console.log(`Response: ${response.message.substring(0, 100)}...`);
  }

  // Show conversation history
  const context = agent.getContext();
  console.log(`\nTotal conversation turns: ${context.conversationHistory.length}`);
}

// Example 9: Error handling
async function example9_ErrorHandling() {
  console.log('\n📝 Example 9: Error Handling\n');

  const agent = new RemotionAgent('demo-session-9');

  // Ambiguous request
  const response1 = await agent.processMessage('Do something with video');
  console.log('Ambiguous request:');
  console.log('  Needs confirmation:', response1.needsConfirmation);
  console.log('  Clarifications:', response1.clarifications);

  // Missing assets
  const response2 = await agent.processMessage('Apply effects');
  console.log('\nMissing assets:');
  console.log('  Needs confirmation:', response2.needsConfirmation);
}

// Example 10: Performance metrics
async function example10_Metrics() {
  console.log('\n📝 Example 10: Performance Metrics\n');

  const agent = new RemotionAgent('demo-session-10');

  // Perform several operations
  await agent.processMessage('Create a video');
  await agent.processMessage('Add fade effect');
  await agent.processMessage('Preview');

  const metrics = agent.getMetrics();

  console.log('Agent Metrics:');
  Object.entries(metrics).forEach(([module, data]) => {
    console.log(`\n${module}:`);
    console.log(`  Total Requests: ${data.requestCount}`);
    console.log(`  Success Rate: ${((data.successCount / data.requestCount) * 100).toFixed(1)}%`);
    console.log(`  Avg Response Time: ${data.avgResponseTime.toFixed(2)}ms`);
  });
}

// Run all examples
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Remotion Agent - Example Scenarios          ║');
  console.log('╚════════════════════════════════════════════════╝');

  try {
    // Non-async examples
    example3_AssetExtraction();
    example4_EffectExtraction();
    example5_SkillsShowcase();
    example6_DurationParsing();
    example7_SkillExecution();

    // Async examples (commented out to avoid requiring API key in demo)
    // await example1_BasicConversation();
    // await example2_IntentRecognition();
    // await example8_MultiTurnConversation();
    // await example9_ErrorHandling();
    // await example10_Metrics();

    console.log('\n✅ All examples completed!\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_BasicConversation,
  example2_IntentRecognition,
  example3_AssetExtraction,
  example4_EffectExtraction,
  example5_SkillsShowcase,
  example6_DurationParsing,
  example7_SkillExecution,
  example8_MultiTurnConversation,
  example9_ErrorHandling,
  example10_Metrics,
};
