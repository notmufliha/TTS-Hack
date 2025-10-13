// app/page.tsx
"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import ReferralManagement from './routes/page';

export default function Home() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">TTS Hospital</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/routes"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Home
              </Link>
              <Link 
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Referral Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to TTS Hospital
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive healthcare services with advanced referral management system
          </p>
          
          {/* Dashboard CTA */}
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Referral Management System
            </h2>
            <p className="text-gray-600 mb-6">
              Access our advanced dashboard to manage patient referrals, track status, 
              and coordinate care across departments.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Referral Dashboard
            </Link>
          </div>
        </div>

      
      </div>
    </div>
  );
}