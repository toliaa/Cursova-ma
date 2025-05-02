import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Higher Education Institution. All rights reserved.
          </p>
        </div>
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/about" className="text-gray-400 hover:text-gray-300">
            About
          </Link>
          <Link href="/news" className="text-gray-400 hover:text-gray-300">
            News
          </Link>
          <Link href="/gallery" className="text-gray-400 hover:text-gray-300">
            Gallery
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-gray-300">
            Contact
          </Link>
          <Link href="/reports" className="text-gray-400 hover:text-gray-300">
            Reports
          </Link>
        </div>
      </div>
    </footer>
  )
}
