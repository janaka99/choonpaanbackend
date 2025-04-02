import Image from "next/image"
import { ArrowRight, Download } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b  max-w-7xl mx-auto px-5 md:px-10">
      <div className="container px-4 py-16 md:py-24 lg:py-32">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl  whitespace-nowrap">CHOONPAAN OPTIM <span className="text-amber-500">AI</span></h1>

            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-300">
  <Download size={18} />
  Download App
</button>

<button className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-300 transition duration-300">
  Learn More
  <ArrowRight size={18} />
</button>

            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-gray-200">
      
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">1,000+</span> happy users
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative h-[500px] w-[250px] overflow-hidden rounded-[40px] border-[8px] border-gray-800 bg-gray-800 shadow-xl">
              <div className="absolute inset-0">
                <Image
                  src="/placeholder.jpeg?height=500&width=250"
                  width={250}
                  height={500}
                  alt="Mobile app screenshot"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute left-1/2 top-4 h-2 w-16 -translate-x-1/2 rounded-full bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

