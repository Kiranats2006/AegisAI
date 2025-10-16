export default function Footer() {
  return (
    <footer className="bg-background-light dark:bg-background-dark border-t border-white/10">
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        Dark mode section
      </div>

      <div className="bg-gray-100 text-black p-6 rounded-lg mt-4">
        Light mode section
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <a className="text-sm text-white/60 hover:text-primary" href="#">
              Privacy Policy
            </a>
            <a className="text-sm text-white/60 hover:text-primary" href="#">
              Contact
            </a>
            <a className="text-sm text-white/60 hover:text-primary" href="#">
              About
            </a>
          </div>
          <p className="text-sm text-white/60">
            © 2024 AegisAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
