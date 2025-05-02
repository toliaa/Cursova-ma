import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Our Institution</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Providing quality education and accounting services for over 50 years
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            Our mission is to provide exceptional education in accounting and finance, preparing students for successful
            careers in the financial sector. We strive to maintain the highest standards of academic excellence and
            professional integrity.
          </p>
          <p className="text-gray-600">
            Through innovative teaching methods, practical experience, and a commitment to ethical practices, we aim to
            develop the next generation of financial leaders who will shape the future of the industry.
          </p>
        </div>
        <div className="relative h-[400px]">
          <Image
            src="/placeholder.svg?height=800&width=600"
            alt="Campus building"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="order-2 md:order-1 relative h-[400px]">
          <Image
            src="/placeholder.svg?height=800&width=600"
            alt="Students in classroom"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
          <p className="text-gray-600 mb-4">
            We envision being a leading institution in accounting education, recognized globally for our academic
            excellence, innovative research, and the success of our graduates in the financial world.
          </p>
          <p className="text-gray-600">
            We aim to foster a community of lifelong learners who are equipped with the knowledge, skills, and ethical
            foundation necessary to make meaningful contributions to the field of accounting and finance.
          </p>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Excellence</h3>
            <p className="text-gray-600">
              We pursue excellence in all aspects of education, research, and service to our community.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Integrity</h3>
            <p className="text-gray-600">
              We uphold the highest standards of honesty, transparency, and ethical behavior.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Innovation</h3>
            <p className="text-gray-600">
              We embrace innovation in teaching, learning, and the application of accounting principles.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
