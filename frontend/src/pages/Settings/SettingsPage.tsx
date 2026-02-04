import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { authApi, tokenStorage } from '../../services/api';
import styles from './SettingsPage.module.scss';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const user = tokenStorage.getUser();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword.trim()) {
            setError('Lütfen mevcut şifrenizi girin.');
            return;
        }

        if (!newPassword.trim()) {
            setError('Lütfen yeni şifrenizi girin.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await authApi.changePassword(currentPassword, newPassword);
            setSuccess('Şifreniz başarıyla güncellendi!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className={styles.pageContainer}>
            <Link to={`/profile/${user.username}`} className={styles.backLink}>
                ← Profile dön
            </Link>

            <div className={styles.header}>
                <h1>Ayarlar</h1>
                <p>Hesap ayarlarınızı buradan yönetebilirsiniz.</p>
            </div>

            <div className={styles.section}>
                <h2>Şifre Değiştir</h2>

                {user.hasGoogleLinked && !user.isEmailVerified && (
                    <div className={styles.googleNote}>
                        Google ile giriş yaptığınız için şifre değiştirmek için önce bir şifre belirlemeniz gerekebilir.
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form className={styles.form} onSubmit={handleChangePassword}>
                    <Input
                        type="password"
                        label="Mevcut Şifre"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        label="Yeni Şifre"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        label="Yeni Şifreyi Onayla"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className={styles.buttonRow}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
