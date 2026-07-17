export const loadOnboardingState = async (getOnboardingData) => {
  const onboardingData = await getOnboardingData()
  return {
    enabledModules: onboardingData?.enabledModules ?? [],
    showOnboarding: !onboardingData?.progress.isComplete
  }
}
