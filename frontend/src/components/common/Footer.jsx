import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-neutral-300 pt-12 pb-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="brightness-125">
              <Logo to="/" showTagline={false} />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Design It. Customize It. Wear It. We empower personal expression through bespoke garment tailoring, master fabric curation, and signature scent pairing.
            </p>
            <div className="text-[11px] text-brand-accent font-medium">
              Precision Crafted &bull; Made to Measure
            </div>
          </div>

          {/* Col 2: Custom Collections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link to="/shop?category=Shirts" className="hover:text-white transition-colors">
                  Custom Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=T-Shirts" className="hover:text-white transition-colors">
                  Heavyweight T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jackets" className="hover:text-white transition-colors">
                  Bespoke Blazers & Jackets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Jeans/Pants" className="hover:text-white transition-colors">
                  Tailored Chinos & Trousers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Traditional%20Wear" className="hover:text-white transition-colors">
                  Artisan Ethnic Wear
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Fitting */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Tailoring & Support
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Measurement Guide
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Order Progress
                </Link>
              </li>
              <li>
                <Link to="/customize/1" className="hover:text-white transition-colors">
                  Interactive Customizer
                </Link>
              </li>
              <li>
                <span className="text-neutral-500 cursor-not-allowed">
                  Fabric Swatch Delivery (Phase 3)
                </span>
              </li>
              <li>
                <span className="text-neutral-500 cursor-not-allowed">
                  Fit Guarantee Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Development */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              FITFUSION System
            </h4>
            <p className="text-xs text-neutral-400 mb-3">
              Currently in active Phase 1 development. Seamlessly preparing the bespoke digital fashion architecture.
            </p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-block text-[11px] font-medium text-neutral-400 hover:text-brand-accent transition-colors"
              >
                &rarr; Admin Management Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>&copy; 2026 FITFUSION. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Tailoring Ethics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
