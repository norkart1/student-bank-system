import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using JDSA Students Bank, you agree to be bound by these Terms of Service. 
              This is an educational platform designed for school banking management.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Account Usage</h2>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Users are responsible for maintaining the confidentiality of their account credentials.</li>
              <li>Any unauthorized use of accounts must be reported to the administration immediately.</li>
              <li>The platform is for educational use only; real-world financial transactions are not handled by this system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Prohibited Activities</h2>
            <p>Users agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Attempt to gain unauthorized access to other users' accounts.</li>
              <li>Manipulate transaction data outside of provided administrative tools.</li>
              <li>Use the platform for any illegal or non-educational purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Limitation of Liability</h2>
            <p>
              JDSA Students Bank is provided "as is" without any warranties. As an educational tool, 
              we are not liable for any data loss or errors in balance calculations, though we strive for accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform 
              constitutes acceptance of the updated terms.
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
