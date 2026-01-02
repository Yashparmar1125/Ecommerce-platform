import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  const categories = ['Women', 'Men', 'Accessories', 'Essentials', 'New Arrivals', 'Editorial']
  const links = ['About', 'Contact', 'Shipping', 'Returns', 'Privacy', 'Terms']

  return (
    <footer className="bg-background border-t border-soft mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="brand-wordmark text-lg mb-6">NŌIRÉ</h3>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
              Quiet luxury. Editorial fashion. Minimal confidence.
            </p>
          </div>

          {/* Collection */}
          <div>
            <h4 className="text-xs font-medium text-primary uppercase tracking-wider mb-6">Collection</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/products?category=${category}`}
                    className="hover:text-primary transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-xs font-medium text-primary uppercase tracking-wider mb-6">Information</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              {links.map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase()}`}
                    className="hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium text-primary uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>hello@noire.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-soft">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} NŌIRÉ. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Shipping'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="text-xs text-neutral-500 hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
