import React from 'react'

function Footer() {
  return (
    <footer className="bg-white shadow-md py-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6">
      
      {/* Left: Brand */}
      <div className="text-center md:text-left mb-4 md:mb-0">
        <h2 className="text-2xl font-bold text-gray-900">SustainaFood</h2>
        <p className="text-gray-600 text-sm">Bringing innovation to your fingertips.</p>
      </div>
  
      {/* Center: Navigation Links */}
      <nav className="flex space-x-6 text-gray-700">
        <a href="#" className="hover:text-gray-900">Home</a>
        <a href="#" className="hover:text-gray-900">Features</a>
        <a href="#" className="hover:text-gray-900">About</a>
        <a href="#" className="hover:text-gray-900">Contact</a>
      </nav>
  
      {/* Right: Social Media Icons */}
      <div className="flex space-x-4 mt-4 md:mt-10">
        <a href="#" className="text-gray-700 hover:text-gray-900">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Facebook_Logo_2023.png" alt="Facebook" className="h-6 w-6" />
        </a>
        <a href="#" className="text-gray-700 hover:text-gray-900">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Instagram_logo_2016.svg" alt="Instagram" className="h-6 w-6" />
        </a>
        <a href="#" className="text-gray-700 hover:text-gray-900">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/60/Twitter_Logo_as_of_2021.svg" alt="Twitter" className="h-6 w-6" />
        </a>
      </div>
    </div>
  
    {/* Bottom Section */}
    <div className="text-center text-gray-500 text-sm mt-4">
      © {new Date().getFullYear()} MyApp. All rights reserved.
    </div>
  </footer>

  )
}

export default Footer