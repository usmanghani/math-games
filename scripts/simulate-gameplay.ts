#!/usr/bin/env tsx
/**
 * Simulate playing the Number Line Adventure game with different scenarios
 * 
 * Usage:
 *   npx tsx scripts/simulate-gameplay.ts [scenario]
 * 
 * Scenarios:
 *   perfect    - Perfect play (100% accuracy) - default
 *   mixed      - Mixed performance (70% accuracy)
 *   struggling - Struggling player (50% accuracy)
 *   all        - Run all scenarios
 */

import { generateProblemFromLevel, type NumberLineProblem } from '../games/number-line-adventure/src/lib/problem'
import { getLevelConfigWithFallback, type LevelConfig } from '../games/number-line-adventure/src/lib/levels'

interface GameSession {
  levelNumber: number
  levelConfig: LevelConfig
  problems: NumberLineProblem[]
  answers: number[]
  correct: boolean[]
  score: number
  streak: number
  maxStreak: number
}

type Scenario = 'perfect' | 'mixed' | 'struggling'

/**
 * Simulate player answer based on scenario
 */
function simulateAnswer(problem: NumberLineProblem, scenario: Scenario): number {
  const correctAnswer = problem.answer
  const wrongOptions = problem.options.filter((opt) => opt !== correctAnswer)

  switch (scenario) {
    case 'perfect':
      // Always answer correctly
      return correctAnswer

    case 'mixed':
      // 70% chance of correct answer
      if (Math.random() < 0.7) {
        return correctAnswer
      }
      // Otherwise pick a random wrong option
      return wrongOptions[Math.floor(Math.random() * wrongOptions.length)]

    case 'struggling':
      // 50% chance of correct answer
      if (Math.random() < 0.5) {
        return correctAnswer
      }
      // Otherwise pick a random wrong option
      return wrongOptions[Math.floor(Math.random() * wrongOptions.length)]

    default:
      return correctAnswer
  }
}

async function playLevel(levelNumber: number, scenario: Scenario = 'perfect'): Promise<GameSession> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎮 LEVEL ${levelNumber} (${scenario.toUpperCase()} scenario)`)
  console.log(`${'='.repeat(60)}\n`)

  // Load level configuration
  const levelConfig = await getLevelConfigWithFallback(levelNumber)
  console.log(`📋 Level Configuration:`)
  console.log(`   Delta: ${levelConfig.delta} (hop size)`)
  console.log(`   Range: ${levelConfig.minRange} to ${levelConfig.maxRange}`)
  console.log(`   Operations: ${levelConfig.operations.join(', ')}`)
  console.log(`   Required Accuracy: ${(levelConfig.requiredAccuracy * 100).toFixed(0)}%\n`)

  const problems: NumberLineProblem[] = []
  const answers: number[] = []
  const correct: boolean[] = []
  let streak = 0
  let maxStreak = 0

  // Play 5 rounds (standard game session)
  for (let round = 1; round <= 5; round++) {
    // Generate a problem for this round
    const problem = generateProblemFromLevel(levelConfig)
    problems.push(problem)

    // Simulate player answer based on scenario
    const playerAnswer = simulateAnswer(problem, scenario)
    const isCorrect = playerAnswer === problem.answer

    answers.push(playerAnswer)
    correct.push(isCorrect)

    if (isCorrect) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 0
    }

    console.log(`Round ${round}:`)
    console.log(`   ${problem.prompt}`)
    console.log(`   Options: [${problem.options.join(', ')}]`)
    console.log(`   ✅ Correct answer: ${problem.answer}`)
    console.log(`   🎯 Player chose: ${playerAnswer} ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`)
    if (isCorrect) {
      console.log(`   🔥 Streak: ${streak}`)
    }
    console.log()
  }

  // Calculate final score (number of correct answers)
  const score = correct.filter((c) => c).length
  const accuracy = (score / 5) * 100

  console.log(`📊 Session Summary:`)
  console.log(`   Score: ${score}/5`)
  console.log(`   Accuracy: ${accuracy.toFixed(0)}%`)
  console.log(`   Best Streak: ${maxStreak}`)
  const passed = accuracy >= levelConfig.requiredAccuracy * 100
  console.log(`   ${passed ? '✅' : '❌'} Level ${levelConfig.requiredAccuracy * 100}% accuracy requirement: ${passed ? 'MET' : 'NOT MET'}`)

  return {
    levelNumber,
    levelConfig,
    problems,
    answers,
    correct,
    score,
    streak: maxStreak,
    maxStreak,
  }
}

async function runScenario(scenario: Scenario, levels: number[] = [1, 2, 3]): Promise<void> {
  console.log(`\n${'#'.repeat(60)}`)
  console.log(`🎮 NUMBER LINE ADVENTURE - ${scenario.toUpperCase().padEnd(10)} SCENARIO`)
  console.log(`${'#'.repeat(60)}\n`)

  const sessions: GameSession[] = []

  // Play specified levels
  for (const level of levels) {
    const session = await playLevel(level, scenario)
    sessions.push(session)
  }

  // Overall summary
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📈 ${scenario.toUpperCase()} SCENARIO SUMMARY`)
  console.log(`${'='.repeat(60)}\n`)

  const totalScore = sessions.reduce((sum, s) => sum + s.score, 0)
  const totalRounds = sessions.length * 5
  const overallAccuracy = (totalScore / totalRounds) * 100
  const bestStreak = Math.max(...sessions.map((s) => s.maxStreak))
  const levelsPassed = sessions.filter(
    (s) => (s.score / 5) * 100 >= s.levelConfig.requiredAccuracy * 100
  ).length

  console.log(`Total Levels Played: ${sessions.length}`)
  console.log(`Total Rounds: ${totalRounds}`)
  console.log(`Total Correct Answers: ${totalScore}/${totalRounds}`)
  console.log(`Overall Accuracy: ${overallAccuracy.toFixed(1)}%`)
  console.log(`Best Streak Across All Levels: ${bestStreak}`)
  console.log(`Levels Passed: ${levelsPassed}/${sessions.length}`)
  console.log()

  sessions.forEach((session) => {
    const accuracy = (session.score / 5) * 100
    const passed = accuracy >= session.levelConfig.requiredAccuracy * 100
    const status = passed ? '✅' : '❌'
    console.log(`Level ${session.levelNumber}: ${session.score}/5 (${accuracy.toFixed(0)}%) ${status}`)
  })
}

async function main() {
  const scenarioArg = process.argv[2] as Scenario | undefined
  const scenario = scenarioArg && ['perfect', 'mixed', 'struggling', 'all'].includes(scenarioArg) 
    ? scenarioArg 
    : 'perfect'

  if (scenario === 'all') {
    // Run all scenarios
    await runScenario('perfect', [1, 2, 3])
    await runScenario('mixed', [1, 2, 3])
    await runScenario('struggling', [1, 2, 3])
    
    console.log(`\n${'#'.repeat(60)}`)
    console.log('🎉 All scenarios complete!')
    console.log(`${'#'.repeat(60)}\n`)
  } else {
    await runScenario(scenario as Scenario, [1, 2, 3])
    console.log(`\n🎉 Simulation complete!`)
  }

  console.log(`\nTo play the actual game, visit: http://localhost:3003`)
  console.log(`\nUsage: npx tsx scripts/simulate-gameplay.ts [perfect|mixed|struggling|all]\n`)
}

main().catch((error) => {
  console.error('Error running simulation:', error)
  process.exit(1)
})
