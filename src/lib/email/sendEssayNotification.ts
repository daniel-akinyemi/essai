import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const from = 'onboarding@resend.dev';

export async function sendEssayNotification(to: string, essayTopic: string) {
  // Force all emails to go to your own address in Resend testing mode
  // Remove this override when you have a custom domain and want to send to real users
  to = 'adekoyesuccess478@gmail.com';
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 32px; border-radius: 12px;">
        <h2 style="color: #6d28d9;">Your Essay is Ready!</h2>
        <p>Hi there,</p>
        <p>Your essay on <strong>${essayTopic}</strong> has been successfully generated.</p>
        <a href="${appUrl}/dashboard" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: linear-gradient(90deg, #6366f1, #a21caf); color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
        <p style="color: #888; font-size: 14px;">Thank you for using Essai!</p>
      </div>
    `;
    const text = `Your essay on ${essayTopic} is ready! Visit your dashboard: ${appUrl}/dashboard`;
    const result = await resend.emails.send({
      from,
      to,
      subject: 'Your Essay Was Scored! 🎯',
      html,
      text,
    });
    if (result.error) {
      console.error('Resend essay email error:', result.error);
    } else {
      console.log('Essay notification email sent:', result);
    }
    return result;
  } catch (error) {
    console.error('Failed to send essay notification email:', error);
  }
}

export async function sendWelcomeEmail(to: string) {
  // Force all emails to go to your own address in Resend testing mode
  // Remove this override when you have a custom domain and want to send to real users
  to = 'adekoyesuccess478@gmail.com';
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 32px; border-radius: 12px;">
        <h2 style="color: #6d28d9;">Welcome to Essai! 🎉</h2>
        <p>Hi there,</p>
        <p>We're excited to have you on board. Start generating and improving your essays with AI-powered tools.</p>
        <a href="${appUrl}/dashboard" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: linear-gradient(90deg, #6366f1, #a21caf); color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
        <p style="color: #888; font-size: 14px;">Happy writing!<br/>The Essai Team</p>
      </div>
    `;
    const text = `Welcome to Essai! Start writing: ${appUrl}/dashboard`;
    const result = await resend.emails.send({
      from,
      to,
      subject: 'Welcome to Essai! 🎉',
      html,
      text,
    });
    if (result.error) {
      console.error('Resend welcome email error:', result.error);
    } else {
      console.log('Welcome email sent:', result);
    }
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
} 