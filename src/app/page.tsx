import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 to-teal-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Evintli</h1>
      <p className="text-lg text-center max-w-xl">
        This is the home page. You can sign up or log in using the links below.
      </p>
      <div className="mt-6 flex space-x-4">
        <a href="/auth/login" className="px-6 py-2 bg-blue-600 rounded text-white hover:bg-blue-700">Login</a>
        <a href="/auth/signup" className="px-6 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">Sign Up</a>
      </div>
    </main>
  );
}