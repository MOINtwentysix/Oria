import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassChip } from '@/components/ui';
import { useAuth } from '@/services/auth';
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
      router.replace('/auth');
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
            <Text style={[styles.welcomeIcon, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
              Oria
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
              Entdecke, was um dich herum ist ✨🗺️
            </Text>
            <View style={styles.welcomeFeatures}>
              {[
                { icon: '🗺️', title: 'Entdecken', desc: 'Interaktive Karte mit Live-Plätzen' },
                { icon: '✨', title: 'Oria AI', desc: 'Natürliche Sprachsuche & Empfehlungen' },
                { icon: '❤️', title: 'Speichern & Teilen', desc: 'Listen mit Freunden erstellen' },
                { icon: '🗺️', title: 'Reisen planen', desc: 'KI-Routen & Google Maps Export' },
              ].map((feature, index) => (
                <View key={index} style={[styles.welcomeFeature, { backgroundColor: theme.colors.paperElevated, borderColor: theme.colors.border }]}>
                  <Text style={styles.welcomeFeatureIcon}>{feature.icon}</Text>
                  <View style={styles.welcomeFeatureText}>
                    <Text style={[styles.welcomeFeatureTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.welcomeFeatureDesc, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
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
            <Text style={[styles.stepTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
              Was interessiert dich?
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
              Wähle Kategorien für persönliche Entdeckungen
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
                        ? theme.colors[category.color as keyof typeof theme.colors] || theme.colors.accent
                        : 'transparent',
                      borderColor: interests.includes(category.id)
                        ? theme.colors[category.color as keyof typeof theme.colors] || theme.colors.accent
                        : theme.colors.border,
                      borderWidth: interests.includes(category.id) ? 0 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <View style={[
                    styles.interestIcon,
                    { backgroundColor: interests.includes(category.id) ? 'rgba(255,255,255,0.2)' : theme.colors.accentSoft },
                  ]}>
                    <Text style={styles.interestIconText}>{category.icon}</Text>
                  </View>
                  <Text style={[
                    styles.interestName,
                    { color: interests.includes(category.id) ? 'white' : theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
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
            <Text style={[styles.stepTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
              Wie weit soll Oria suchen?
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
              Bestimme deinen Suchradius für Entdeckungen
            </Text>
            <View style={styles.radiusOptions}>
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setRadius(option.value)}
                  style={[
                    styles.radiusOption,
                    {
                      backgroundColor: radius === option.value ? theme.colors.accentSoft : theme.colors.paperElevated,
                      borderColor: radius === option.value ? theme.colors.accent : theme.colors.border,
                      borderWidth: radius === option.value ? 2 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <Text style={[
                    styles.radiusOptionLabel,
                    { color: radius === option.value ? theme.colors.accent : theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.radiusOptionDesc,
                    { color: radius === option.value ? theme.colors.inkMuted : theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Bis zu {option.value / 1000} km Entfernung
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3: // Location
        return (
          <View style={styles.locationContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
              Standortzugriff
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
              Oria braucht deinen Standort, um Orte in deiner Nähe zu zeigen
            </Text>
            <View style={styles.locationIllustration}>
              <Text style={styles.locationIllustrationIcon}>📍</Text>
            </View>
            <View style={styles.locationCard}>
              <GlassCard variant="light" style={styles.locationCardContent}>
                <Text style={[styles.locationCardTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body }]}>
                  Deine Privatsphäre ist uns wichtig
                </Text>
                <Text style={[styles.locationCardText, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
                  Dein Standort wird nur lokal auf dem Gerät verwendet, um nahegelegene Orte zu finden. Er wird nicht gespeichert, nicht geteilt und nicht für Werbung genutzt. Du kannst die Berechtigung jederzeit in den Einstellungen widerrufen.
                </Text>
              </GlassCard>
            </View>
          </View>
        );

      case 4: // Confirm
        return (
          <View style={styles.confirmContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
              Fast fertig!
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
              Prüfe deine Einstellungen und starte deine Entdeckungsreise
            </Text>
            <GlassCard variant="light" style={styles.confirmCard}>
              <View style={styles.confirmSection}>
                <Text style={[
                  styles.confirmSectionTitle,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Interessen
                </Text>
                <View style={styles.confirmChips}>
                  {interests.length > 0 ? (
                    interests.map((interestId) => {
                      const category = CATEGORIES.find(c => c.id === interestId);
                      return (
                        <GlassChip
                          key={interestId}
                          variant="selected"
                          size="sm"
                          style={{ backgroundColor: category ? (theme.colors[category.color as keyof typeof theme.colors] || theme.colors.accent) : theme.colors.accent }}
                        >
                          {category?.icon} {category?.name}
                        </GlassChip>
                      );
                    })
                  ) : (
                    <Text style={[
                      styles.confirmEmpty,
                      { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                    ]}>
                      Keine ausgewählt
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.confirmSection}>
                <Text style={[
                  styles.confirmSectionTitle,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Suchradius
                </Text>
                <Text style={[
                  styles.confirmValue,
                  { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  {RADIUS_OPTIONS.find(o => o.value === radius)?.label || '5 km'}
                </Text>
              </View>
            </GlassCard>
          </View>
        );

      case 5: // Complete
        return (
          <View style={styles.completeContent}>
            <Text style={styles.completeIcon}>✨</Text>
            <Text style={[styles.completeTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
              Bereit zum Entdecken!
            </Text>
            <Text style={[styles.completeSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
              Dein Oria ist konfiguriert. Finde Orte, die du lieben wirst.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: theme.colors.accent, width: `${((onboardingStep + 1) / ONBOARDING_STEPS.length) * 100}%` },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {onboardingStep > 0 && (
            <TouchableOpacity onPress={handleBack} hitSlop={16} style={styles.backButton}>
              <Text style={[styles.backIcon, { color: theme.colors.ink }]}>‹</Text>
            </TouchableOpacity>
          )}

          <View style={styles.stepHeader}>
            <Text style={[
              styles.stepNumber,
              { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
            ]}>
              Schritt {onboardingStep + 1} von {ONBOARDING_STEPS.length}
            </Text>
            <Text style={[
              styles.stepTitleLarge,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
            ]}>
              {currentStep.title}
            </Text>
          </View>

          {renderStepContent()}
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { borderTopColor: theme.colors.border }]}>
        {onboardingStep > 0 && (
          <GlassButton
            variant="secondary"
            size="lg"
            style={[styles.bottomActionButton, { flex: 1 }]}
            onPress={handleBack}
          >
            Zurück
          </GlassButton>
        )}
        <GlassButton
          variant={onboardingStep === ONBOARDING_STEPS.length - 1 ? 'primary' : 'primary'}
          size="lg"
          style={[styles.bottomActionButton, { flex: onboardingStep > 0 ? 1 : undefined, flexGrow: onboardingStep === 0 ? 1 : 0 }]}
          onPress={handleNext}
        >
          {onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Los geht\'s' : 'Weiter'}
        </GlassButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
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
  scrollContent: {
    flexGrow: 1,
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
  backIcon: { fontSize: 38, lineHeight: 38, fontWeight: '300', includeFontPadding: false },
  stepHeader: {
    marginBottom: 32,
    gap: 8,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  stepTitleLarge: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  welcomeContent: {
    gap: 24,
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 64,
    marginTop: 20,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    includeFontPadding: false,
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
    borderWidth: 1,
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
    includeFontPadding: false,
  },
  welcomeFeatureDesc: {
    fontSize: 13,
    includeFontPadding: false,
  },
  interestsContent: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  stepSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
  interestsGrid: {
    marginTop: 8,
  },
  interestsGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  interestCard: {
    width: '48%',
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
    includeFontPadding: false,
  },
  radiusContent: {
    gap: 20,
  },
  radiusOptions: {
    gap: 12,
  },
  radiusOption: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  radiusOptionLabel: {
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },
  radiusOptionDesc: {
    fontSize: 13,
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  locationCardText: {
    fontSize: 14,
    lineHeight: 22,
    includeFontPadding: false,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  confirmChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  confirmEmpty: {
    fontSize: 14,
    includeFontPadding: false,
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  completeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
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
    borderTopWidth: 1,
  },
  bottomActionButton: {
    minWidth: 140,
  },
});
