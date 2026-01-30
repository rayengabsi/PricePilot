'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Bell, BarChart3, Sparkles, Shield, Zap } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pilot-600 via-pilot-700 to-sky-700 p-[1px] shadow-glow"
      >
        <div className="rounded-3xl bg-white/98 px-6 py-16 dark:bg-neutral-950/98 sm:py-24">
          <motion.div variants={item} className="relative text-center">
            <motion.div
              variants={item}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-pilot-200 bg-pilot-50 px-4 py-1.5 text-sm font-medium text-pilot-700 dark:border-pilot-800 dark:bg-pilot-900/30 dark:text-pilot-300"
            >
              <Sparkles className="h-4 w-4" />
              AI-powered price tracking
            </motion.div>
            <h1 className="text-display-sm font-bold tracking-tight text-neutral-900 dark:text-white sm:text-display">
              <span className="bg-gradient-to-r from-pilot-600 to-sky-600 bg-clip-text text-transparent dark:from-pilot-400 dark:to-sky-400">
                PricePilot
              </span>
              <br />
              Never overpay again
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-600 dark:text-neutral-400">
              Search products, set price alerts, and get notified when prices drop. Compare across stores in one place.
            </p>
            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-pilot-600 to-sky-600 px-6 py-3.5 text-base font-medium text-white shadow-pilot transition hover:from-pilot-700 hover:to-sky-700 hover:shadow-pilot-lg sm:w-auto"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-base font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:w-auto"
              >
                Sign in
              </Link>
            </motion.div>
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-body-sm text-neutral-500 dark:text-neutral-400"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success-500" />
                Secure & private
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning-500" />
                Real-time alerts
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-64px' }}
        transition={{ duration: 0.4 }}
        className="mt-20 grid gap-6 sm:grid-cols-3"
      >
        {[
          {
            icon: Search,
            title: 'Search & Compare',
            description: 'Real-time product search across stores. Filter by category and price.',
            href: '/search',
          },
          {
            icon: Bell,
            title: 'Price Alerts',
            description: 'Set target prices and get notified when they drop. Never miss a deal.',
            href: '/alerts',
          },
          {
            icon: BarChart3,
            title: 'Dashboard',
            description: 'Overview of your alerts and triggered prices in one place.',
            href: '/dashboard',
          },
        ].map((f) => (
          <Link key={f.title} href={f.href}>
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-card transition hover:border-pilot-200 hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-pilot-800"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-pilot-100 text-pilot-600 transition group-hover:bg-pilot-200 dark:bg-pilot-900/50 dark:text-pilot-400 dark:group-hover:bg-pilot-900/70">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-body-sm text-neutral-600 dark:text-neutral-400">
                {f.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </motion.section>
    </div>
  );
}
