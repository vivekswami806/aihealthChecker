import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Heart className="text-primary-foreground w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-bold">HealthAI Pro</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right Side - Visual / Content */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-primary/10">
          <div className="absolute inset-0 flex flex-col justify-center px-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-foreground tracking-tight leading-tight">
                Securely Analyze Your Health <br /> 
                <span className="text-primary">With AI Precision</span>
              </h2>
              <div className="space-y-4">
                {[
                  "HIPAA-compliant data encryption",
                  "AI-driven medical report analysis",
                  "Consistently 99% accuracy in detection",
                  "Personalized wellness recommendations"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center space-x-3 text-lg text-muted-foreground"
                  >
                    <CheckCircle2 className="text-primary h-6 w-6" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-10 right-10">
            <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          </div>
          <div className="absolute top-10 left-10">
            <div className="w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
