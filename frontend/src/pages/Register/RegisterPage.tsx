import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import styles from './RegisterPage.module.scss';

export const RegisterPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <h1>Join CineFeel</h1>
                    <p>Create your account and start your journey.</p>
                </div>

                <form className={styles.form}>
                    <div className={styles.row}>
                        <Input label="First Name" placeholder="John" />
                        <Input label="Last Name" placeholder="Doe" />
                    </div>

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
                    <Input
                        type="password"
                        label="Confirm Password"
                        placeholder="••••••••"
                    />

                    <Button type="submit" style={{ marginTop: '1rem' }}>Create Account</Button>


                    <div className={styles.divider}>OR</div>

                    <GoogleAuthButton
                        text="signup_with"
                        onSuccess={(credential: any) => {
                            console.log('Google Register Success:', credential);
                            // TODO: Send credential.credential to backend endpoint /api/auth/google
                        }}
                    />
                </form>

                <div className={styles.footer}>
                    Already have an account?
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};
