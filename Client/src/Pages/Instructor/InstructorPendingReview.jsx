import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { axiosClient } from "../../AxiosClient/axios";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

const InstructorPendingReview = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.user);
  const [instructorData, setInstructorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorStatus = async () => {
      try {
        if (user?.instructor) {
          const response = await axiosClient.get(
            `/api/instructor/${user.instructor}`
          );
          setInstructorData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch instructor status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructorStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const isWaitlisted = instructorData?.registrationStatus === "waitlist";
  const isVerified = instructorData?.documentVerified === "verified";
  const isRejected = instructorData?.documentVerified === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
      <Card className="w-full max-w-lg p-8 border border-gray-200">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            {isRejected ? (
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            ) : isVerified ? (
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-black mb-2">
              {isRejected
                ? "Application Rejected"
                : isVerified
                  ? "Application Approved"
                  : "Application Under Review"}
            </h1>

            {isWaitlisted && !isVerified && !isRejected && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-black mb-1">
                      You are on the waitlist
                    </p>
                    <p className="text-sm text-gray-600">
                      The registration limit for your selected adventure and
                      location has been reached. You will be notified as soon as
                      a spot becomes available.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-4">
              {isRejected
                ? "Unfortunately, your application has been rejected. Please contact support for more information."
                : isVerified
                  ? "Your application has been approved! You can now start teaching."
                  : isWaitlisted
                    ? "Your documents are being reviewed. Due to high demand, you have been placed on the waitlist."
                    : "Thank you for registering as an instructor! Your information and documents are under review. We will contact you soon."}
            </p>
          </div>

          <Button
            className="w-full bg-black hover:bg-gray-800 text-white"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InstructorPendingReview;

