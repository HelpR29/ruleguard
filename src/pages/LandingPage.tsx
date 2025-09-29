import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RuleGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Your Trading
              <span className="text-blue-600 block">Discipline</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              RuleGuard helps traders build unbreakable habits, track performance, and achieve consistent results through intelligent rule enforcement and behavioral analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                I Already Have an Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to help you develop trading discipline and achieve your financial goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rule Enforcement</h3>
              <p className="text-gray-600">
                Set personal trading rules and get real-time notifications when you need to stay disciplined.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-gray-600">
                Track your progress with detailed analytics and insights into your trading patterns.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community & Competition</h3>
              <p className="text-gray-600">
                Connect with other traders, compete on leaderboards, and share your journey to success.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Achievement System</h3>
              <p className="text-gray-600">
                Unlock achievements and badges as you progress, keeping you motivated and engaged.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600">
                Built-in risk controls and position sizing tools to protect your capital.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Journal & Reflection</h3>
              <p className="text-gray-600">
                Maintain a detailed trading journal with emotional tracking and performance reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of traders who are already building better habits and achieving consistent results.
          </p>
          <Link
            to="/signup"
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            Start Free Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">RuleGuard</span>
          </div>
          <p className="text-gray-400 text-center">
            © 2024 RuleGuard. Built by traders, for traders.
          </p>
        </div>
      </footer>
    </div>
  );
}
