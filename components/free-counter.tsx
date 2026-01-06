import { Zap, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import { MAX_FREE_COUNTS } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";

export const FreeCounter = ({
  isPro = false,
  apiLimitCount = 0,
}: {
  isPro: boolean,
  apiLimitCount: number
}) => {
  const [mounted, setMounted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const proModal = useProModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetApiLimit = async () => {
    try {
      setIsResetting(true);
      await axios.get("/api/limit-reset");
      toast.success("API limit reset! Refresh the page to see the changes.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to reset API limit");
    } finally {
      setIsResetting(false);
    }
  };

  if (!mounted) {
    return null;
  }
  
  if (isPro) {
    return null;
  }

  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <p>
              {apiLimitCount} / {MAX_FREE_COUNTS} Free Generations
            </p>
            <Progress className="h-3" value={(apiLimitCount / MAX_FREE_COUNTS) * 100} />
          </div>
          <Button onClick={proModal.onOpen} variant="premium" className="w-full">
            Upgrade
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
          <Button 
            onClick={resetApiLimit} 
            disabled={isResetting}
            variant="outline" 
            className="w-full mt-2 text-white border-white/20 hover:bg-white/10"
          >
            Reset API Limit
            <RefreshCw className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}