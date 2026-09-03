import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import { submitPayPalSuccess } from "../../Api/payoutApi";
import { useAuth } from "../AuthProvider";
import { toast } from "sonner";

const PayPalSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  const handlePayPalOnboardingComplete = useCallback(async (paypalData) => {
    try {
      setStatus("loading");
      setMessage("Finalizing PayPal account linking...");

      // Check if user is authenticated
      if (!user?.user) {
        toast.error("Please login to complete PayPal linking");
        navigate("/login");
        return;
      }

      // Get the auth token from localStorage
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      const response = await submitPayPalSuccess(token, paypalData);

      if (response.success) {
        setStatus("success");
        setMessage("Your PayPal account has been successfully linked!");
        toast.success("PayPal account linked successfully!");
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/instructor/payout");
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to complete PayPal linking");
      }
    } catch (error) {
      console.error("Error completing PayPal onboarding:", error);
      setStatus("error");
      const errorMessage = error.response?.data?.message || error.message || "Failed to complete PayPal account linking. Please try again.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  }, [navigate, user]);

  useEffect(() => {
    // Add a small delay to allow auth context to load
    const checkAuthAndProcess = () => {
      // Check if user is authenticated first
      if (!user?.user) {
        // Give some time for auth context to load before redirecting
        const timer = setTimeout(() => {
          if (!user?.user) {
            toast.error("Please login to access this page");
            navigate("/login");
          }
        }, 1000);
        return () => clearTimeout(timer);
      }

      const queryParams = new URLSearchParams(window.location.search);
      const statusParam = queryParams.get("status");
      const userId = queryParams.get("userId");
      const errorMessage = queryParams.get("message");
      
      // PayPal onboarding completion parameters
      const merchantId = queryParams.get("merchantId");
      const merchantIdInPayPal = queryParams.get("merchantIdInPayPal");
      const productIntentId = queryParams.get("productIntentId");
      const isEmailConfirmed = queryParams.get("isEmailConfirmed");
      const permissionsGranted = queryParams.get("permissionsGranted");
      const consentStatus = queryParams.get("consentStatus");

      // Handle PayPal onboarding completion
      if (merchantId && merchantIdInPayPal && productIntentId && isEmailConfirmed && permissionsGranted && consentStatus) {
        handlePayPalOnboardingComplete({
          merchantId,
          merchantIdInPayPal,
          productIntentId,
          isEmailConfirmed,
          permissionsGranted,
          consentStatus
        });
        return;
      }

      // Handle existing logic for status-based redirects
      if (statusParam === "linked" && userId) {
        setStatus("success");
        setMessage("Your PayPal account has been successfully linked!");
        toast.success("PayPal account linked successfully!");
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate("/instructor/payout");
        }, 3000);
      } else if (errorMessage) {
        setStatus("error");
        setMessage("Failed to link PayPal account. Please try again.");
        toast.error("Failed to link PayPal account");
      } else {
        setStatus("error");
        setMessage("Invalid redirect parameters.");
        toast.error("Invalid redirect parameters");
      }
    };

    checkAuthAndProcess();
  }, [navigate, handlePayPalOnboardingComplete, user]);

  const handleGoToPayout = () => {
    navigate("/instructor/payout");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processing PayPal connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === "success" ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className={`text-xl ${status === "success" ? "text-green-700" : "text-red-700"}`}>
              {status === "success" ? "PayPal Connected!" : "Connection Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              {message}
            </p>
            
            {status === "success" && (
              <div className="text-sm text-gray-500">
                You will be redirected to the payout page in a few seconds...
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGoToPayout}
                className="flex-1"
                variant={status === "success" ? "default" : "outline"}
              >
                Go to Payout Page
              </Button>
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PayPalSuccess;