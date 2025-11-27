import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../AuthContext";

export function AccountPage() {
  const { user, loading, login, register, logout } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setActiveTab("login");
  }, [user]);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(registerName, registerEmail, registerPassword);
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } catch (err: any) {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Checking session...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center space-y-2 mb-8">
          <h1>Account</h1>
          <p className="text-muted-foreground">Sign in or create an account to save your tracks</p>
        </div>

        <Card className="p-6">
          {user ? (
            <div className="space-y-4 text-center">
              <p>
                Welcome, {user.name} ({user.email})
              </p>
              <Button onClick={onLogout} className="w-full" disabled={busy}>
                Logout
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={onLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={onRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Name</Label>
                    <Input id="register-name" type="text" placeholder="Your name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="your@email.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input id="register-password" type="password" placeholder="••••••••" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
}
