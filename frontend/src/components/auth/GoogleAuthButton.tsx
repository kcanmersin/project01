import React from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface GoogleAuthButtonProps {
    onSuccess: (credentialResponse: CredentialResponse) => void;
    onError?: () => void;
    text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
    onSuccess,
    onError,
    text = 'continue_with'
}) => {
    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                theme="filled_black"
                shape="pill"
                text={text}
                width="100%"
                size="large"
            />
        </div>
    );
};
