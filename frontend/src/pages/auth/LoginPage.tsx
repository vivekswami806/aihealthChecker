import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';

import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: '',
      password: '',
      remember: false,
    });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(response.data);

      /**
       * Your API response structure
       */
      const {
        success,
        message,
        data,
      } = response.data;

      if (!success) {
        return toast.error(
          message || 'Login failed'
        );
      }

      /**
       * Save Tokens
       */
      localStorage.setItem(
        'accessToken',
        data.accessToken
      );

      localStorage.setItem(
        'refreshToken',
        data.refreshToken
      );

      dispatch(
        setUser({
          id: data.user.id,
          name: data.user.full_name,
          email: data.user.email,
          role: data.user.role,
          avatar: ''
        })
      );

      toast.success(
        message || 'Login successful'
      );

      navigate('/dashboard');

    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">
          Sign in
        </h1>

        <p className="text-muted-foreground">
          Enter your credentials to access
          your dashboard
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleLogin}
      >
        {/* EMAIL */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email address
          </Label>

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Password
            </Label>

            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>

        {/* REMEMBER ME */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                remember:
                  checked as boolean,
              }))
            }
          />

          <Label
            htmlFor="remember"
            className="text-sm font-medium"
          >
            Remember me for 30 days
          </Label>
        </div>

        {/* LOGIN BUTTON */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-lg shadow-lg shadow-primary/20"
        >
          {loading
            ? 'Signing In...'
            : 'Sign In'}
        </Button>
      </form>

      {/* DIVIDER */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* OAUTH */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() => {
            window.location.href =
              `${API_URL}/auth/google`;
          }}
        >
          Google
        </Button>

        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() => {
            window.location.href =
              `${API_URL}/auth/github`;
          }}
        >
          GitHub
        </Button>
      </div>

      {/* REGISTER */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="font-medium text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}