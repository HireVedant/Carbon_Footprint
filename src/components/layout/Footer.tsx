import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Linkedin, Mail, Heart, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Calculator', path: '/calculator' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'API Access', path: '#' },
    { name: 'Pricing', path: '#' },
  ],
  Company: [
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '#' },
    { name: 'Careers', path: '#' },
    { name: 'Contact', path: '#' },
  ],
  Resources: [
    { name: 'Documentation', path: '#' },
    { name: 'Community', path: '#' },
    { name: 'Support', path: '#' },
    { name: 'Status', path: '#' },
  ],
  Legal: [
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
    { name: 'Cookie Policy', path: '#' },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-dark-950" id="footer">
      {/* Gradient top border effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      <div className="container-max mx-auto section-padding">
        {/* Newsletter CTA */}
        <div className="glass p-8 sm:p-10 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Stay updated on <span className="gradient-text">sustainability</span>
              </h3>
              <p className="text-dark-400 max-w-md">
                Get weekly insights on reducing your carbon footprint with AI-powered tips.
              </p>
            </div>
            <div className="flex w-full lg:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                id="footer-email-input"
                className="input-field flex-1 lg:w-72"
              />
              <button className="btn-primary whitespace-nowrap" id="footer-subscribe-btn">
                Subscribe
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-dark-400 hover:text-primary-400 transition-colors duration-300 flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-dark-400">
              © {new Date().getFullYear()} EcoTrack AI. Built with{' '}
              <Heart className="w-3 h-3 inline text-red-400" /> for the planet.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                id={`footer-social-${social.label.toLowerCase()}`}
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-white/10 transition-all duration-300"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
