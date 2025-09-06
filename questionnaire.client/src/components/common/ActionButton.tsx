import { Button, Tooltip } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

interface ActionButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
    tooltip: string;
    icon: ReactNode;
    children: ReactNode;
    size?: 'small' | 'medium' | 'large';
    variant?: 'text' | 'outlined' | 'contained';
}

const ActionButton = ({ 
    tooltip, 
    icon, 
    children, 
    size = 'small',
    variant = 'outlined',
    disabled,
    ...buttonProps 
}: ActionButtonProps) => {
    const button = (
        <Button
            startIcon={icon}
            variant={variant}
            size={size}
            disabled={disabled}
            sx={{ 
                // minHeight: 28, 
                // fontSize: '0.75rem',
                // padding: '4px 8px',
                ...buttonProps.sx
            }}
            {...buttonProps}
        >
            {children}
        </Button>
    );

    // Wrap disabled buttons in span for tooltip to work
    return (
        <Tooltip title={tooltip}>
            {disabled ? <span>{button}</span> : button}
        </Tooltip>
    );
};

export default ActionButton;
