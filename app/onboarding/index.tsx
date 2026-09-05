import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassChip } from '@/components/ui';
import { useAuth } from '@/services/clerk';
import { useUIStore } from '@/store';
import { CATEGORIES, ONBOARDING_STEPS, RADIUS_OPTIONS } from '@/constants';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { tabBarVisible, setTabBarVisible, onboardingComplete, setOnboardingComplete, onboardingStep, setOnboardingStep } = useUIStore();
  const router = useRouter();

  const [interests, setInterests] = React.useState<string[]>([]);
  const [radius, setRadius] = React.useState(5000);
  const [locationGranted, setLocationGranted] = React.useState(false);

  const currentStep = ONBOARDING_STEPS[onboardingStep];

  React.useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

  const handleNext = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboardingComplete(true);
      router.replace('/explore');
    }
  };

  const handleBack = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const toggleInterest = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const renderStepContent = () => {
    switch (onboardingStep) {
      case 0: // Welcome
        return (
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeIcon}>\u2728</Text>
            <Text style={[
              styles.welcomeTitle,
              { color: theme.colors.text },
            ]}>
              Welcome to Oria
            </Text>
            <Text style={[
              styles.welcomeSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Discover what's around you. Find amazing places, save favorites, plan trips, and share with friends.
            </Text>
            <View style={styles.welcomeFeatures}>
              {[
                { icon: '\ud83d\uddfa\ufe0f', title: 'Explore', desc: 'Interactive map with places' },
                { icon: '\u2728', title: 'Oria AI', desc: 'Smart recommendations' },
                { icon: '\u2764\ufe0f', title: 'Save & Share', desc: 'Lists with friends' },
                { icon: '\ud83d\uddfa\ufe0f', title: 'Plan Trips', desc: 'AI-powered itineraries' },
              ].map((feature, index) => (
                <View key={index} style={styles.welcomeFeature}>
                  <Text style={styles.welcomeFeatureIcon}>{feature.icon}</Text>
                  <View style={styles.welcomeFeatureText}>
                    <Text style={[
                      styles.welcomeFeatureTitle,
                      { color: theme.colors.text },
                    ]}>
                      {feature.title}
                    </Text>
                    <Text style={[
                      styles.welcomeFeatureDesc,
                      { color: theme.colors.textSecondary },
                    ]}>
                      {feature.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 1: // Interests
        return (
          <View style={styles.interestsContent}>
            <Text style={[
              styles.stepTitle,
              { color: theme.colors.text },
            ]}>
              What do you love?
            </Text>
            <Text style={[
              styles.stepSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Select your interests to personalize discoveries
            </Text>
            <ScrollView style={styles.interestsGrid} contentContainerStyle={styles.interestsGridContent}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleInterest(category.id)}
                  style={[
                    styles.interestCard,
                    {
                      backgroundColor: interests.includes(category.id)
                        ? theme.colors[category.color as keyof typeof theme.colors] || theme.colors.primary
                        : (colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)'),
                      borderColor: interests.includes(category.id)
                        ? theme.colors[category.color as keyof typeof theme.colors] || theme.colors.primary
                        : (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'),
                      borderWidth: interests.includes(category.id) ? 0 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <View style={[
                    styles.interestIcon,
                    { backgroundColor: interests.includes(category.id) ? 'rgba(255,255,255,0.2)' : theme.colors[category.color as keyof typeof theme.colors] || theme.colors.primary },
                  ]}>
                    <Text style={styles.interestIconText}>{category.icon}</Text>
                  </View>
                  <Text style={[
                    styles.interestName,
                    { color: interests.includes(category.id) ? 'white' : theme.colors.text },
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 2: // Radius
        return (
          <View style={styles.radiusContent}>
            <Text style={[
              styles.stepTitle,
              { color: theme.colors.text },
            ]}>
              How far to explore?
            </Text>
            <Text style={[
              styles.stepSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Choose your default search radius
            </Text>
            <View style={styles.radiusOptions}>
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setRadius(option.value)}
                  style={[
                    styles.radiusOption,
                    {
                      backgroundColor: radius === option.value ? theme.colors.primary : (colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)'),
                      borderColor: radius === option.value ? theme.colors.primary : (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'),
                      borderWidth: radius === option.value ? 0 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <Text style={[
                    styles.radiusOptionLabel,
                    { color: radius === option.value ? 'white' : theme.colors.text },
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.radiusOptionDesc,
                    { color: radius === option.value ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary },
                  ]}>
                    {option.value < 1000 ? `${option.value}m` : `${option.value / 1000}km`} radius
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3: // Location
        return (
          <View style={styles.locationContent}>
            <Text style={[
              styles.stepTitle,
              { color: theme.colors.text },
            ]}>
              Location Access
            </Text>
            <Text style={[
              styles.stepSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Oria needs your location to show nearby places and calculate routes
            </Text>
            <View style={styles.locationIllustration}>
              <Text style={styles.locationIllustrationIcon}>\ud83d\udccd</Text>
            </View>
            <GlassCard variant="light" style={styles.locationCard}>
              <View style={styles.locationCardContent}>
                <Text style={[
                  styles.locationCardTitle,
                  { color: theme.colors.text },
                ]}>
                  Why we need location
                </Text>
                <Text style={[
                  styles.locationCardText,
                  { color: theme.colors.textSecondary },
                ]}>
                  \u2022 Show places near you
                  \u2022 Calculate walking/driving routes
                  \u2022 Plan trips from your location
                  \u2022 Enable "Nearby" searches
                </Text>
              </View>
            </GlassCard>
            <GlassButton
              variant={locationGranted ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              onPress={async () => {
                setLocationGranted(true);
              }}
            >
              {locationGranted ? 'Location Enabled \u2713' : 'Enable Location'}
            </GlassButton>
          </View>
        );

      case 4: // Preferences confirmation
        return (
          <View style={styles.confirmContent}>
            <Text style={[
              styles.stepTitle,
              { color: theme.colors.text },
            ]}>
              Almost ready!
            </Text>
            <Text style={[
              styles.stepSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Review your preferences
            </Text>
            <GlassCard variant="light" style={styles.confirmCard}>
              <View style={styles.confirmSection}>
                <Text style={[
                  styles.confirmSectionTitle,
                  { color: theme.colors.textSecondary },
                ]}>
                  Interests ({interests.length})
                </Text>
                <View style={styles.confirmChips}>
                  {interests.map((interestId) => {
                    const cat = CATEGORIES.find(c => c.id === interestId);
                    return cat ? (
                      <GlassChip key={interestId} variant="outline" size="sm">
                        {cat.icon} {cat.name}
                      </GlassChip>
                    ) : null;
                  })}
                  {interests.length === 0 && (
                    <Text style={[
                      styles.confirmEmpty,
                      { color: theme.colors.textTertiary },
                    ]}>
                      No interests selected
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.confirmSection}>
                <Text style={[
                  styles.confirmSectionTitle,
                  { color: theme.colors.textSecondary },
                ]}>
                  Search Radius
                </Text>
                <Text style={[
                  styles.confirmValue,
                  { color: theme.colors.text },
                ]}>
                  {RADIUS_OPTIONS.find(o => o.value === radius)?.label || `${radius}m`}
                </Text>
              </View>
              <View style={styles.confirmSection}>
                <Text style={[
                  styles.confirmSectionTitle,
                  { color: theme.colors.textSecondary },
                ]}>
                  Location Access
                </Text>
                <Text style={[
                  styles.confirmValue,
                  { color: locationGranted ? theme.colors.success : theme.colors.error },
                ]}>
                  {locationGranted ? 'Enabled' : 'Not granted'}
                </Text>
              </View>
            </GlassCard>
          </View>
        );

      case 5: // Complete
        return (
          <View style={styles.completeContent}>
            <Text style={styles.completeIcon}>\ud83c\udf89</Text>
            <Text style={[
              styles.completeTitle,
              { color: theme.colors.text },
            ]}>
              You're all set!
            </Text>
            <Text style={[
              styles.completeSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Start exploring amazing places around you
            </Text>
            <GlassButton size="xl" fullWidth onPress={handleNext}>
              Start Exploring
            </GlassButton>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {onboardingStep > 0 && (
            <TouchableOpacity onPress={handleBack} hitSlop={16} style={styles.backButton}>
              <View style={styles.backIcon} />
            </TouchableOpacity>
          )}

          <View style={styles.stepHeader}>
            <Text style={[
              styles.stepNumber,
              { color: theme.colors.textTertiary },
            ]}>
              Step {onboardingStep + 1} of {ONBOARDING_STEPS.length}
            </Text>
            <Text style={[
              styles.stepTitleLarge,
              { color: theme.colors.text },
            ]}>
              {currentStep?.title}
            </Text>
          </View>

          {renderStepContent()}
        </View>
      </ScrollView>

      {onboardingStep < ONBOARDING_STEPS.length - 1 && (
        <View style={styles.bottomActions}>
          <GlassButton
            variant={onboardingStep === 0 ? 'ghost' : 'secondary'}
            size="lg"
            onPress={handleBack}
            disabled={onboardingStep === 0}
          >
            Back
          </GlassButton>
          <GlassButton

            size="lg"
            onPress={handleNext}
            disabled={onboardingStep === 1 && interests.length === 0}
          >
            Next
          </GlassButton>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  stepHeader: {
    marginBottom: 32,
    gap: 8,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepTitleLarge: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  welcomeContent: {
    gap: 24,
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 64,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  welcomeFeatures: {
    width: '100%',
    gap: 16,
    marginTop: 20,
  },
  welcomeFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeFeatureIcon: {
    fontSize: 28,
  },
  welcomeFeatureText: {
    flex: 1,
    gap: 2,
  },
  welcomeFeatureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeFeatureDesc: {
    fontSize: 13,
  },
  interestsContent: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  interestsGrid: {
    marginTop: 8,
  },
  interestsGridContent: {
    gap: 12,
    paddingBottom: 20,
  },
  interestCard: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  interestIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestIconText: {
    fontSize: 24,
  },
  interestName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  radiusContent: {
    gap: 20,
  },
  radiusOptions: {
    gap: 12,
  },
  radiusOption: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  radiusOptionLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  radiusOptionDesc: {
    fontSize: 13,
  },
  locationContent: {
    gap: 24,
    alignItems: 'center',
  },
  locationIllustration: {
    marginTop: 20,
  },
  locationIllustrationIcon: {
    fontSize: 80,
  },
  locationCard: {
    width: '100%',
    marginTop: 16,
  },
  locationCardContent: {
    padding: 20,
    gap: 12,
  },
  locationCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationCardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  confirmContent: {
    gap: 20,
  },
  confirmCard: {
    padding: 20,
    gap: 20,
  },
  confirmSection: {
    gap: 8,
  },
  confirmSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confirmChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  confirmEmpty: {
    fontSize: 14,
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  completeContent: {
    gap: 20,
    alignItems: 'center',
    paddingVertical: 40,
  },
  completeIcon: {
    fontSize: 80,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F7F9FC',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});
