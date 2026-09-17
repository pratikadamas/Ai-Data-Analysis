"""Email utility to send OTPs using modern HTTP APIs (Resend, Brevo) or SMTP fallback."""
from __future__ import annotations
# 1. First, it tries the Resend API (fast, reliable).
# 2. If that fails, it automatically tries the Brevo API.
# 3. If both fail, it finally falls back to standard SMTP (if configured).
import json
import logging
import smtplib
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
    """Attempt email sending via SMTP with short timeout (5s) and automatic SSL fallback."""
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
        logger.warning(f"Primary SMTP connection ({mail_host}:{settings.mail_port}) failed: {primary_exc}. Trying port 465 SSL fallback...")

    # Port 465 SSL fallback attempt
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


def _build_email_content(username: str, otp: str, purpose: str) -> tuple[str, str, str]:
    """Build high-fidelity, device-responsive HTML and plain text email content."""
    purpose_lower = purpose.lower()
    
    if "forgot" in purpose_lower or "reset" in purpose_lower:
        subject = "AI Data Analysis - Password Reset Code"
        badge_text = "🔒 Password Reset"
        badge_bg = "#fef2f2"
        badge_color = "#b91c1c"
        purpose_intro = (
            "We received a request to reset your password for your <strong>AI Data Analysis</strong> account. "
            "Use the verification code below to set up a new password:"
        )
        purpose_action = "password reset"
    elif "reg" in purpose_lower or "sign" in purpose_lower:
        subject = "AI Data Analysis - Verify Your Email Address"
        badge_text = "✨ Email Verification"
        badge_bg = "#eff6ff"
        badge_color = "#0071e3"
        purpose_intro = (
            "Welcome to <strong>AI Data Analysis</strong>! To complete your registration and activate your account, "
            "please enter the one-time verification code below:"
        )
        purpose_action = "account registration"
    else:
        subject = f"AI Data Analysis - OTP for {purpose.capitalize()}"
        badge_text = f"🔐 {purpose.capitalize()}"
        badge_bg = "#f1f5f9"
        badge_color = "#334155"
        purpose_intro = (
            f"Please use the one-time verification code below to complete your <strong>{purpose}</strong> request:"
        )
        purpose_action = purpose

    text_content = (
        f"AI Data Analysis Portal\n\n"
        f"Hello {username},\n\n"
        f"Your one-time verification code for {purpose_action} is:\n\n"
        f"  -->  {otp}  <--\n\n"
        f"This code will expire in 15 minutes.\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"AI Data Analysis Platform • Automated Security System\n"
    )

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>{subject}</title>
  <style type="text/css">
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    body {{ margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ padding: 16px 8px !important; }}
      .email-card {{ border-radius: 12px !important; }}
      .content-padding {{ padding: 24px 18px !important; }}
      .otp-display {{ font-size: 30px !important; letter-spacing: 6px !important; padding: 14px 20px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f5f9" style="table-layout: fixed;">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 36px 12px 48px 12px;">
        
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);">
          
          <!-- Top Vibrant Accent Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #0071e3 0%, #38bdf8 50%, #6366f1 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Inner Card Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 32px 36px;">
              
              <!-- Brand Header -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <!-- App Logo Icon -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background: linear-gradient(135deg, #0071e3 0%, #0284c7 100%); width: 44px; height: 44px; border-radius: 12px; color: #ffffff; font-weight: 800; font-size: 20px; text-align: center; vertical-align: middle; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.28);">
                          AI
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 19px; font-weight: 700; color: #0f172a; margin-top: 12px; letter-spacing: -0.2px;">
                      AI Data Analysis
                    </div>
                    <div style="display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: {badge_bg}; color: {badge_color}; letter-spacing: 0.2px;">
                      {badge_text}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Greeting & Explanation -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 15px; line-height: 1.6; color: #334155;">
                    Hello <strong style="color: #0f172a;">{username}</strong>,
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; font-size: 15px; line-height: 1.6; color: #475569;">
                    {purpose_intro}
                  </td>
                </tr>
              </table>

              <!-- OTP Code Display Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 2px dashed #0071e3; border-radius: 14px;">
                      <tr>
                        <td align="center" class="otp-display" style="padding: 16px 36px;">
                          <div style="font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0071e3; line-height: 1.1;">
                            {otp}
                          </div>
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 8px; letter-spacing: 0.2px;">
                      Tap or select code to copy
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #166534; line-height: 1.5;">
                    <strong style="color: #14532d;">⏱️ Valid for 15 minutes:</strong> Please enter this code promptly before it expires.
                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; line-height: 1.5;">
                    If you did not request this code, no action is needed. Your account remains completely secure. Never share this code with anyone.
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 26px;">
                <tr>
                  <td style="border-top: 1px solid #f1f5f9;"></td>
                </tr>
              </table>

              <!-- Footer -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                    AI Data Analysis Platform &bull; Automated Security Service<br/>
                    This is an automated security email. Please do not reply.
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return subject, html_content, text_content


def send_otp_email(to_email: str, username: str, otp: str, purpose: str = "registration") -> bool:
    """Send an OTP email to the user.

    Priority order:
    1. Resend REST API (HTTPS port 443, immune to cloud firewall port blocks)
    2. Brevo REST API (HTTPS port 443)
    3. SMTP (ports 587/465, with automatic SSL port 465 fallback)
    4. Console fallback with prominent OTP banner for dev/testing.
    """
    subject, html_content, text_content = _build_email_content(username, otp, purpose)

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
        f" Outbound SMTP (ports 587 and 465) timed out or API key failed.\n"
        f" If running on Render/Cloud, add RESEND_API_KEY or BREVO_API_KEY.\n"
        f"========================================================================================\n"
    )
    return False
