"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/api";
import { Button } from "@/components/commonComponents/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/commonComponents/Card";
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineLockClosed, HiOutlineEnvelope } from "react-icons/hi2";
import { z } from "zod";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { mutate: login, isPending } = useLogin(callbackUrl);

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { email?: string; password?: string } = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as "email" | "password";
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      login({ email, password });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: undefined });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-x-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Image src="/logo.png" alt="Client Portal Logo" width={45} height={45} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Client Portal</h1>
              <p className="text-blue-100 text-sm">Datagain Services</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome Back
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Sign in to access your dashboard and manage your client projects
              with ease.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/logo.png" alt="Client Portal Logo" width={45} height={45} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Client Portal</h1>
              <p className="text-sm text-muted-foreground">Datagain Services</p>
            </div>
          </div>

          <Card className="p-4 sm:p-8 shadow-lg">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Sign In</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    disabled={isPending}
                    autoComplete="email"
                    autoFocus
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-blue-700 hover:text-blue-800 font-medium underline"
                    onClick={() => alert("Password reset functionality coming soon")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    disabled={isPending}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isPending}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <HiOutlineEyeSlash className="h-4 w-4" />
                    ) : (
                      <HiOutlineEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Submit */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-muted-foreground"
                  >
                    Remember me for 30 days
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={isPending}
                  loadingText="Signing in..."
                  size="lg"
                >
                  Sign In
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{" "}
              <button
                className="text-blue-700 hover:text-blue-800 font-medium underline"
                onClick={() => alert("Contact your administrator for access")}
              >
                Contact Administrator
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
