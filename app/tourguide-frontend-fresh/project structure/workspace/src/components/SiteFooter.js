import React from "react";
import Link from "next/link";
import { WEBSITE_DISCLAIMER } from "../lib/legalContent";

const styles = {
  footer: { background: "#222e42", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "32px 0", textAlign: "center" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  footerLinks: { display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 12 },
  footerLink: { fontSize: 12, color: "rgba(240,242,245,0.7)", textDecoration: "none" },
  footerDisclaimer: { fontSize: 12, color: "rgba(240,242,245,0.52)", lineHeight: 1.8, maxWidth: 860, margin: "0 auto 12px" },
  footerText: { fontSize: 12, color: "rgba(240,242,245,0.4)" },
};

export default function SiteFooter() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.footerLinks}>
          <Link href="/about" style={styles.footerLink}>About</Link>
          <Link href="/terms-of-use" style={styles.footerLink}>Terms of Use</Link>
          <Link href="/disclaimer" style={styles.footerLink}>Disclaimer</Link>
          <Link href="/signup" style={styles.footerLink}>Register</Link>
          <Link href="/login" style={styles.footerLink}>Sign In</Link>
        </div>
        <p style={styles.footerDisclaimer}>{WEBSITE_DISCLAIMER}</p>
        <p style={styles.footerText}>© 2026 TravelRecord · Structured Travel Documentation Platform</p>
      </div>
    </footer>
  );
}