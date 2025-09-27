
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginWithEmail, loginWithGoogle, resendVerificationEmail } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false)
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = form;

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    setUnverifiedEmail(null);

    const { user, error } = await loginWithEmail(
      data.email,
      data.password,
      data.rememberMe
    );

    if (error) {
      setError(error);
      if (error === 'Please verify your email before logging in.') {
        setUnverifiedEmail(data.email);
      }
      setLoading(false);
    } else {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/admin';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { user, error } = await loginWithGoogle();

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/admin';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setLoading(true);
    setError(null);
    const { success, error } = await resendVerificationEmail(unverifiedEmail);
    setLoading(false);
    if (success) {
      toast({
        title: 'Verification Email Sent',
        description: 'A new verification email has been sent to your address.',
      });
      setUnverifiedEmail(null);
    } else {
      setError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  {error}
                  {unverifiedEmail && (
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold !text-destructive-foreground underline"
                      onClick={handleResendVerification}
                      disabled={loading}
                    >
                      Resend verification email
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                       <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            className="pl-10"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                           Remember me for 30 days
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && !unverifiedEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-gray-600 w-full">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
