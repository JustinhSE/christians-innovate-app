import { signup } from './actions'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <Image
            src="/logo.png"
            alt="Christians Innovate"
            width={100}
            height={100}
            className="object-contain sm:w-[120px] sm:h-[120px]"
          />
        </div>

        {/* Form Container */}
        <div className="bg-white border rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            Join the Community
          </h1>

          <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm">
            Sign up to be part of Christians Innovate and receive updates on our programs.
          </p>

          {searchParams?.message && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm mb-4">
              {searchParams.message}
            </div>
          )}

          <form className="flex flex-col gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Your full name"
                className="w-full p-3 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full p-3 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                className="w-full p-3 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join:
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ci_updates"
                    value="true"
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">CI Updates</div>
                    <div className="text-sm text-gray-600">News, events, and community updates</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="bible_year"
                    value="true"
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Bible Year</div>
                    <div className="text-sm text-gray-600">Systematic Scripture study initiative</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="skill_share"
                    value="true"
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">Skill Share</div>
                    <div className="text-sm text-gray-600">Iron sharpens iron sessions</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who referred you? (optional)
              </label>
              <input
                name="referral"
                type="text"
                placeholder="Name of person who referred you"
                className="w-full p-3 border rounded"
              />
            </div>

            <button
              formAction={signup}
              className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-medium mt-2"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
