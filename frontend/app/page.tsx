"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "./components/Button";
import FeatureCard from "./components/FeatureCard";

export default function Home() {
  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Batch Payments",
      description:
        "Execute multiple payouts in a single transaction on Flare using USDT0, reducing gas costs and processing time significantly.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Verified Records",
      description:
        "All payments are verified on-chain and through ProofRails, providing immutable proof for accounting and compliance purposes.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: "Comprehensive Reports",
      description:
        "Generate detailed reports and analytics for all payouts, with export options for accounting and tax purposes.",
    },
  ];

  const useCases = [
    {
      title: "Affiliate Programs",
      description:
        "Automate affiliate commission payouts to hundreds of partners with structured payment records for tax compliance.",
      icon: "👥",
    },
    {
      title: "Content Creator Rewards",
      description:
        "Distribute rewards to contributors, creators, and community members efficiently with transparent on-chain records.",
      icon: "🎨",
    },
    {
      title: "Payroll & Salaries",
      description:
        "Streamline payroll processing for remote teams with batch payments and automated record-keeping.",
      icon: "💼",
    },
    {
      title: "Bounty Programs",
      description:
        "Manage bug bounties, hackathon prizes, and contributor rewards with verifiable payment proofs.",
      icon: "🏆",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Recipients",
      description:
        "Add multiple recipients via CSV upload or manual entry. Our system validates all addresses before processing.",
    },
    {
      number: "02",
      title: "Review & Approve",
      description:
        "Review the payout summary, total amount, and recipient list. Approve the transaction when ready.",
    },
    {
      number: "03",
      title: "Execute Batch Payment",
      description:
        "Execute all payments in a single transaction on Flare using USDT0. Monitor real-time status updates.",
    },
    {
      number: "04",
      title: "Get Verified Records",
      description:
        "Receive structured payment records verified on-chain and through ProofRails for each recipient.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">
                Railpay
              </h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Admin
              </Link>
              <Link
                href="/recipient"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Recipient Portal
              </Link>
              <ConnectButton chainStatus="icon" showBalance={false} />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <span>⚡</span>
            <span>Built on Flare Network</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Batch Payout Infrastructure
            <br />
            <span className="bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">
              for Web3 Teams
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Pay hundreds of recipients at once with structured, verifiable payment
            records. Built for platforms, teams, and organizations that need
            professional payout infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/admin">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/recipient">
              <Button variant="secondary" size="lg">
                View My Payments
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                100+
              </div>
              <div className="text-gray-600">Recipients per Batch</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                50%
              </div>
              <div className="text-gray-600">Gas Cost Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                100%
              </div>
              <div className="text-gray-600">On-Chain Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional payout infrastructure with all the features you need for
              seamless batch payments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and efficient batch payout process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-green-200 -z-10" />
                )}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perfect For
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're running an affiliate program or managing team payroll,
              Railpay scales with your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="bg-gradient-to-br from-blue-600 to-green-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Railpay?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built for teams that need reliable, scalable payout infrastructure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Verified</h3>
              <p className="text-blue-100">
                All transactions are verified on-chain and through ProofRails for
                complete transparency and auditability.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-blue-100">
                Batch multiple payments into a single transaction, reducing gas costs
                and processing time significantly.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Complete Records</h3>
              <p className="text-blue-100">
                Generate structured payment records for accounting, tax compliance,
                and recipient verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built on Flare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Leveraging Flare's infrastructure for secure, efficient payments
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Flare Network
              </h3>
              <p className="text-gray-600">
                Built on Flare's secure, scalable blockchain infrastructure
              </p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">💵</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                USDT0
              </h3>
              <p className="text-gray-600">
                Native USDT0 token for all payments on Flare
              </p>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ProofRails
              </h3>
              <p className="text-gray-600">
                Integrated with ProofRails for verifiable payment records
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-green-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start processing batch payouts today. Connect your wallet and begin
            managing your payouts in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                Start Payouts
              </Button>
            </Link>
            <Link href="/recipient">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10">
                View Recipient Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Railpay</h3>
              <p className="text-sm">
                Professional batch payout infrastructure built on Flare Network.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/recipient" className="hover:text-white transition-colors">
                    Recipient Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://flare.network"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Flare Network
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.flare.network"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Network</h4>
              <p className="text-sm mb-2">Flare Testnet</p>
              <p className="text-xs text-gray-500">
                Chain ID: 114
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2024 Railpay. Built on Flare Network.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
