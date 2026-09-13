"""Email utility to send OTPs using SMTP."""
from __future__ import annotations

import logging
import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)


def _get_ipv4_host(host: str, port: int) -> str:
    """Resolve host to IPv4 address to prevent Errno 101 Network Unreachable on IPv6-disabled cloud containers."""
    try:
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        if infos:
            return infos[0][4][0]
    except Exception:
        pass
    return host


def send_otp_email(to_email: str, username: str, otp: str, purpose: str = "registration") -> bool:
    """Send an OTP email to the user using SMTP. Fallbacks to IPv4 and SSL if primary connection fails."""
    subject = f"AI Data Analysis - OTP for {purpose.capitalize()}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
          <h2 style="color: #3366ff; margin-top: 0;">AI Data Analysis Portal</h2>
          <p style="color: #4b5563; font-size: 16px;">Hello <strong>{username}</strong>,</p>
          <p style="color: #4b5563; font-size: 16px;">You requested an OTP verification for <strong>{purpose}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1c3cad; background-color: #eef4ff; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              {otp}
            </span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eef2f6; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">AI Data Analysis Team</p>
        </div>
      </body>
    </html>
    """

    if not settings.mail_username or not settings.mail_password:
        logger.info("SMTP details missing. Skipping email send (logged only).")
        return True

    # Resolve IPv4 host to avoid IPv6 unreachable errors on Render
    server_host = _get_ipv4_host(settings.mail_server, settings.mail_port)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.mail_from
    msg["To"] = to_email

    text_part = MIMEText(f"Hello {username},\n\nYour OTP code for {purpose} is: {otp}\n\nThis code expires in 15 minutes.", "plain")
    html_part = MIMEText(html_content, "html")
    msg.attach(text_part)
    msg.attach(html_part)

    # Attempt Primary Connection Method
    try:
        if settings.mail_ssl_tls or settings.mail_port == 465:
            server = smtplib.SMTP_SSL(server_host, settings.mail_port, timeout=12)
        else:
            server = smtplib.SMTP(server_host, settings.mail_port, timeout=12)
            if settings.mail_starttls:
                server.starttls()
        
        server.login(settings.mail_username, settings.mail_password)
        server.sendmail(settings.mail_from, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent OTP email to {to_email}")
        return True

    except Exception as primary_exc:
        logger.warning(f"Primary SMTP connection ({settings.mail_server}:{settings.mail_port}) failed: {primary_exc}. Attempting SSL fallback on port 465...")

        # Fallback Connection Attempt: SSL on Port 465
        try:
            fallback_host = _get_ipv4_host("smtp.gmail.com", 465)
            server = smtplib.SMTP_SSL(fallback_host, 465, timeout=12)
            server.login(settings.mail_username, settings.mail_password)
            server.sendmail(settings.mail_from, to_email, msg.as_string())
            server.quit()
            logger.info(f"Successfully sent OTP email to {to_email} via SSL Port 465 fallback.")
            return True
        except Exception as fallback_exc:
            logger.error(f"Failed to send OTP email to {to_email} via SMTP fallback: {fallback_exc}")
            return True
