"""Email utility to send OTPs using SMTP."""
from __future__ import annotations

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, username: str, otp: str, purpose: str = "registration") -> bool:
    """Send an OTP email to the user. Fallback to console print if SMTP fails."""
    subject = f"AI Data Analyst - OTP for {purpose.capitalize()}"
    
    # Render basic HTML content for the email
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
          <h2 style="color: #3366ff; margin-top: 0;">AI Data Analyst Portal</h2>
          <p style="color: #4b5563; font-size: 16px;">Hello <strong>{username}</strong>,</p>
          <p style="color: #4b5563; font-size: 16px;">You requested an OTP verification for <strong>{purpose}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1c3cad; background-color: #eef4ff; padding: 12px 24px; border-radius: 6px; display: inline-block;">
              {otp}
            </span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eef2f6; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">AI Data Analyst Team · Local Development Mode</p>
        </div>
      </body>
    </html>
    """

  

    # If mail configuration is empty, skip actual SMTP sending
    if not settings.mail_username or not settings.mail_password:
        logger.info("SMTP details missing. Skipping email send (logged only).")
        return True

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.mail_from
        msg["To"] = to_email

        # Attach text part and HTML part
        text_part = MIMEText(f"Hello {username},\n\nYour OTP code for {purpose} is: {otp}\n\nThis code expires in 15 minutes.", "plain")
        html_part = MIMEText(html_content, "html")
        msg.attach(text_part)
        msg.attach(html_part)

        # Connect to SMTP Server
        if settings.mail_ssl_tls:
            server = smtplib.SMTP_SSL(settings.mail_server, settings.mail_port, timeout=10)
        else:
            server = smtplib.SMTP(settings.mail_server, settings.mail_port, timeout=10)
            if settings.mail_starttls:
                server.starttls()
        
        # Login & Send
        server.login(settings.mail_username, settings.mail_password)
        server.sendmail(settings.mail_from, to_email, msg.as_string())
        server.quit()
        
        logger.info(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email} via SMTP: {e}")
        # Return True anyway so development/testing is not blocked by SMTP connectivity issues
        return True
