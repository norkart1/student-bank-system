import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p>
              Welcome to JDSA Students Bank. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our educational banking platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Student identification details (Name, Student Code)</li>
              <li>Academic information (Year/Session)</li>
              <li>Transaction history and account balances</li>
              <li>Profile images (if uploaded)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Manage and maintain student bank accounts</li>
              <li>Process deposits and withdrawals</li>
              <li>Generate financial reports for educational purposes</li>
              <li>Provide a personalized dashboard for students and administrators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. This includes password hashing, 
              secure session management, and encrypted database connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Sharing</h2>
            <p>
              We do not sell or share your personal information with third parties for marketing purposes. 
              Information is only used within the JDSA Students Bank ecosystem for educational management.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
            <p>
              Students and administrators have the right to access their data and request corrections. 
              Account deletions must be managed through the administrative interface.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact the institution administration.
            </p>
          </section>
        </div>
        
        <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </footer>
      </div>
    </div>
  );
}
