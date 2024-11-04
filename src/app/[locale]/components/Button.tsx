import React from 'react'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  rounded?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  rounded = false,
  className,
  ...props
}) => {

  const sizeStyles = {
    small: 'px-2 py-2 text-sm',
    medium: 'px-4 py-2 text-base font-semibold',
    large: 'px-6 py-3 text-lg font-semibold'
  }

  const baseStyles = `transition-transform duration-200 ease-in-out focus:outline-none focus:shadow-outline cursor-pointer ${rounded ? 'rounded-full' : 'rounded' }`;
  
  const variantStyles = {
    primary: 'bg-button text-button-text hover:bg-button-hover active:scale-95',
    secondary: 'bg-button-secondary text-secondary ring-secondary ring-2 hover:bg-button-secondary-hover active:scale-95',
  }

  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

  return (
    <button className={buttonStyles} {...props}>
      {children}
    </button>
  )
}

export default Button;
