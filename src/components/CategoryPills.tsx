import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {
  Compass,
  Coffee,
  UtensilsCrossed,
  Trees,
  Landmark,
  Building2,
  ShoppingBag,
  Film,
  Wine,
} from 'lucide-react-native';
import { CATEGORIES } from '../constants/categories';
import { CategoryType } from '../types';
import { BorderRadius, Colors, Spacing } from '../constants/theme';

interface CategoryPillsProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Compass,
  Coffee,
  UtensilsCrossed,
  Trees,
  Landmark,
  Building2,
  ShoppingBag,
  Film,
  Wine,
};

export function CategoryPills({
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = ICON_MAP[cat.iconName] || Compass;

          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => onSelectCategory(cat.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : scheme === 'dark'
                    ? 'rgba(30, 30, 35, 0.75)'
                    : 'rgba(255, 255, 255, 0.85)',
                  borderColor: isSelected
                    ? colors.primary
                    : colors.cardBorder,
                },
              ]}
            >
              <IconComponent
                size={16}
                color={isSelected ? '#FFFFFF' : cat.color}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '600' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 13,
  },
});
