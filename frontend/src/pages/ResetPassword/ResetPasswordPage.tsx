import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { authApi } from '../../services/api';
import styles from './ResetPasswordPage.module.scss';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Geçersiz şifre sıfırlama linki. Lütfen tekrar şifre sıfırlama talebinde bulunun.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError('Geçersiz şifre sıfırlama linki.');
            return;
        }

        if (!newPassword.trim()) {
            setError('Lütfen yeni şifrenizi girin.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await authApi.resetPassword(token, newPassword);
            setSuccess('Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <h1>CineFeel</h1>
                    <p>Yeni Şifre Belirle</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {!success && token && (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            type="password"
                            label="Yeni Şifre"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            label="Şifreyi Onayla"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </Button>
                    </form>
                )}

                <div className={styles.footer}>
                    <Link to="/login">← Giriş sayfasına dön</Link>
                </div>
            </div>
        </div>
    );
};
