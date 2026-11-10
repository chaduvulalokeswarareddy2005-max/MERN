import React from 'react';
import { Compass, ShieldCheck, Heart, Users, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider border border-teal-100">
          <Compass className="w-4 h-4 text-teal-600" />
          <span>About TravelEase</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
          Crafting Personalized Journeys
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          TravelEase was created as a modern, end-to-end full stack tour planning platform demonstrating rich web design, MongoDB database persistence, and effortless holiday planning.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900">Curated Destinations</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hand-vetted vacation spots across India and international retreats, complete with estimated daily budgets and local attractions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900">Personal Trip Planner</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Build custom day-by-day itineraries, add scheduled activities, record costs, and track spending against your holiday target budget.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900">Reliable MERN Core</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Connected end-to-end via Express.js REST APIs and MongoDB Mongoose schemas with real database calculations and inventory management.
          </p>
        </div>
      </div>

      {/* College Project Callout */}
      <div className="bg-navy-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ready to explore our curated tours?
          </h2>
          <p className="text-xs text-slate-300">
            Browse our featured destinations or create your personalized custom trip right now.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/destinations"
            className="py-3 px-5 rounded-xl font-bold text-xs text-navy-900 bg-white hover:bg-slate-100 transition shadow-md"
          >
            Explore Destinations
          </Link>
          <Link
            to="/my-trips/new"
            className="py-3 px-5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 transition shadow-md"
          >
            Plan a Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
