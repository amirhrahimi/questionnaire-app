import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// Production vite config for Docker builds
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'terser',
        terserOptions: {
            compress: {
                // Remove console logs and debugger statements
                drop_console: ['log', 'info', 'warn'],
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.warn'],
                
                // Dead code elimination
                dead_code: true,
                unused: true,
                
                // Remove unreachable code
                conditionals: true,
                evaluate: true,
                booleans: true,
                
                // Optimize loops and sequences
                loops: true,
                sequences: true,
                
                // Inline small functions and variables
                inline: 2,
                
                // Remove unnecessary parentheses and brackets
                join_vars: true,
                
                // Optimize comparison operations
                comparisons: true,
                
                // Drop unreferenced functions and variables
                pure_getters: true,
                
                // Additional optimizations
                reduce_vars: true,
                collapse_vars: true,
                hoist_funs: true,
                hoist_vars: true,
                
                // Side-effect-free function calls
                side_effects: false,
                
                // Remove assertions and type checks (if you use them)
                passes: 3 // Multiple passes for better optimization
            },
            mangle: {
                // Keep class names readable for debugging
                keep_classnames: false,
                // Keep function names readable for debugging  
                keep_fnames: false
            },
            format: {
                // Remove comments
                comments: false,
                // Compact output
                beautify: false,
                // Remove unnecessary semicolons
                semicolons: false
            }
        },
        // Additional build optimizations
        rollupOptions: {
            output: {
                // Manual chunking for better caching
                manualChunks: {
                    // Core React libraries
                    vendor: ['react', 'react-dom'],
                    
                    // Material-UI and related styling libraries
                    mui: [
                        '@mui/material', 
                        '@mui/icons-material', 
                        '@mui/x-data-grid',
                        '@emotion/react',
                        '@emotion/styled'
                    ],
                    
                    // Routing library
                    router: ['react-router-dom'],
                    
                    // HTTP client and utilities
                    utils: [
                        'axios', 
                        'js-cookie'
                    ],
                    
                    // Authentication and OAuth
                    auth: ['@react-oauth/google'],
                    
                    // UI utilities and fonts
                    ui: [
                        '@fontsource/roboto',
                        'qrcode'
                    ]
                }
            }
        },
        // Enable source maps for production debugging (optional)
        sourcemap: false,
        // Optimize chunk size
        chunkSizeWarningLimit: 1000
    }
});
