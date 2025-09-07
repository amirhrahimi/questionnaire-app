import { useState, useEffect } from 'react';
import fingerprintService from '../services/fingerprint';

interface UseFingerprintResult {
    fingerprint: string | null;
    loading: boolean;
    error: Error | null;
    hasSubmitted: (questionnaireId: string) => Promise<boolean>;
    markAsSubmitted: (questionnaireId: string) => Promise<void>;
    clearSubmission: (questionnaireId: string) => Promise<void>;
}

/**
 * Custom hook for browser fingerprinting and submission tracking
 */
export const useFingerprint = (): UseFingerprintResult => {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initFingerprint = async () => {
            try {
                setLoading(true);
                setError(null);
                const fp = await fingerprintService.getFingerprint();
                setFingerprint(fp);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to generate fingerprint'));
                console.error('Failed to initialize fingerprint:', err);
            } finally {
                setLoading(false);
            }
        };

        initFingerprint();
    }, []);

    const hasSubmitted = async (questionnaireId: string): Promise<boolean> => {
        try {
            return await fingerprintService.hasSubmittedResponse(questionnaireId);
        } catch (err) {
            console.error('Failed to check submission status:', err);
            return false;
        }
    };

    const markAsSubmitted = async (questionnaireId: string): Promise<void> => {
        try {
            await fingerprintService.markAsSubmitted(questionnaireId);
        } catch (err) {
            console.error('Failed to mark as submitted:', err);
            throw err;
        }
    };

    const clearSubmission = async (questionnaireId: string): Promise<void> => {
        try {
            await fingerprintService.clearSubmissionRecord(questionnaireId);
        } catch (err) {
            console.error('Failed to clear submission:', err);
            throw err;
        }
    };

    return {
        fingerprint,
        loading,
        error,
        hasSubmitted,
        markAsSubmitted,
        clearSubmission
    };
};

export default useFingerprint;
