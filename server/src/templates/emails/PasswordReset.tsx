// src/templates/emails/ResetPasswordEmail.tsx
import * as React from "react";

type ResetPasswordEmailProps = {
  userName?: string;
  resetUrl: string;
};

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#f6f6f6",
    fontFamily: "Arial, sans-serif"
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "20px"
  },
  heading: {
    color: "#333",
    fontSize: "20px",
    margin: "0 0 10px"
  },
  text: {
    color: "#555",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: "0 0 15px"
  },
  button: {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#1a73e8",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "4px"
  },
  smallText: {
    color: "#999",
    fontSize: "12px",
    margin: "10px 0"
  },
  hr: {
    border: 0,
    borderTop: "1px solid #eee",
    margin: "20px 0"
  },
  footer: {
    color: "#777",
    fontSize: "12px"
  },
  link: {
    wordBreak: "break-all",
    color: "#1a73e8",
    fontSize: "12px"
  }
};

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  userName,
  resetUrl
}) => {
  return (
    <html>
      <body style={styles.body}>
        <table style={styles.container}>
          <tr>
            <td>
              <h2 style={styles.heading}>Reset your password</h2>

              <p style={styles.text}>{userName ? `Hi ${userName},` : "Hi,"}</p>

              <p style={styles.text}>
                We received a request to reset your password. Click the button
                below to choose a new one.
              </p>

              <a href={resetUrl} style={styles.button}>
                Reset Password
              </a>

              <p style={styles.smallText}>
                This link will expire in 15 minutes. If you didn’t request a
                password reset, you can safely ignore this email.
              </p>

              <hr style={styles.hr} />

              <p style={styles.footer}>
                If the button doesn’t work, copy and paste this URL into your
                browser:
              </p>

              <p style={styles.link}>{resetUrl}</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

export default ResetPasswordEmail;
