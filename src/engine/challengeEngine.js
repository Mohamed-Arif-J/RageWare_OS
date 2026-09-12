/**
 * RAGEWARE — Challenge Engine Registry & Sequencer
 * 
 * Manages the available pool of psychological friction challenges.
 * Handles sequencing from Mission 01 to Mission 04.
 */

export const CHALLENGE_CATEGORIES = {
  MOVING_BUTTONS: 'movingButtons',
  FAKE_LOADING: 'fakeLoading',
  MOVING_TARGETS: 'movingTargets',
  PRECISION_CHALLENGES: 'precisionChallenges',
  TIMING_CHALLENGES: 'timingChallenges',
  HAND_CHALLENGES: 'handChallenges',
};

export const CHALLENGE_REGISTRY = [
  {
    id: 'escaping-button',
    name: 'Escaping Button',
    category: CHALLENGE_CATEGORIES.MOVING_BUTTONS,
    difficulty: 1,
    rageWeight: 1.2,
    missionNumber: '01',
    title: 'CLICK THE BUTTON',
    instruction: 'Click the designated action trigger to authenticate your interaction.',
    component: 'EscapingButtonChallenge',
  },
  {
    id: 'fake-loading',
    name: 'Fake Loading',
    category: CHALLENGE_CATEGORIES.FAKE_LOADING,
    difficulty: 2,
    rageWeight: 1.5,
    missionNumber: '02',
    title: 'SYSTEM UPDATE',
    instruction: 'Await system synchronization package deployment without interruption.',
    component: 'FakeLoadingChallenge',
  },
  {
    id: 'moving-target',
    name: 'Moving Target',
    category: CHALLENGE_CATEGORIES.MOVING_TARGETS,
    difficulty: 2,
    rageWeight: 1.3,
    missionNumber: '03',
    title: 'HIT THE TARGET',
    instruction: 'Acquire and strike the erratic biometric reticle 3 times before timeout.',
    component: 'MovingTargetChallenge',
  },
  {
    id: 'fake-buttons',
    name: 'Fake Buttons',
    category: CHALLENGE_CATEGORIES.PRECISION_CHALLENGES,
    difficulty: 2,
    rageWeight: 1.4,
    missionNumber: '04',
    title: 'SELECT THE CORRECT BUTTON',
    instruction: 'Decipher the adversarial affirmative directive from the decision matrix.',
    component: 'FakeButtonChallenge',
  },
];

export const getTotalChallenges = () => CHALLENGE_REGISTRY.length;

export const getChallengeByIndex = (index) => {
  if (index >= 0 && index < CHALLENGE_REGISTRY.length) {
    return CHALLENGE_REGISTRY[index];
  }
  return null;
};

export const getNextChallengeIndex = (currentIndex) => {
  if (currentIndex + 1 < CHALLENGE_REGISTRY.length) {
    return currentIndex + 1;
  }
  return -1; // signals complete
};
