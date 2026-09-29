import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { theme } from '@/core/theme';

export function Button({ label, onPress, quiet = false, style }: { label: string; onPress: () => void; quiet?: boolean; style?: ViewStyle }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[styles.button, quiet ? styles.buttonQuiet : styles.buttonSolid, style]}><Text style={[styles.buttonText, quiet && styles.buttonQuietText]}>{label}</Text></TouchableOpacity>;
}

export function Page({ children }: { children: React.ReactNode }) { return <View style={styles.page}>{children}</View>; }

const tabs = [{ href: '/explore', label: 'Entdecken', icon: '⌖' }, { href: '/ai', label: 'Ideen', icon: '✦' }, { href: '/saved', label: 'Gemerkte', icon: '♥' }, { href: '/profile', label: 'Profil', icon: '◉' }];
export function TabBar({ floating = false }: { floating?: boolean }) {
  const router = useRouter(); const path = usePathname();
  return <View style={[styles.tabBar, floating && styles.tabBarFloating]}>{tabs.map((tab) => {
    const active = path.startsWith(tab.href);
    return <TouchableOpacity key={tab.href} onPress={() => router.replace(tab.href as any)} style={[styles.tab, active && styles.tabSelected]} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected: active }}><Text style={[styles.tabIcon, active && styles.tabActive]}>{tab.icon}</Text><Text style={[styles.tabText, active && styles.tabActive]}>{tab.label}</Text></TouchableOpacity>;
  })}</View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.paper },
  button: { minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderRadius: theme.radius.md },
  buttonSolid: { backgroundColor: theme.colors.moss }, buttonQuiet: { borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface },
  buttonText: { color: theme.colors.night, fontSize: 16, fontWeight: '800' }, buttonQuietText: { color: theme.colors.ink },
  tabBar: { flexDirection: 'row', marginHorizontal: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: 22, padding: 6, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 20, elevation: 12 },
  tabBarFloating: { position: 'absolute', left: 4, right: 4, bottom: 12, zIndex: 10 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, gap: 2, borderRadius: 16 }, tabSelected: { backgroundColor: theme.colors.surfaceRaised }, tabIcon: { color: theme.colors.muted, fontSize: 19 }, tabText: { color: theme.colors.muted, fontSize: 10, fontWeight: '600' }, tabActive: { color: theme.colors.moss, fontWeight: '800' },
});
