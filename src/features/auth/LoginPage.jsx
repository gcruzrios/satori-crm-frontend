import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/api';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const schema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Email no válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await login(values);
      const redirect = params.get('redirect');
      navigate(redirect && redirect.startsWith('/') ? redirect : '/dashboard', {
        replace: true,
      });
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
          Iniciar sesión
        </h1>
        <p className="mt-1.5 text-theme-sm text-gray-500 dark:text-gray-400">
          Ingresa tu correo y contraseña para acceder al CRM.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-theme-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field label="Email" required error={errors.email?.message}>
          {(id) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@clinicasatori.com"
              invalid={!!errors.email}
              {...register('email')}
            />
          )}
        </Field>

        <Field label="Contraseña" required error={errors.password?.message}>
          {(id) => (
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pr-11"
                invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          )}
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2.5 text-theme-sm text-gray-600 dark:text-gray-400">
            <Checkbox defaultChecked />
            Mantener sesión iniciada
          </label>
          <Link
            to="#"
            className="text-theme-sm text-brand-500 hover:text-brand-600"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          <LogIn className="size-4" />
          Ingresar
        </Button>
      </form>
    </div>
  );
}

export default LoginPage;
