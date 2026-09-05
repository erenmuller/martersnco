"use server";

import { z } from "zod";
import { adminReturnPath, nullableText, writeAdminAudit } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailIsLive, sendEmail } from "@/lib/email/send";
import { onboardingEmail } from "@/lib/email/onboarding";
import { complete, databaseFail, fail, firstError, uuid, value } from "./shared";

const UserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
    full_name: z.string().trim().max(160),
    role: z.enum(["admin", "client"]),
    client_id: z.string(),
  })
  .refine((data) => data.role === "admin" || uuid.safeParse(data.client_id).success, {
    message: "Choose a client for a client user.",
  });

/**
 * Where an invited user lands. The token hash is verified by /auth/callback,
 * which establishes the session and then sends them to /welcome to choose a
 * password. Built here rather than taken from Supabase's `action_link` so the
 * destination does not depend on dashboard redirect settings.
 *
 * `otpType` differs between the first invitation and a re-send: Supabase only
 * mints an `invite` token for an address it has never seen, so a second link
 * for the same person has to be a `recovery` token. Both are verified the same
 * way and both are steered to /welcome by the explicit `next`.
 */
function inviteLink(
  origin: string,
  hashedToken: string,
  otpType: "invite" | "recovery",
): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("token_hash", hashedToken);
  url.searchParams.set("type", otpType);
  url.searchParams.set("next", "/welcome");
  return url.toString();
}

function siteOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return configured || null;
}

/**
 * Send the branded onboarding message.
 *
 * Returns a sentence to append to the admin's confirmation, so the console
 * never claims an email went out when the provider is still `console` or the
 * send failed. The invited user exists either way and the invite can be
 * re-sent, so a failure here is reported rather than thrown.
 */
async function deliverOnboardingEmail(args: {
  email: string;
  actionUrl: string;
  fullName: string | null;
  organisation: string | null;
  role: "admin" | "client";
}): Promise<{ delivered: boolean; note: string }> {
  const message = onboardingEmail({
    actionUrl: args.actionUrl,
    fullName: args.fullName,
    organisation: args.organisation,
    role: args.role,
  });

  const result = await sendEmail({
    to: args.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  if (!result.ok) {
    return {
      delivered: false,
      note: "the onboarding email could not be sent — check the server logs and re-send",
    };
  }
  if (!emailIsLive()) {
    return {
      delivered: false,
      note: "email is in console mode, so the link was printed to the server log instead of sent",
    };
  }
  return { delivered: true, note: "onboarding email sent" };
}

/** The organisation name, for the greeting. Never used for authorisation. */
async function clientNameFor(clientId: string | null): Promise<string | null> {
  if (!clientId) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("clients")
    .select("name")
    .eq("id", clientId)
    .single();
  return data?.name ?? null;
}

export async function inviteUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const parsed = UserSchema.safeParse({
    email: value(formData, "email"),
    full_name: value(formData, "full_name"),
    role: value(formData, "role"),
    client_id: value(formData, "client_id"),
  });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));

  const origin = siteOrigin();
  if (!origin) {
    fail(
      returnTo,
      "NEXT_PUBLIC_SITE_URL is not set, so the invitation link would point nowhere. Set it and try again.",
    );
  }

  const admin = createAdminClient();

  // generateLink creates the auth user and hands back the token, without
  // Supabase sending anything. The message is ours — see lib/email.
  const { data: generated, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: parsed.data.email,
    options: {
      // Never put role or client_id in caller-editable user metadata. The
      // profile assignment below is the sole source of authority.
      data: { full_name: parsed.data.full_name },
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (linkError || !generated.user || !generated.properties?.hashed_token) {
    // Supabase refuses to mint an invite token for an address it already
    // knows. That is a re-send, which is a different control.
    if (/already|exists|registered/i.test(linkError?.message ?? "")) {
      fail(
        returnTo,
        `${parsed.data.email} already has an account. Use "Re-send invitation" on their row instead.`,
      );
    }
    databaseFail(
      returnTo,
      "Inviting the user",
      linkError?.message ?? "Supabase did not return an invitation token.",
    );
  }

  const userId = generated.user.id;
  const clientId = parsed.data.role === "client" ? parsed.data.client_id : null;
  const { data: assignedProfile, error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: nullableText(parsed.data.full_name),
      role: parsed.data.role,
      client_id: clientId,
      is_active: true,
    })
    .eq("id", userId)
    .select("id")
    .single();

  if (profileError || !assignedProfile) {
    const assignmentMessage = profileError?.message ?? "The invited profile was not created.";
    const { error: rollbackError } = await admin.auth.admin.deleteUser(userId);
    try {
      await writeAdminAudit(actor.id, "user.invite_rolled_back", "profile", userId, {
        email: parsed.data.email,
        reason: assignmentMessage,
        rollback_failed: Boolean(rollbackError),
      });
    } catch (auditError) {
      console.error("[admin:audit]", auditError);
    }
    databaseFail(
      returnTo,
      "Assigning the invited user",
      rollbackError
        ? `${assignmentMessage}; rollback also failed: ${rollbackError.message}`
        : assignmentMessage,
    );
  }

  // Only now, with the profile assigned, is the account real enough to email.
  const delivery = await deliverOnboardingEmail({
    email: parsed.data.email,
    actionUrl: inviteLink(origin, generated.properties.hashed_token, "invite"),
    fullName: nullableText(parsed.data.full_name),
    organisation: await clientNameFor(clientId),
    role: parsed.data.role,
  });

  await complete(
    actor.id,
    returnTo,
    `${parsed.data.email} invited — ${delivery.note}.`,
    {
      action: "user.invited",
      entity: "profile",
      entityId: userId,
      meta: {
        email: parsed.data.email,
        role: parsed.data.role,
        client_id: clientId,
        email_delivered: delivery.delivered,
      },
    },
    ["/admin", "/admin/users", ...(clientId ? [`/admin/clients/${clientId}`] : [])],
    delivery.delivered ? "notice" : "error",
  );
}

/**
 * Re-send onboarding to someone who has not signed in yet, or whose link
 * expired. Refuses once the account has been used, because at that point the
 * right control is a password reset the user asks for themselves.
 */
export async function resendInviteAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const id = value(formData, "id");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));

  const origin = siteOrigin();
  if (!origin) {
    fail(returnTo, "NEXT_PUBLIC_SITE_URL is not set, so the link would point nowhere.");
  }

  const admin = createAdminClient();
  const { data: profile, error: loadError } = await admin
    .from("profiles")
    .select("email, full_name, role, client_id, is_active")
    .eq("id", id)
    .single();
  if (loadError || !profile) databaseFail(returnTo, "Loading the user", loadError?.message);
  if (!profile.is_active) {
    fail(returnTo, "That account is not active. Re-activate it before re-sending an invitation.");
  }

  // An invite link signs the holder straight in, so it must never be issued
  // for an account that already has a password someone is using.
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  if (authUser?.user?.last_sign_in_at) {
    fail(
      returnTo,
      "That account has already been used. Ask the user to reset their own password from the sign-in page.",
    );
  }

  const { data: generated, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: profile.email,
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (linkError || !generated.properties?.hashed_token) {
    databaseFail(returnTo, "Creating a new invitation link", linkError?.message);
  }

  const delivery = await deliverOnboardingEmail({
    email: profile.email,
    actionUrl: inviteLink(origin, generated.properties.hashed_token, "recovery"),
    fullName: profile.full_name,
    organisation: await clientNameFor(profile.client_id),
    role: profile.role,
  });

  await complete(
    actor.id,
    returnTo,
    `Invitation re-sent to ${profile.email} — ${delivery.note}.`,
    {
      action: "user.invite_resent",
      entity: "profile",
      entityId: id,
      meta: { email: profile.email, email_delivered: delivery.delivered },
    },
    ["/admin", "/admin/users"],
    delivery.delivered ? "notice" : "error",
  );
}

const UserUpdateSchema = z
  .object({
    id: uuid,
    full_name: z.string().trim().max(160),
    phone_e164: z.union([
      z.literal(""),
      z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Use an E.164 phone number, such as +971501234567."),
    ]),
    role: z.enum(["admin", "client"]),
    client_id: z.string(),
    is_active: z.boolean(),
  })
  .refine((data) => data.role === "admin" || uuid.safeParse(data.client_id).success, {
    message: "Choose a client for a client user.",
  });

export async function updateUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const parsed = UserUpdateSchema.safeParse({
    id: value(formData, "id"),
    full_name: value(formData, "full_name"),
    phone_e164: value(formData, "phone_e164"),
    role: value(formData, "role"),
    client_id: value(formData, "client_id"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) fail(returnTo, firstError(parsed.error));
  if (parsed.data.id === actor.id && (!parsed.data.is_active || parsed.data.role !== "admin")) {
    fail(returnTo, "You cannot remove your own admin access.");
  }

  const clientId = parsed.data.role === "client" ? parsed.data.client_id : null;
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .update({
      full_name: nullableText(parsed.data.full_name),
      phone_e164: nullableText(parsed.data.phone_e164),
      role: parsed.data.role,
      client_id: clientId,
      is_active: parsed.data.is_active,
    })
    .eq("id", parsed.data.id)
    .select("email")
    .single();
  if (error || !profile) databaseFail(returnTo, "Updating the user", error?.message);

  await complete(
    actor.id,
    returnTo,
    "User updated.",
    {
      action: "user.updated",
      entity: "profile",
      entityId: parsed.data.id,
      meta: {
        email: profile.email,
        role: parsed.data.role,
        client_id: clientId,
        is_active: parsed.data.is_active,
      },
    },
    ["/admin", "/admin/users", ...(clientId ? [`/admin/clients/${clientId}`] : [])],
  );
}

export async function deleteUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = adminReturnPath(formData, "/admin/users");
  const id = value(formData, "id");
  const idResult = uuid.safeParse(id);
  if (!idResult.success) fail(returnTo, firstError(idResult.error));
  if (id === actor.id) fail(returnTo, "You cannot delete your own account.");

  const admin = createAdminClient();
  const { data: profile, error: loadError } = await admin
    .from("profiles")
    .select("email, role, client_id")
    .eq("id", id)
    .single();
  if (loadError || !profile) databaseFail(returnTo, "Loading the user", loadError?.message);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) databaseFail(returnTo, "Deleting the user", error.message);

  await complete(
    actor.id,
    returnTo,
    "User deleted.",
    {
      action: "user.deleted",
      entity: "profile",
      entityId: id,
      meta: { email: profile.email, role: profile.role, client_id: profile.client_id },
    },
    ["/admin", "/admin/users", ...(profile.client_id ? [`/admin/clients/${profile.client_id}`] : [])],
  );
}
