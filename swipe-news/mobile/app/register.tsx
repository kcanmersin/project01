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
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { Colors, Spacing, Radius } from '../constants/theme';

type FieldName = 'username' | 'email' | 'password' | 'passwordConfirm';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const { register, isLoading, error, clearError } = useAuthStore();

  const localError =
    password && passwordConfirm && password !== passwordConfirm
      ? 'Şifreler eşleşmiyor'
      : null;

  const canSubmit =
    username.trim().length >= 3 &&
    password.length >= 6 &&
    password === passwordConfirm &&
    !isLoading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    try {
      await register(username.trim(), password, email.trim() || undefined);
      router.replace('/(tabs)/');
    } catch {
      // error is set in store
    }
  };

  const displayError = localError || error;

  const inputWrapStyle = (field: FieldName) => [
    styles.inputWrap,
    focusedField === field && styles.inputWrapFocused,
    field === 'passwordConfirm' && localError ? styles.inputWrapError : null,
  ];

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🗞️</Text>
          </View>
          <Text style={styles.appName}>SwipeNews</Text>
          <Text style={styles.appTagline}>Ücretsiz hesap oluştur</Text>
        </View>

        {/* ── Form Card ────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesap Oluştur</Text>
          <Text style={styles.cardSub}>Birkaç saniyede ücretsiz kayıt olun</Text>

          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Kullanıcı Adı <Text style={styles.fieldRequired}>*</Text>
            </Text>
            <View style={inputWrapStyle('username')}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="En az 3 karakter"
                placeholderTextColor={Colors.textMuted}
                value={username}
                onChangeText={(t) => { clearError(); setUsername(t); }}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
              {username.length >= 3 && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              E-posta <Text style={styles.fieldOptional}>(opsiyonel)</Text>
            </Text>
            <View style={inputWrapStyle('email')}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(t) => { clearError(); setEmail(t); }}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Şifre <Text style={styles.fieldRequired}>*</Text>
            </Text>
            <View style={inputWrapStyle('password')}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="En az 6 karakter"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(t) => { clearError(); setPassword(t); }}
                secureTextEntry
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              {password.length >= 6 && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </View>
          </View>

          {/* Password Confirm */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Şifre Tekrar <Text style={styles.fieldRequired}>*</Text>
            </Text>
            <View style={inputWrapStyle('passwordConfirm')}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={Colors.textMuted}
                value={passwordConfirm}
                onChangeText={(t) => { clearError(); setPasswordConfirm(t); }}
                secureTextEntry
                onFocus={() => setFocusedField('passwordConfirm')}
                onBlur={() => setFocusedField(null)}
              />
              {passwordConfirm && !localError && password === passwordConfirm && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Kayıt Ol →</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{'  '}
              <Text style={styles.linkBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xl }} />
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
    paddingTop: 48,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: Spacing.lg,
  },
  backText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoEmoji: {
    fontSize: 30,
  },
  appName: {
    fontSize: 28,
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
  fieldRequired: {
    color: Colors.primary,
  },
  fieldOptional: {
    fontWeight: '400',
    color: Colors.textMuted,
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
  inputWrapError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    fontSize: 16,
  },
  checkIcon: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '700',
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
});
