import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    try {
      await login(username.trim(), password);
      router.replace('/(tabs)/');
    } catch {
      // error is set in store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <Text style={styles.logo}>SwipeNews</Text>
        <Text style={styles.tagline}>Haberleri hızlıca tarayın</Text>

        {/* Kart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı"
            placeholderTextColor={Colors.textMuted}
            value={username}
            onChangeText={(t) => { clearError(); setUsername(t); }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={(t) => { clearError(); setPassword(t); }}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, (!username || !password) && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.linkText}>
              Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test hesapları bilgisi */}
        <View style={styles.testAccounts}>
          <Text style={styles.testTitle}>Test Hesapları</Text>
          {[
            { u: 'superadmin', p: 'superadmin123', r: 'superadmin' },
            { u: 'admin', p: 'admin123', r: 'admin' },
            { u: 'user', p: 'user123', r: 'user' },
          ].map((acc) => (
            <TouchableOpacity
              key={acc.u}
              style={styles.testRow}
              onPress={() => { setUsername(acc.u); setPassword(acc.p); }}
            >
              <Text style={styles.testUser}>{acc.u}</Text>
              <Text style={styles.testPass}>{acc.p}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleColor(acc.r) }]}>
                <Text style={styles.roleText}>{acc.r}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={styles.testHint}>Satıra dokun → otomatik doldur</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function roleColor(role: string) {
  if (role === 'superadmin') return '#9C27B0';
  if (role === 'admin') return '#FF9800';
  return '#4CAF50';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.summary,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: Radius.small,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    marginBottom: Spacing.sm,
    minHeight: 48,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.small,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: 50,
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    ...Typography.summary,
    color: Colors.textSecondary,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
  testAccounts: {
    width: '100%',
    marginTop: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.md,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  testUser: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  testPass: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  roleBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  testHint: {
    ...Typography.meta,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
