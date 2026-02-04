import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { authApi } from '../../services/api';
import styles from './ForgotPasswordPage.module.scss';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Lütfen email adresinizi girin.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await authApi.forgotPassword(email);
            setSuccess('Şifre sıfırlama linki email adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
            setEmail('');
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
                    <p>Şifrenizi mi unuttunuz?</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {!success && (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '0.9rem' }}>
                            Email adresinizi girin, size şifre sıfırlama linki göndereceğiz.
                        </p>
                        <Input
                            type="email"
                            label="Email Adresi"
                            placeholder="ornek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
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
