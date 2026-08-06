import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  Eye,
  Globe,
  CreditCard,
  Smartphone,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Moon,
  Sun,
  Settings,
  Download
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
import { logout } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserSettings() {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const [activeTab, setActiveTab] = React.useState('profile');
  const [loading, setLoading] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFA, setTwoFA] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully!');
  };

  const sections = [
    { id: 'profile', icon: User, label: "Personal Info" },
    { id: 'security', icon: Lock, label: "Security" },
    { id: 'notifications', icon: Bell, label: "Notifications" },
    { id: 'privacy', icon: ShieldCheck, label: "Privacy" },
    { id: 'billing', icon: CreditCard, label: "Billing" },
  ];



const API_URL = import.meta.env.VITE_API_URL;

const navigate = useNavigate();

const handleDeleteAccount = async () => {
  try {
    const token = localStorage.getItem('accessToken');

    await axios.delete(`${API_URL}/users/account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    toast.success('Account deleted successfully');

    navigate('/auth/register');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete account');
  }
};

const handleUpdatePassword = async () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    toast.error('Authentication required');
    return;
  }

  if (
    passwordData.newPassword !==
    passwordData.confirmPassword
  ) {
    toast.error('Passwords do not match');
    return;
  }

  try {
    setLoading(true);

    await axios.put(
      `${API_URL}/users/change-password`,
      {
        currentPassword:
          passwordData.currentPassword,
        newPassword:
          passwordData.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(
      'Password updated successfully'
    );

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      'Failed to update password'
    );
  } finally {
    setLoading(false);
  }
};
const toggle2FA = async (
  enabled: boolean,
  token: string
) => {
  const response = await axios.patch(
    `${API_URL}/users/2fa`,
    {
      enabled,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
const handleToggle2FA = async (checked: boolean) => {
  const token = localStorage.getItem('accessToken');

  try {
    setTwoFA(checked); // optimistic UI

    await toggle2FA(checked, token!);

    toast.success(
      checked ? '2FA enabled' : '2FA disabled'
    );
  } catch (err) {
    setTwoFA(!checked); // rollback on error
    toast.error('Failed to update 2FA');
  }
};

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Update your personal details and how we should address you.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8 py-4 border-y border-dashed border-muted-foreground/20">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-primary/20 p-1">
                    <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full border-4 border-background flex items-center justify-center hover:scale-110 transition-transform">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-bold leading-tight">{user?.name || "Dr. Alex Carter"}</h3>
                  <p className="text-sm text-muted-foreground">Premium Member since January 2024</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg h-8">Change Avatar</Button>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 text-destructive">Remove</Button>
                  </div>
                </div>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveProfile}>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" defaultValue={user?.name} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={user?.email} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Intro/Bio (Optional)</Label>
                  <textarea className="w-full bg-muted/30 border border-input rounded-xl p-4 min-h-[100px] outline-none" placeholder="A short bio about yourself..." />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" className="h-12 px-8 rounded-xl bg-primary shadow-lg shadow-primary/20">Save Profile changes</Button>
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
    
            {/* PASSWORD SECTION */}
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
                  />
                </div>
    
              </div>
    
              <Button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="h-12 px-8 rounded-xl bg-primary"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
    
            </div>
    
            {/* 2FA SECTION */}
            <div className="border-t pt-8 space-y-4">
              <h3 className="font-bold text-lg">
                Two-Factor Authentication
              </h3>
    
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
    
                <div className="flex gap-4">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-bold text-sm">
                      SMS Verification
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Receive a code via SMS to log in.
                    </p>
                  </div>
                </div>
    
                <Switch
                  checked={twoFA}
                  onCheckedChange={handleToggle2FA}
                />
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
              <CardDescription>Control how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              {[
                { title: "Analysis Status", desc: "Get notified when your reports are analyzed.", active: true },
                { title: "Medication Reminders", desc: "Daily reminders for your prescribed medication.", active: true },
                { title: "Health Insights", desc: "Weekly summaries of your health trends.", active: false },
                { title: "Marketing Emails", desc: "News about new features and health tips.", active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.active} />
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
                  <Badge className="bg-primary text-primary-foreground mb-2">PRO PLAN</Badge>
                  <h3 className="font-black text-2xl font-mono">$19.99/mo</h3>
                  <p className="text-sm text-muted-foreground">Next billing date: June 14, 2024</p>
                </div>
                <Button variant="outline" className="rounded-xl font-bold">Manage Plan</Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold">Payment Methods</h4>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Visa ending in 4242</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary font-bold">Edit</Button>
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
              <CardDescription>Manage your data ownership and visibility settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-sm">Public Health Profile</h4>
                    <p className="text-xs text-muted-foreground">Allow verified doctors to search for your profile.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-sm">Data Sharing for Research</h4>
                    <p className="text-xs text-muted-foreground">Share anonymized data to help medical AI research.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-bold mb-4">Data Export</h4>
                <Button variant="outline" className="w-full rounded-xl gap-2 font-bold h-12" onClick={() => toast.info('Data export initiated. Check your email soon.')}>
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
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Account Settings</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage your health data, security, and application preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 space-y-2 shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-bold ${activeTab === s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <div className="flex items-center gap-3">
                <s.icon className="h-5 w-5" />
                <span>{s.label}</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-all ${activeTab === s.id ? 'opacity-100 translate-x-1' : 'opacity-0'}`} />
            </button>
          ))}
          <div className="pt-4 border-t mt-4">
            <Button
              variant="ghost"
              className="w-full flex justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl font-bold"
              onClick={() => dispatch(logout())}
            >
              <LogOut className="h-5 w-5" /> Logout
            </Button>
          </div>
        </div>

        {/* Content Area */}
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

          {/* Theme & Prefs (Show always or in specific tab?) Let's show in dynamic content */}
          {activeTab === 'profile' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">Application Preferences</CardTitle>
                <CardDescription>Customize how you interact with HealthAI Pro.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border shadow-sm">
                      {mode === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Dark Theme</h4>
                      <p className="text-xs text-muted-foreground"> Adjust the look of the application.</p>
                    </div>
                  </div>
                  <Switch checked={mode === 'dark'} onCheckedChange={() => dispatch(toggleTheme())} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="rounded-[2.5rem] border-2 border-destructive/20 shadow-sm overflow-hidden bg-destructive/5">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-background rounded-2xl border border-destructive/10">
                  <div>
                    <h4 className="font-bold text-sm text-destructive">Delete Account</h4>
                    <p className="text-xs text-muted-foreground font-medium">Permanently remove all your reports and health data.</p>
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


