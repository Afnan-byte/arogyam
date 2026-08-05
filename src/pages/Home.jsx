import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-50/50 to-white pt-14">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Centralized Campus Healthcare
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Arogya connects students, doctors, and administrators in one secure system. Access medical services, report illnesses, and manage campus wellness effortlessly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to={currentUser && userRole ? `/${userRole}` : "/login"}
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
              >
                Access Portal
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div id="features" className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A comprehensive health platform
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {[
              {
                name: 'Secure Records',
                description: 'Your medical data is securely stored and only accessible by authorized doctors.',
                icon: ShieldCheck,
              },
              {
                name: 'Real-time Tracking',
                description: 'Track your illness status, medical leaves, and medicine delivery in real-time.',
                icon: Activity,
              },
              {
                name: 'Community Support',
                description: 'Connect with other students, share wellness tips, and access emergency services.',
                icon: Users,
              },
            ].map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Home;
