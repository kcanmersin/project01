import React, { useEffect, useState } from 'react';
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
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/useAuthStore';
import { Colors, Spacing, Radius } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const ROLE_COLORS: Record<string, string> = {
  superadmin: '#7C3AED',
  admin: '#EA580C',
  user: '#16A34A',
};

const TEST_ACCOUNTS = [
  { u: 'superadmin', p: 'superadmin123', r: 'superadmin' },
  { u: 'admin', p: 'admin123', r: 'admin' },
  { u: 'user', p: 'user123', r: 'user' },
];

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  // Google OAuth
  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // Expo Go  → response.params.id_token
      // Native   → response.authentication?.idToken
      const idToken =
        response.params?.id_token ??
        (response as any).authentication?.idToken;
      if (idToken) {
        loginWithGoogle(idToken)
          .then(() => router.replace('/(tabs)/'))
          .catch(() => setGoogleLoading(false));
      } else {
        setGoogleLoading(false);
      }
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response, loginWithGoogle]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    try {
      await login(username.trim(), password);
      router.replace('/(tabs)/');
    } catch {
      // error set in store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ─────────────────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🗞️</Text>
          </View>
          <Text style={styles.appName}>SwipeNews</Text>
          <Text style={styles.appTagline}>Haberleri hızlıca tarayın</Text>
        </View>

        {/* ── Form Card ────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoş geldiniz</Text>
          <Text style={styles.cardSub}>Hesabınıza giriş yapın</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Kullanıcı Adı</Text>
            <View style={[styles.inputWrap, focusedField === 'username' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı adınızı girin"
                placeholderTextColor={Colors.textMuted}
                value={username}
                onChangeText={(t) => { clearError(); setUsername(t); }}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Şifre</Text>
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(t) => { clearError(); setPassword(t); }}
                secureTextEntry
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.btn, (!username || !password || isLoading) && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading || !username || !password}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Giriş Yap →</Text>
            )}
          </TouchableOpacity>

          {/* Ayraç */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google ile Giriş */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => {
              clearError();
              setGoogleLoading(true);
              promptAsync().catch(() => setGoogleLoading(false));
            }}
            disabled={googleLoading || isLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.text} size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Google ile Giriş Yap</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.push('/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Hesabın yok mu?{'  '}
              <Text style={styles.linkBold}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Test Accounts ─────────────────────────────── */}
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={styles.testDivider} />
            <Text style={styles.testTitle}>TEST HESAPLARI</Text>
            <View style={styles.testDivider} />
          </View>
          <Text style={styles.testHint}>Satıra dokun → otomatik doldur</Text>

          {TEST_ACCOUNTS.map((acc, idx) => (
            <TouchableOpacity
              key={acc.u}
              style={[
                styles.testRow,
                idx === TEST_ACCOUNTS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => { setUsername(acc.u); setPassword(acc.p); }}
              activeOpacity={0.6}
            >
              <View style={[styles.roleCircle, { backgroundColor: ROLE_COLORS[acc.r] }]}>
                <Text style={styles.roleInitial}>{acc.u[0].toUpperCase()}</Text>
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testUser}>{acc.u}</Text>
                <Text style={styles.testPass}>{acc.p}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[acc.r] + '22' }]}>
                <Text style={[styles.roleText, { color: ROLE_COLORS[acc.r] }]}>{acc.r}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: -24,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.small,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorIcon: {
    fontSize: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
  },
  fieldGroup: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.small,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    minHeight: 50,
    gap: Spacing.xs,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F6',
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.small,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    minHeight: 52,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.small,
    paddingVertical: 13,
    minHeight: 52,
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
    letterSpacing: -0.5,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
  testCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  testDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  testTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  testHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  roleCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  testInfo: {
    flex: 1,
  },
  testUser: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  testPass: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  roleBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
