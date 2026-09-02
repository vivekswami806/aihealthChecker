import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Smartphone,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Moon,
  Sun,
  Settings,
  Download,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { logout, setUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const NOTIF_PREFS_KEY = 'healthai_notification_prefs';
const PRIVACY_PREFS_KEY = 'healthai_privacy_prefs';
const TWO_FA_KEY = 'healthai_2fa_enabled';

const defaultNotifPrefs = {
  analysisStatus: true,
  medicationReminders: true,
  healthInsights: false,
  marketingEmails: false,
};

const defaultPrivacyPrefs = {
  publicProfile: false,
  researchSharing: true,
};

export default function UserSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState('profile');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFA, setTwoFA] = useState(
    () => localStorage.getItem(TWO_FA_KEY) === 'true'
  );

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return {
        ...defaultNotifPrefs,
        ...JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || '{}'),
      };
    } catch {
      return defaultNotifPrefs;
    }
  });

  const [privacyPrefs, setPrivacyPrefs] = useState(() => {
    try {
      return {
        ...defaultPrivacyPrefs,
        ...JSON.parse(localStorage.getItem(PRIVACY_PREFS_KEY) || '{}'),
      };
    } catch {
      return defaultPrivacyPrefs;
    }
  });

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: authHeaders(),
        });
        const profile = response.data?.data;
        if (profile) {
          setFullName(profile.fullName || '');
          setEmail(profile.email || '');
          setProfileImage(profile.profileImage || '');
          dispatch(
            setUser({
              id: profile.id,
              name: profile.fullName || '',
              email: profile.email || '',
              avatar: profile.profileImage || '',
              role: (profile.role || 'user').toLowerCase() === 'admin' ? 'admin' : 'user',
            })
          );
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load profile');
        if (authUser) {
          setFullName(authUser.name || '');
          setEmail(authUser.email || '');
          setProfileImage(authUser.avatar || '');
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistNotifPrefs = (next: typeof defaultNotifPrefs) => {
    setNotifPrefs(next);
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(next));
  };

  const persistPrivacyPrefs = (next: typeof defaultPrivacyPrefs) => {
    setPrivacyPrefs(next);
    localStorage.setItem(PRIVACY_PREFS_KEY, JSON.stringify(next));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const response = await axios.put(
        `${API_URL}/users/profile`,
        { fullName, email },
        { headers: authHeaders() }
      );
      const updated = response.data?.data;
      if (updated) {
        setFullName(updated.fullName || fullName);
        setEmail(updated.email || email);
        setProfileImage(updated.profileImage || profileImage);
        dispatch(
          setUser({
            id: updated.id,
            name: updated.fullName || fullName,
            email: updated.email || email,
            avatar: updated.profileImage || profileImage,
            role: authUser?.role || 'user',
          })
        );
      }
      toast.success('Profile settings updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/users/account`, {
        headers: authHeaders(),
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(logout());
      toast.success('Account deleted successfully');
      navigate('/auth/register');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleUpdatePassword = async () => {
    if (!localStorage.getItem('accessToken')) {
      toast.error('Authentication required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    try {
      setLoadingPassword(true);
      await axios.put(
        `${API_URL}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: authHeaders() }
      );
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    try {
      setTwoFA(checked);
      await axios.patch(
        `${API_URL}/users/2fa`,
        { enabled: checked },
        { headers: authHeaders() }
      );
      localStorage.setItem(TWO_FA_KEY, String(checked));
      toast.success(checked ? '2FA enabled' : '2FA disabled');
    } catch {
      setTwoFA(!checked);
      toast.error('Failed to update 2FA');
    }
  };

  const sections = [
    { id: 'profile', icon: User, label: 'Personal Info' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'privacy', icon: ShieldCheck, label: 'Privacy' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
  ];

  const renderContent = () => {
    if (loadingProfile && activeTab === 'profile') {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and how we should address you.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8 py-4 border-y border-dashed border-muted-foreground/20">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-primary/20 p-1">
                    <AvatarImage
                      src={
                        profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || 'User')}`
                      }
                    />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full border-4 border-background flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-bold leading-tight">
                    {fullName || 'Your Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                onSubmit={handleSaveProfile}
              >
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="h-12 px-8 rounded-xl bg-primary shadow-lg shadow-primary/20"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Profile changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdatePassword}
                  disabled={loadingPassword}
                  className="h-12 px-8 rounded-xl bg-primary"
                >
                  {loadingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>

              <div className="border-t pt-8 space-y-4">
                <h3 className="font-bold text-lg">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="flex gap-4">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-bold text-sm">SMS Verification</h4>
                      <p className="text-xs text-muted-foreground">
                        Receive a code via SMS to log in.
                      </p>
                    </div>
                  </div>
                  <Switch checked={twoFA} onCheckedChange={handleToggle2FA} />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              {[
                {
                  key: 'analysisStatus' as const,
                  title: 'Analysis Status',
                  desc: 'Get notified when your reports are analyzed.',
                },
                {
                  key: 'medicationReminders' as const,
                  title: 'Medication Reminders',
                  desc: 'Daily reminders for your prescribed medication.',
                },
                {
                  key: 'healthInsights' as const,
                  title: 'Health Insights',
                  desc: 'Weekly summaries of your health trends.',
                },
                {
                  key: 'marketingEmails' as const,
                  title: 'Marketing Emails',
                  desc: 'News about new features and health tips.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all"
                >
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[item.key]}
                    onCheckedChange={(checked) => {
                      const next = { ...notifPrefs, [item.key]: checked };
                      persistNotifPrefs(next);
                      toast.success('Preference saved');
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 'billing':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Subscription & Billing</CardTitle>
              <CardDescription>Manage your plan and payment methods.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex justify-between items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground mb-2">
                    PRO PLAN
                  </Badge>
                  <h3 className="font-black text-2xl font-mono">$19.99/mo</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage billing from your account portal.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold">
                  Manage Plan
                </Button>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold">Payment Methods</h4>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">No card on file</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'privacy':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data ownership and visibility settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-sm">Public Health Profile</h4>
                    <p className="text-xs text-muted-foreground">
                      Allow verified doctors to search for your profile.
                    </p>
                  </div>
                  <Switch
                    checked={privacyPrefs.publicProfile}
                    onCheckedChange={(checked) => {
                      const next = { ...privacyPrefs, publicProfile: checked };
                      persistPrivacyPrefs(next);
                      toast.success('Preference saved');
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-sm">Data Sharing for Research</h4>
                    <p className="text-xs text-muted-foreground">
                      Share anonymized data to help medical AI research.
                    </p>
                  </div>
                  <Switch
                    checked={privacyPrefs.researchSharing}
                    onCheckedChange={(checked) => {
                      const next = { ...privacyPrefs, researchSharing: checked };
                      persistPrivacyPrefs(next);
                      toast.success('Preference saved');
                    }}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-bold mb-4">Data Export</h4>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold h-12"
                  onClick={() =>
                    toast.info('Data export initiated. Check your email soon.')
                  }
                >
                  <Download className="h-4 w-4" /> Download All My Health Data
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="px-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Manage your health data, security, and application preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 space-y-2 shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold ${
                activeTab === s.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <s.icon className="h-5 w-5" />
                <span>{s.label}</span>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-all ${
                  activeTab === s.id ? 'opacity-100 translate-x-1' : 'opacity-0'
                }`}
              />
            </button>
          ))}
          <div className="pt-4 border-t mt-4">
            <Button
              variant="ghost"
              className="w-full flex justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl font-bold"
              onClick={() => {
                dispatch(logout());
                navigate('/auth/login');
              }}
            >
              <LogOut className="h-5 w-5" /> Logout
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-8 px-2 lg:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          {activeTab === 'profile' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">Application Preferences</CardTitle>
                <CardDescription>
                  Customize how you interact with HealthAI Pro.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border shadow-sm">
                      {mode === 'dark' ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Dark Theme</h4>
                      <p className="text-xs text-muted-foreground">
                        Adjust the look of the application.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={mode === 'dark'}
                    onCheckedChange={() => dispatch(toggleTheme())}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="rounded-[2.5rem] border-2 border-destructive/20 shadow-sm overflow-hidden bg-destructive/5">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-background rounded-2xl border border-destructive/10">
                  <div>
                    <h4 className="font-bold text-sm text-destructive">
                      Delete Account
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      Permanently remove all your reports and health data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="rounded-xl px-6 h-10 shadow-lg shadow-destructive/20 font-bold"
                    onClick={handleDeleteAccount}
                  >
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
