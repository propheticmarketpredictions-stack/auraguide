import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tv, Sparkles, MapPin, Calendar, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: "welcome", icon: Tv },
  { id: "name", icon: User },
  { id: "birthday", icon: Calendar },
  { id: "location", icon: MapPin },
];

export default function OnboardingModal({ open, onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: "", birthday: "", location: "" });

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleSkip = () => {
    onComplete(profile);
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return profile.name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden p-0">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Tv className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold">Welcome to Channel Guide</h2>
                    <p className="text-muted-foreground mt-2 font-body text-sm">
                      Your personal AI-powered TV & streaming assistant. Let's personalize your experience.
                    </p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-heading font-bold">What's your name?</h2>
                    <p className="text-muted-foreground text-sm mt-1">So we can personalize your guide</p>
                  </div>
                  <div>
                    <Input
                      placeholder="Enter your name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-secondary border-border text-foreground h-12 text-center text-lg"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <Calendar className="w-7 h-7 text-accent" />
                    </div>
                    <h2 className="text-xl font-heading font-bold">When's your birthday?</h2>
                    <p className="text-muted-foreground text-sm mt-1">Helps us suggest age-appropriate content</p>
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={profile.birthday}
                      onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                      className="bg-secondary border-border text-foreground h-12 text-center"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <MapPin className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-xl font-heading font-bold">Where are you located?</h2>
                    <p className="text-muted-foreground text-sm mt-1">For local channels and regional content</p>
                  </div>
                  <div>
                    <Input
                      placeholder="City, State or ZIP code"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="bg-secondary border-border text-foreground h-12 text-center text-lg"
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 font-heading font-semibold"
            >
              {step === 0 ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Get Started
                </span>
              ) : step === steps.length - 1 ? (
                "Show Me What's On"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}