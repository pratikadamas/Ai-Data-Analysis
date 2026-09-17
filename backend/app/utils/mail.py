"""Email utility to send OTPs using modern HTTP APIs (Resend, Brevo) or SMTP fallback."""
from __future__ import annotations

import json
import logging
import smtplib
import socket
import urllib.error
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def _send_via_resend(
    api_key: str,
    from_email: str,
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> bool:
    """Send an email using Resend REST API over HTTPS port 443.

    This bypasses SMTP port blocking on cloud hosts like Render, AWS, and DigitalOcean.
    """
    url = "https://api.resend.com/emails"

    # Resend requires a verified domain sender or onboarding@resend.dev for test
    sender = from_email if ("@" in from_email and not from_email.endswith("@gmail.com")) else "AI Data Analyst <onboarding@resend.dev>"

    payload = {
        "from": sender,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
        "text": text_content,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
            "User-Agent": "ai-data-analyst/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info(f"Successfully delivered OTP email to {to_email} via Resend HTTP API.")
                return True
            logger.warning(f"Resend HTTP API returned unexpected status {resp.status}")
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        logger.error(f"Resend HTTP API error {exc.code}: {err_body}")
    except Exception as exc:
        logger.error(f"Failed to deliver email via Resend API: {exc}")
    return False


def _send_via_brevo(
    api_key: str,
    from_email: str,
    to_email: str,
    username: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> bool:
    """Send an email using Brevo (formerly Sendinblue) REST API over HTTPS port 443."""
    url = "https://api.brevo.com/v3/smtp/email"
    sender_email = from_email or "no-reply@ai-data-analyst.com"

    payload = {
        "sender": {"email": sender_email, "name": "AI Data Analyst"},
        "to": [{"email": to_email, "name": username}],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "api-key": api_key.strip(),
            "Content-Type": "application/json",
            "User-Agent": "ai-data-analyst/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info(f"Successfully delivered OTP email to {to_email} via Brevo HTTP API.")
                return True
            logger.warning(f"Brevo HTTP API returned status {resp.status}")
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        logger.error(f"Brevo HTTP API error {exc.code}: {err_body}")
    except Exception as exc:
        logger.error(f"Failed to deliver email via Brevo API: {exc}")
    return False


def _send_via_smtp(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> bool:
    """Attempt email sending via SMTP with short timeout (5s) so the thread does not hang."""
    if not settings.mail_username or not settings.mail_password:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.mail_from or settings.mail_username
    msg["To"] = to_email
    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    mail_host = settings.mail_server

    # Primary SMTP connection attempt
    try:
        if settings.mail_ssl_tls or settings.mail_port == 465:
            server = smtplib.SMTP_SSL(mail_host, settings.mail_port, timeout=5)
        else:
            server = smtplib.SMTP(mail_host, settings.mail_port, timeout=5)
            if settings.mail_starttls:
                server.starttls()

        server.login(settings.mail_username, settings.mail_password)
        server.sendmail(settings.mail_from or settings.mail_username, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully delivered OTP email to {to_email} via SMTP ({mail_host}:{settings.mail_port}).")
        return True
    except Exception as primary_exc:
        logger.warning(f"Primary SMTP connection ({mail_host}:{settings.mail_port}) failed: {primary_exc}. Trying port 465 SSL...")

    # Port 465 fallback attempt
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=5)
        server.login(settings.mail_username, settings.mail_password)
        server.sendmail(settings.mail_from or settings.mail_username, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully delivered OTP email to {to_email} via SMTP SSL port 465 fallback.")
        return True
    except Exception as fallback_exc:
        logger.warning(f"Secondary SMTP SSL port 465 fallback also failed: {fallback_exc}")

    return False


def send_otp_email(to_email: str, username: str, otp: str, purpose: str = "registration") -> bool:
    """Send an OTP email to the user.

    Priority order:
    1. Resend REST API (HTTPS port 443, immune to cloud firewall port blocks)
    2. Brevo REST API (HTTPS port 443)
    3. SMTP (ports 587/465, works on local networks where SMTP is not blocked)
    4. Console fallback with prominent OTP banner for dev/testing.
    """
    subject = f"AI Data Analysis - OTP for {purpose.capitalize()}"
    text_content = (
        f"Hello {username},\n\n"
        f"Your verification code for {purpose} is: {otp}\n\n"
        f"This code will expire in 15 minutes. If you did not request this, please ignore this email."
    )

    html_content = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; padding: 24px; margin: 0; color: #f8fafc;">
        <div style="max-width: 540px; margin: 0 auto; background: #1e293b; padding: 36px 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0071e3, #38bdf8); color: #ffffff; font-weight: bold; font-size: 20px;">AI</div>
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 12px 0 4px 0;">AI Data Analysis Portal</h2>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Automated Verification Service</p>
          </div>
          <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6;">Hello <strong style="color: #ffffff;">{username}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Please use the one-time verification code below to complete your <strong>{purpose}</strong> request:</p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 14px 28px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.25); display: inline-block;">
              {otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; text-align: center; margin: 20px 0 0 0;">This code expires in <strong>15 minutes</strong>. Never share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 28px 0 20px 0;" />
          <p style="color: #475569; font-size: 11px; text-align: center; margin: 0;">AI Data Analysis Platform &bull; Secure Authentication</p>
        </div>
      </body>
    </html>
    """

    # 1. Try Resend HTTP REST API
    if settings.resend_api_key:
        if _send_via_resend(settings.resend_api_key, settings.mail_from, to_email, subject, html_content, text_content):
            return True

    # 2. Try Brevo HTTP REST API
    if settings.brevo_api_key:
        if _send_via_brevo(settings.brevo_api_key, settings.mail_from, to_email, username, subject, html_content, text_content):
            return True

    # 3. Try SMTP (if credentials configured)
    if settings.mail_username and settings.mail_password:
        if _send_via_smtp(to_email, subject, html_content, text_content):
            return True

    # 4. Fallback / Diagnostic Alert (impossible to miss in logs)
    logger.error(
        f"\n"
        f"========================================================================================\n"
        f" [OTP DELIVERY FAILURE - ACTION REQUIRED]\n"
        f" Recipient : {to_email}\n"
        f" Username  : {username}\n"
        f" Purpose   : {purpose.upper()}\n"
        f" OTP CODE  : {otp}\n"
        f"----------------------------------------------------------------------------------------\n"
        f" WHY IT FAILED: Outbound SMTP (ports 587 and 465) timed out.\n"
        f"   - Render, AWS, and DigitalOcean block outbound SMTP ports 25, 465, and 587 by default.\n"
        f"   - Many local ISPs / firewalls also block outbound port 587/465.\n"
        f" HOW TO FIX (Choose ONE):\n"
        f"   1. Recommended: Sign up at https://resend.com (free 3,000 emails/mo) and set\n"
        f"      RESEND_API_KEY=re_xxxx in your backend .env or Render Environment Variables.\n"
        f"      (Resend uses HTTPS port 443 which is NEVER blocked on Render or ISPs)\n"
        f"   2. Or set BREVO_API_KEY=xkeysib-xxxx from https://brevo.com (300 free emails/day).\n"
        f"========================================================================================\n"
    )
    return False
