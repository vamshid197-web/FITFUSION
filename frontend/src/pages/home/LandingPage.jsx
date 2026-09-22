import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import PageContainer from '../../components/common/PageContainer.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';

export default function LandingPage() {
  const featuredPreview = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentLight border border-brand-accent/30 text-brand-accent text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              Bespoke Digital Tailoring Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-dark leading-[1.15]">
              Design It. <br />
              <span className="text-brand-accent">Customize It.</span> <br />
              Wear It.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Create clothing that matches your style, fit and personality. Choose certified master fabrics, personalize every styling accent, input custom measurements, and discover your signature fragrance pairing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button to="/customize/1" variant="secondary" size="lg" className="w-full sm:w-auto">
                Customize Now
              </Button>
              <Button to="/shop" variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Collection
              </Button>
            </div>

            {/* Quick stats/trust markers */}
            <div className="pt-6 border-t border-neutral-200/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <div className="text-lg sm:text-xl font-bold text-brand-dark">100%</div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">Made to Measure</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-brand-dark">50+</div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">Luxury Textiles</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-brand-dark">Scent</div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">Custom Pairing</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl bg-white border border-neutral-200/80 shadow-xl overflow-hidden p-6">
              {/* Graphic Card Banner */}
              <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-stone-100 via-amber-50 to-neutral-200 p-6 flex flex-col justify-between relative border border-neutral-200/60">
                <div className="flex justify-between items-start">
                  <span className="bg-white/90 backdrop-blur-sm text-brand-dark text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Bespoke Model No. 01
                  </span>
                  <span className="text-xs font-semibold text-brand-accent uppercase tracking-widest">
                    Spring / Summer
                  </span>
                </div>

                {/* Stylized Apparel Silhouette Illustration */}
                <div className="my-auto text-center py-8">
                  <div className="w-32 h-44 mx-auto rounded-xl bg-white/90 border border-brand-accent/20 shadow-lg flex flex-col items-center justify-center p-4 relative group">
                    <svg className="w-16 h-16 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v2l2 1v9a2 2 0 002 2h6a2 2 0 002-2v-9l2-1V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0h6"
                      />
                    </svg>
                    <div className="mt-3 text-[11px] font-bold text-brand-dark">Egyptian Giza Shirt</div>
                    <div className="text-[9px] text-neutral-500">Cutaway Collar &bull; French Cuff</div>
                  </div>
                </div>

                {/* Bottom Customization Callout */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-neutral-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-brand-dark">Tailored Fit Guarantee</p>
                    <p className="text-[10px] text-neutral-500">Precision custom metrics</p>
                  </div>
                  <Link
                    to="/customize/1"
                    className="text-xs font-bold text-brand-accent hover:text-brand-accentHover underline"
                  >
                    Customize &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* How Customization Works (3 Simple Steps) */}
      <section className="bg-white py-14 border-y border-neutral-200/80">
        <PageContainer>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              The FITFUSION Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
              Bespoke Luxury in Three Simple Steps
            </h2>
            <p className="text-sm text-neutral-600 mt-2">
              From artisan textiles to your doorstep, custom tailoring made effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-brand-cream border border-neutral-200/80 text-center sm:text-left space-y-3">
              <div className="w-10 h-10 rounded-full bg-brand-dark text-white font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-brand-dark">Choose Style & Fabric</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Select your apparel silhouette and explore 50+ handpicked textiles including Egyptian cotton, European linen, and Merino wool.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-brand-cream border border-neutral-200/80 text-center sm:text-left space-y-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent text-white font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-brand-dark">Personalize Details & Fit</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Customize collar cuts, cuff buttons, and monograms. Input custom tailor measurements or select adjusted standard sizing.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-brand-cream border border-neutral-200/80 text-center sm:text-left space-y-3">
              <div className="w-10 h-10 rounded-full bg-brand-dark text-white font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-brand-dark">Scent Pairing & Delivery</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Receive personalized fragrance suggestions complementing your garment style, expertly tailored and delivered to your door.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Featured Collection Previews */}
      <PageContainer>
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Curated Highlights
            </span>
            <h2 className="text-2xl font-extrabold text-brand-dark mt-0.5">
              Popular Customizable Silhouettes
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-brand-dark hover:text-brand-accent transition-colors underline underline-offset-4"
          >
            Browse All Custom Clothing &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPreview.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              {/* Image / Silhouette Area */}
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${product.silhouetteColor} p-6 flex flex-col justify-between relative`}
              >
                <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white text-brand-dark shadow-sm">
                  {product.category}
                </span>

                <div className="my-auto flex justify-center items-center">
                  <div className="w-20 h-28 rounded-lg bg-white/80 border border-neutral-300 shadow-sm flex flex-col items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <span className="text-[11px] font-bold text-neutral-800 text-center line-clamp-2">
                      {product.name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-neutral-700">
                  <span>From ${product.basePrice}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-amber-500">&#9733;</span> {product.rating}
                  </span>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                  <Button to={`/customize/${product.id}`} variant="secondary" size="sm" className="flex-1">
                    Customize
                  </Button>
                  <Button to={`/product/${product.id}`} variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
