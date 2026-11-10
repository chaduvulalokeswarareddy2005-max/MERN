import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Travel<span className="text-teal-400">Ease</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              TravelEase is a premier full-stack tour planning platform. Discover top destinations, curate personal itineraries, and make demo bookings with ease.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-teal-300 font-medium">
              <Shield className="w-3.5 h-3.5" />
              College Project Demo Ready
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/destinations" className="hover:text-teal-400 transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-teal-400 transition-colors">
                  Curated Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-teal-400 transition-colors">
                  Personal Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-teal-400 transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-teal-400 transition-colors">
                  Saved Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/destinations?category=Hill%20Station" className="hover:text-teal-400 transition-colors">
                  Hill Stations (Ooty, Manali, Kashmir)
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Beaches" className="hover:text-teal-400 transition-colors">
                  Beach Escapes (Goa, Bali)
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Cultural" className="hover:text-teal-400 transition-colors">
                  Heritage & Culture (Jaipur)
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Nature" className="hover:text-teal-400 transition-colors">
                  Nature & Backwaters (Kerala)
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Family" className="hover:text-teal-400 transition-colors">
                  Family Getaways (Singapore)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Admin Demo */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Demo Support
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@travelease.demo</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 98765 43210 (Demo Hotline)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>MERN Stack Campus Showcase</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin"
                  className="inline-block text-xs font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-4"
                >
                  Go to Demo Admin Dashboard &rarr;
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TravelEase. Built for Academic Project Demonstration.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400">About Us</Link>
            <Link to="/contact" className="hover:text-slate-400">Contact</Link>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for College Showcase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
