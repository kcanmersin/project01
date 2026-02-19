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

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>SwipeNews</Text>
        <Text style={styles.tagline}>Ücretsiz hesap oluştur</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kayıt Ol</Text>

          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı (min. 3 karakter)"
            placeholderTextColor={Colors.textMuted}
            value={username}
            onChangeText={(t) => { clearError(); setUsername(t); }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta (opsiyonel)"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={(t) => { clearError(); setEmail(t); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre (min. 6 karakter)"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={(t) => { clearError(); setPassword(t); }}
            secureTextEntry
          />
          <TextInput
            style={[styles.input, localError ? styles.inputError : null]}
            placeholder="Şifre tekrar"
            placeholderTextColor={Colors.textMuted}
            value={passwordConfirm}
            onChangeText={(t) => { clearError(); setPasswordConfirm(t); }}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>
              Zaten hesabın var mı? <Text style={styles.linkBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
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
  inputError: {
    borderColor: Colors.primary,
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
});
