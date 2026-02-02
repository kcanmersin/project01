import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { authApi, tokenStorage } from '../../services/api';
import styles from './LoginPage.module.scss';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Redirect to home if already logged in
    useEffect(() => {
        const user = tokenStorage.getUser();
        if (user) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleGoogleLogin = async (credential: { credential?: string }) => {
        if (!credential.credential) {
            setError('Google credential not received');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authApi.googleLogin(credential.credential);
            tokenStorage.setToken(response.token);
            tokenStorage.setUser(response.user);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <h1>CineFeel</h1>
                    <p>Welcome back, movie lover.</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form}>
                    <Input
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                    />
                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                    />

                    <div className={styles.actions}>
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    <Button type="submit" disabled={loading}>Sign In</Button>

                    <div className={styles.divider}>OR</div>

                    <GoogleAuthButton
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            setError('Google login failed');
                        }}
                        text="signin_with"
                    />
                </form>

                <div className={styles.footer}>
                    Don't have an account?
                    <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
};
