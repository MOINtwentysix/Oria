import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { theme } from '@/core/theme';

export function Button({ label, onPress, quiet = false, style }: { label: string; onPress: () => void; quiet?: boolean; style?: ViewStyle }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[styles.button, quiet ? styles.buttonQuiet : styles.buttonSolid, style]}><Text style={[styles.buttonText, quiet && styles.buttonQuietText]}>{label}</Text></TouchableOpacity>;
}

export function Page({ children }: { children: React.ReactNode }) { return <View style={styles.page}>{children}</View>; }

const tabs = [{ href: '/explore', label: 'Karte', icon: '⌖' }, { href: '/ai', label: 'Oria AI', icon: '✦' }, { href: '/saved', label: 'Merkliste', icon: '♥' }, { href: '/profile', label: 'Profil', icon: '◉' }];
export function TabBar() {
  const router = useRouter(); const path = usePathname();
  return <View style={styles.tabBar}>{tabs.map((tab) => <TouchableOpacity key={tab.href} onPress={() => router.replace(tab.href as any)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: path.startsWith(tab.href) }}><Text style={[styles.tabIcon, path.startsWith(tab.href) && styles.tabActive]}>{tab.icon}</Text><Text style={[styles.tabText, path.startsWith(tab.href) && styles.tabActive]}>{tab.label}</Text></TouchableOpacity>)}</View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.paper },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderRadius: theme.radius.md },
  buttonSolid: { backgroundColor: theme.colors.moss }, buttonQuiet: { borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: '700', fontFamily: 'Almarai' }, buttonQuietText: { color: theme.colors.ink },
  tabBar: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.line, paddingTop: 10, paddingBottom: 18 },
  tab: { flex: 1, alignItems: 'center', gap: 3 }, tabIcon: { color: theme.colors.muted, fontSize: 19 }, tabText: { color: theme.colors.muted, fontFamily: 'Almarai', fontSize: 11 }, tabActive: { color: theme.colors.moss, fontWeight: '700' },
});
