"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { loginUser, getUser } from "@/services/user.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/user.store";
import { getOrCreateAvatarColor } from "@/lib/avatar";

function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await loginUser(formData.email, formData.password);
      
      const userData = await getUser();
      const avatarColor = getOrCreateAvatarColor(userData.data.id);
      setUser({ ...userData.data, profileColor: avatarColor });
      
      router.push("/");
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.error) {
        setErrorMsg(errorData.error);
      } else if (errorData?.message) {
        setErrorMsg(errorData.message);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Discuss</span>
          </div>
          
          <div className="space-y-6 mt-16">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Welcome back to your community
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Pick up right where you left off. Your conversations are waiting.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3 text-white/90">
            <Sparkles className="w-5 h-5 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">Stay Connected</p>
              <p className="text-sm text-white/70">Never miss a message from your friends</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-white/90">
            <Sparkles className="w-5 h-5 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">Seamless Experience</p>
              <p className="text-sm text-white/70">Access all your servers and channels instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-white/90">
            <Sparkles className="w-5 h-5 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold">Secure & Private</p>
              <p className="text-sm text-white/70">Your conversations are protected and encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold">Discuss</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground">
                Sign in to continue to your account
              </p>
            </div>

            <Card className="border-muted/40 shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in slide-in-from-top-2">
                      <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-xs text-primary hover:underline underline-offset-4"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                        required
                        className="h-11 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="font-medium text-primary hover:underline underline-offset-4 transition-all"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground px-8">
              Protected by industry-standard encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;