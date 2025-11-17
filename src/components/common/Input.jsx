/**
 * ============================================
 * COMPONENTE: INPUT
 * Campo de entrada reutilizable
 * ============================================
 */

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  icon = null,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{icon}</span>
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseStyles} ${errorStyles} ${disabledStyles} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
