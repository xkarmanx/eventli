// src/shared/components/ui/BoostingModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { X, Loader2, Crown, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createBoostCheckoutSession, getBoostPageData } from '@/features/boosting/actions';

// Infer types from our server action for full type safety
type Plan    = Awaited<ReturnType<typeof getBoostPageData>>['plans'][0];
type Listing = Awaited<ReturnType<typeof getBoostPageData>>['listings'][0];

interface BoostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
}

export default function BoostingModal({ isOpen, onClose, listing }: BoostingModalProps) {
  const [plans, setPlans]                   = useState<Plan[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isRedirecting, setIsRedirecting]   = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch available boost plans whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getBoostPageData()
      .then(data => setPlans(data.plans))
      .catch(err => toast.error(err.message || 'Failed to load boost plans.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  // Don’t render if closed or no listing passed
  if (!isOpen || !listing) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target) onClose();
  };

  const handleConfirmBoost = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a boost plan.');
      return;
    }
    setIsRedirecting(true);
    toast.info('Redirecting to secure checkout...');
    try {
      // Server action will redirect to Stripe
      await createBoostCheckoutSession(selectedPlanId, listing.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout session.');
      setIsRedirecting(false);
    }
  };

  // Choose an icon based on plan.priority_level
  const getPlanIcon = (plan: Plan) => {
    if ('priority_level' in plan) {
      if (plan.priority_level >= 3) return Crown;
      if (plan.priority_level === 2) return Zap;
      if (plan.priority_level === 1) return TrendingUp;
    }
    return TrendingUp;
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Boost Your Listing</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected listing info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600">You are boosting:</p>
          <p className="font-semibold text-teal-700">{listing.title}</p>
        </div>

        {/* Plan options */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : (
            plans.map(plan => {
              const Icon = getPlanIcon(plan);
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={isSelected ? 'bg-teal-100 p-3 rounded-lg' : 'bg-gray-100 p-3 rounded-lg'}>
                      <Icon className={isSelected ? 'w-6 h-6 text-teal-600' : 'w-6 h-6 text-gray-500'} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{plan.name}</h4>
                      <p className="text-sm text-gray-500">{plan.duration_days} days of boosted visibility</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${plan.price}</p>
                      {isSelected && <CheckCircle className="w-5 h-5 text-teal-600 mx-auto mt-1" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 mt-auto border-t border-gray-200">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-teal-600 hover:bg-teal-700"
            onClick={handleConfirmBoost}
            disabled={!selectedPlanId || isRedirecting || isLoading}
          >
            {isRedirecting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue to Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
