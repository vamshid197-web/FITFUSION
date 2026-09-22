import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ showTagline = false, size = 'default', to = '/' }) {
  const isLarge = size === 'large';

  return (
    <Link to={to} className="inline-flex flex-col group items-start">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-accent transition-transform group-hover:scale-125" />
        <span
          className={`font-black tracking-widest text-brand-dark uppercase transition-colors group-hover:text-brand-accent ${
            isLarge ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
          }`}
        >
          FIT<span className="font-light text-brand-accent">FUSION</span>
        </span>
      </div>
      {showTagline && (
        <span className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-brand-muted pl-4">
          Design It. Customize It. Wear It.
        </span>
      )}
    </Link>
  );
}
