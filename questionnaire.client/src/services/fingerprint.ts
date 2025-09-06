import FingerprintJS from '@fingerprintjs/fingerprintjs';

class FingerprintService {
    private static instance: FingerprintService;
    private fingerprint: string | null = null;
    private fpPromise: Promise<string> | null = null;

    private constructor() {}

    public static getInstance(): FingerprintService {
        if (!FingerprintService.instance) {
            FingerprintService.instance = new FingerprintService();
        }
        return FingerprintService.instance;
    }

    /**
     * Generate a browser fingerprint
     * @returns Promise that resolves to a unique fingerprint string
     */
    public async getFingerprint(): Promise<string> {
        if (this.fingerprint) {
            return this.fingerprint;
        }

        if (this.fpPromise) {
            return this.fpPromise;
        }

        this.fpPromise = this.generateFingerprint();
        this.fingerprint = await this.fpPromise;
        return this.fingerprint;
    }

    private async generateFingerprint(): Promise<string> {
        try {
            // Load the agent
            const fp = await FingerprintJS.load();
            
            // Get the visitor identifier
            const result = await fp.get();
            
            return result.visitorId;
        } catch (error) {
            console.error('Failed to generate fingerprint:', error);
            // Fallback to a simple fingerprint based on available browser properties
            return this.generateFallbackFingerprint();
        }
    }

    private generateFallbackFingerprint(): string {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let fingerprint = '';
        
        // Screen resolution
        fingerprint += `${screen.width}x${screen.height}x${screen.colorDepth}`;
        
        // Timezone
        fingerprint += `_${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
        
        // Language
        fingerprint += `_${navigator.language}`;
        
        // User agent (simplified)
        fingerprint += `_${navigator.userAgent.slice(0, 50)}`;
        
        // Canvas fingerprint (basic)
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Browser fingerprint', 2, 2);
            fingerprint += `_${canvas.toDataURL().slice(-50)}`;
        }
        
        // Generate a hash-like string from the fingerprint
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * Generate a storage key for a specific questionnaire
     * @param questionnaireId The questionnaire ID
     * @param fingerprint The browser fingerprint
     * @returns Storage key string
     */
    public getStorageKey(questionnaireId: string, fingerprint: string): string {
        return `questionnaire_response_${questionnaireId}_${fingerprint}`;
    }

    /**
     * Check if a response has already been submitted for this questionnaire
     * @param questionnaireId The questionnaire ID
     * @returns Promise that resolves to true if already submitted
     */
    public async hasSubmittedResponse(questionnaireId: string): Promise<boolean> {
        try {
            const fingerprint = await this.getFingerprint();
            const storageKey = this.getStorageKey(questionnaireId, fingerprint);
            
            // Check both localStorage and sessionStorage
            const localResponse = localStorage.getItem(storageKey);
            const sessionResponse = sessionStorage.getItem(storageKey);
            
            return !!(localResponse || sessionResponse);
        } catch (error) {
            console.error('Failed to check submission status:', error);
            return false;
        }
    }

    /**
     * Mark a questionnaire as submitted
     * @param questionnaireId The questionnaire ID
     * @param timestamp Optional timestamp (defaults to current time)
     */
    public async markAsSubmitted(questionnaireId: string, timestamp?: string): Promise<void> {
        try {
            const fingerprint = await this.getFingerprint();
            const storageKey = this.getStorageKey(questionnaireId, fingerprint);
            const submissionData = {
                submittedAt: timestamp || new Date().toISOString(),
                fingerprint: fingerprint.slice(0, 8) // Store only first 8 chars for privacy
            };
            
            // Store in both localStorage (persistent) and sessionStorage (session-based)
            localStorage.setItem(storageKey, JSON.stringify(submissionData));
            sessionStorage.setItem(storageKey, JSON.stringify(submissionData));
            
            console.log(`Marked questionnaire ${questionnaireId} as submitted for fingerprint ${fingerprint.slice(0, 8)}`);
        } catch (error) {
            console.error('Failed to mark questionnaire as submitted:', error);
        }
    }

    /**
     * Clear submission record for a questionnaire (admin use)
     * @param questionnaireId The questionnaire ID
     */
    public async clearSubmissionRecord(questionnaireId: string): Promise<void> {
        try {
            const fingerprint = await this.getFingerprint();
            const storageKey = this.getStorageKey(questionnaireId, fingerprint);
            
            localStorage.removeItem(storageKey);
            sessionStorage.removeItem(storageKey);
            
            console.log(`Cleared submission record for questionnaire ${questionnaireId}`);
        } catch (error) {
            console.error('Failed to clear submission record:', error);
        }
    }
}

export default FingerprintService.getInstance();
