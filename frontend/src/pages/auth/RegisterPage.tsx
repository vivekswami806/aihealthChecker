import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { toast } from 'sonner';
import { setUser } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';

const API_URL = import.meta.env.VITE_API_URL;

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (formData.password !== formData.confirmPassword) {
        return toast.error('Passwords do not match');
      }
  
      if (!formData.terms) {
        return toast.error('Please accept terms and conditions');
      }
  
      setLoading(true);
  
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        }
      );
  
      const { user, accessToken, refreshToken } = response.data.data;
  
      toast.success(response.data.message || 'Account created successfully');
  
      // Save tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
  
      // Set Redux user
      dispatch(
        setUser({
          id: user.id,
          name: user.fullName || user.full_name,
          email: user.email,
          role: user.role,
          avatar: '',
        })
      );
  
      // 🔥 IMPORTANT: redirect AFTER login, not login page
      navigate('/dashboard');
  
    } catch (error: any) {
      console.error(error);
  
      toast.error(
        error?.response?.data?.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">
          Create an account
        </h1>

        <p className="text-muted-foreground">
          Start your personalized health
          journey today
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleRegister}
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full Name
          </Label>

          <Input
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">
            Password
          </Label>

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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password
          </Label>

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="terms"
            checked={formData.terms}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                terms: checked as boolean,
              }))
            }
          />

          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none"
          >
            I agree to the{' '}
            <Link
              to="/terms"
              className="text-primary hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-lg shadow-lg shadow-primary/20"
        >
          {loading
            ? 'Creating Account...'
            : 'Create Account'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() =>
            window.location.href =
              `${API_URL}/auth/google`
          }
        >
          Google
        </Button>

        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() =>
            window.location.href =
              `${API_URL}/auth/github`
          }
        >
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in instead
        </Link>
      </p>
    </div>
  );
}