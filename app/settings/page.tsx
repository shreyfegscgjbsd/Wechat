import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CustomUserMenu } from "@/components/custom-user-menu";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Globe, User, AtSign, Palette, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const user = useUser();
  if (!user.user) redirect("/");

  const u = user.user;
  const email = u.emailAddresses[0]?.emailAddress ?? "";
  const phone = u.phoneNumbers[0]?.phoneNumber ?? "";
  const external = u.externalAccounts[0]?.provider ?? "Email";

  return (
    <div className="p-4 max-w-2xl space-y-6">
      <h2 className="font-semibold text-lg">Settings</h2>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium mb-4">Profile</h3>
        <div className="flex items-start gap-4">
          <Avatar
            src={u.imageUrl ?? null}
            alt={u.fullName ?? "User"}
            size="xl"
          />
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Display name</label>
              <p className="font-medium">{u.fullName ?? "Not set"}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Username</label>
              <p className="font-medium">@{u.username ?? "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium mb-4">Account Info</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{email || "No email"}</p>
            </div>
            {u.emailAddresses[0]?.verification?.status === "verified" && (
              <Badge variant="success">Verified</Badge>
            )}
          </div>
          {phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sign-in method</p>
              <p className="text-sm text-muted-foreground">{external}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium mb-2">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Light and dark themes. Use the theme toggle in your profile menu.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-medium mb-2">About PulseChat</h3>
        <p className="text-sm text-muted-foreground">
          PulseChat is a private, real-time messaging app built with Next.js,
          Clerk, Prisma, and WebRTC.
        </p>
      </div>
    </div>
  );
}